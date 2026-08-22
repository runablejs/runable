import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
import type { NodePath } from "@babel/traverse";
import type {
  ImportDeclaration,
  ObjectExpression,
  ObjectProperty,
} from "@babel/types";

// @babel/traverse's ESM/CJS interop is inconsistent across bundler targets
// (varies between `^7` and the `^8` beta pinned in package.json) — always
// fall back to `.default` when the named export isn't callable directly.
const traverse = (
  typeof _traverse === "function"
    ? _traverse
    : (_traverse as unknown as { default: typeof _traverse }).default
) as typeof _traverse;

export interface ExtractedHooks {
  /** Raw source text of the `hooks` property's value — an object literal of hook callbacks. */
  code: string;

  /**
   * `import` lines needed by `code` (real value imports, so the actual
   * functions survive — not `import type`). Relative specifiers are
   * resolved to absolute paths since the generated virtual module has no
   * real file location on disk to resolve them against.
   */
  imports: string[];
}

/**
 * Slices just the `hooks` property's source text out of a config file,
 * instead of importing the file as a whole. A config's `hooks` are the only
 * part of it that needs to reach the client bundle — everything else it
 * might import (`node:path`, `node:fs`, filesystem-dependent setup...)
 * would otherwise get dragged along and break the client build.
 *
 * Limitation: only inline object literals are supported
 * (`hooks: { "app:mounted": () => {} }`). `hooks: sharedHooks` referencing
 * an identifier declared elsewhere in the file isn't resolved — this would
 * need to follow the file's local scope bindings, which adds real
 * complexity for a pattern the config authoring convention doesn't use.
 */
export function extractHooks(configFile: string): ExtractedHooks | undefined {
  if (!existsSync(configFile)) return undefined;

  const source = readFileSync(configFile, "utf-8");
  const ast = parse(source, { sourceType: "module", plugins: ["typescript"] });

  const imports: ImportDeclaration[] = [];
  let objectArg: ObjectExpression | undefined;

  traverse(ast, {
    ImportDeclaration(path) {
      imports.push(path.node);
    },
    ExportDefaultDeclaration(path) {
      objectArg = resolveConfigObject(path.get("declaration"));
    },
  });

  if (!objectArg) return undefined;

  const hooksProp = objectArg.properties.find(
    (prop): prop is ObjectProperty =>
      prop.type === "ObjectProperty" &&
      !prop.computed &&
      ((prop.key.type === "Identifier" && prop.key.name === "hooks") ||
        (prop.key.type === "StringLiteral" && prop.key.value === "hooks")),
  );

  if (!hooksProp || hooksProp.value.type !== "ObjectExpression")
    return undefined;

  const { value } = hooksProp;
  if (typeof value.start !== "number" || typeof value.end !== "number")
    return undefined;

  const code = source.slice(value.start, value.end);

  return { code, imports: relevantImports(code, imports, configFile) };
}

/**
 * `export default { hooks: {...}, ... }` — plain object, resolved directly.
 * `export default defineConfig({...})` / `defineModule<T>({...})` —
 * unwraps the call to its object argument.
 * `export default someVar` — follows `someVar` back to its declaration.
 */
function resolveConfigObject(
  path: NodePath<any>,
): ObjectExpression | undefined {
  if (!path?.node) return undefined;

  if (path.isObjectExpression()) return path.node;

  if (path.isCallExpression()) {
    const arg = path.node.arguments[0];
    return arg?.type === "ObjectExpression" ? arg : undefined;
  }

  if (path.isIdentifier()) {
    const binding = path.scope.getBinding(path.node.name);
    const init = binding?.path.isVariableDeclarator()
      ? binding.path.get("init")
      : undefined;
    if (init && !Array.isArray(init)) return resolveConfigObject(init);
  }

  return undefined;
}

/** Builds `import ...` lines for every import whose local name is actually referenced in `code`. */
function relevantImports(
  code: string,
  imports: ImportDeclaration[],
  configFile: string,
): string[] {
  const referenced = new Set(code.match(/[A-Za-z_$][\w$]*/g) ?? []);
  const lines: string[] = [];

  for (const decl of imports) {
    const specifiers = decl.specifiers.filter((spec) =>
      referenced.has(spec.local.name),
    );
    if (specifiers.length > 0)
      lines.push(buildImportLine(decl, specifiers, configFile));
  }

  return lines;
}

function buildImportLine(
  decl: ImportDeclaration,
  specifiers: ImportDeclaration["specifiers"],
  configFile: string,
): string {
  const source = resolveSpecifier(decl.source.value, configFile);

  const defaultSpec = specifiers.find(
    (spec) => spec.type === "ImportDefaultSpecifier",
  );
  const namespaceSpec = specifiers.find(
    (spec) => spec.type === "ImportNamespaceSpecifier",
  );
  const namedSpecs = specifiers.filter(
    (spec) => spec.type === "ImportSpecifier",
  );

  const parts: string[] = [];
  if (defaultSpec) parts.push(defaultSpec.local.name);
  if (namespaceSpec) parts.push(`* as ${namespaceSpec.local.name}`);
  if (namedSpecs.length > 0) {
    const named = namedSpecs
      .map((spec) => {
        const imported =
          spec.imported.type === "Identifier"
            ? spec.imported.name
            : spec.imported.value;
        return imported === spec.local.name
          ? imported
          : `${imported} as ${spec.local.name}`;
      })
      .join(", ");
    parts.push(`{ ${named} }`);
  }

  return `import ${parts.join(", ")} from "${source}";`;
}

/** Relative specifiers become absolute paths — the virtual module has no real file location for a bundler to resolve `./x` against. Bare package specifiers are left untouched. */
function resolveSpecifier(source: string, configFile: string): string {
  if (!source.startsWith(".")) return source;
  return resolve(dirname(configFile), source).replace(/\\/g, "/");
}
