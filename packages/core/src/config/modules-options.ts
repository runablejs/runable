import { existsSync, readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
import type { NodePath } from "@babel/traverse";
import type {
  CallExpression,
  ImportDeclaration,
  ObjectExpression,
  ObjectProperty,
  TSType,
} from "@babel/types";

import { useAllConfigs, useConfig, type ResolvedConfig } from "./load.js";
import { atomicWriteFile } from "@/utils/atomic-write-file.js";

// @babel/traverse's ESM/CJS interop is inconsistent across bundler targets
// (varies between `^7` and the `^8` beta pinned in package.json) — always
// fall back to `.default` when the named export isn't callable directly.
const traverse = (
  typeof _traverse === "function"
    ? _traverse
    : (_traverse as unknown as { default: typeof _traverse }).default
) as typeof _traverse;

interface ExtractedModuleOptions {
  /** `configKey ?? meta.name`, mirrors the fallback order used at runtime in `loadAndCacheConfig`. */
  configKey?: string;

  /** Raw source text of the `OptionsT` generic passed to `defineModule<OptionsT>`, if any. */
  optionsTypeText?: string;

  /** Top-level import declarations of the module's config file — needed to resolve identifiers used in `optionsTypeText`. */
  imports: ImportDeclaration[];

  /**
   * Top-level `interface`/`type` declarations of the module's config file,
   * keyed by name — needed when `optionsTypeText` references a type that's
   * declared (and not exported) locally rather than imported, e.g.
   * `interface ModuleOptions {}` declared right above `defineModule(...)`.
   */
  localTypes: Map<string, string>;

  /** Absolute path of the module's config file, used to resolve relative imports against the output file. */
  configFile: string;
}

/**
 * Generates `<output>/modules-options.d.ts`: a `declare module` augmentation
 * of `SyoraConfig` that types each loaded module's options key precisely,
 * instead of relying on `SyoraConfig`'s `[key: string]: unknown` escape
 * hatch.
 *
 * For each loaded module, re-parses its `syora.config.*` source with Babel
 * (rather than reading anything off the already-loaded `ResolvedConfig`)
 * because two pieces of information don't survive to runtime:
 * - `configKey` is read once in `loadAndCacheConfig` and then discarded
 * - `OptionsT` in `defineModule<OptionsT>(...)` is a compile-time-only type
 *   argument; it is erased entirely once the module's config is compiled to
 *   JS, so there is no runtime value to introspect in the first place
 *
 * Must run after `loadConfig()` — it reads the modules that were resolved
 * and cached during that call via `useAllConfigs()`.
 */
export async function generateModulesOptionsDts(): Promise<string> {
  const main = useConfig();
  const modules = useAllConfigs().filter((config) => config._name !== "__main");

  const outFile = resolve(main.output, "modules-options.d.ts");

  const entries = new Map<string, string>(); // configKey -> type text
  const importLines = new Set<string>();
  const localDeclarationLines = new Set<string>();

  for (const moduleConfig of modules) {
    const extracted = extractModuleOptions(moduleConfig);
    if (!extracted) continue;

    const configKey = extracted.configKey ?? moduleConfig._name;
    if (entries.has(configKey)) continue; // first module to claim a key wins

    if (!extracted.optionsTypeText) {
      entries.set(configKey, "Record<string, unknown>");
      continue;
    }

    const { typeText, imports, localDeclarations } = resolveTypeDependencies(
      extracted,
      configKey,
      outFile,
    );

    entries.set(configKey, typeText);
    for (const line of imports) importLines.add(line);
    for (const decl of localDeclarations) localDeclarationLines.add(decl);
  }

  writeDts(outFile, importLines, localDeclarationLines, entries);
  return outFile;
}

/** Parses one module's config file to pull out its `configKey`, `OptionsT` source text, its imports, and its local type declarations. */
function extractModuleOptions(
  moduleConfig: ResolvedConfig,
): ExtractedModuleOptions | undefined {
  const configFile = moduleConfig._configFile;
  if (!configFile || !existsSync(configFile)) return undefined;

  const source = readFileSync(configFile, "utf-8");
  const ast = parse(source, { sourceType: "module", plugins: ["typescript"] });

  const imports: ImportDeclaration[] = [];
  const localTypes = new Map<string, string>();
  let call: CallExpression | undefined;

  const isTopLevel = (path: NodePath<any>) =>
    path.parentPath?.isProgram() || path.parentPath?.isExportNamedDeclaration();

  traverse(ast, {
    ImportDeclaration(path) {
      imports.push(path.node);
    },
    ExportDefaultDeclaration(path) {
      call = resolveDefineModuleCall(path.get("declaration"));
    },
    TSInterfaceDeclaration(path) {
      if (isTopLevel(path)) {
        localTypes.set(
          path.node.id.name,
          source.slice(path.node.start!, path.node.end!),
        );
      }
    },
    TSTypeAliasDeclaration(path) {
      if (isTopLevel(path)) {
        localTypes.set(
          path.node.id.name,
          source.slice(path.node.start!, path.node.end!),
        );
      }
    },
  });

  if (!call) return undefined;

  const configKey = extractConfigKey(call);

  const typeArg = call.typeArguments?.params?.[0] as TSType | undefined;
  const optionsTypeText =
    typeArg &&
    typeof typeArg.start === "number" &&
    typeof typeArg.end === "number"
      ? source.slice(typeArg.start, typeArg.end)
      : undefined;

  return { configKey, optionsTypeText, imports, localTypes, configFile };
}

/**
 * `export default defineModule<T>({...})` — resolved directly.
 * `export default someVar` — follows `someVar` back to its declaration, in
 * case it was assigned `defineModule(...)` earlier in the same file.
 */
function resolveDefineModuleCall(
  path: NodePath<any>,
): CallExpression | undefined {
  if (!path?.node) return undefined;

  if (path.isCallExpression()) {
    const { callee } = path.node;
    return callee.type === "Identifier" && callee.name === "defineModule"
      ? path.node
      : undefined;
  }

  if (path.isIdentifier()) {
    const binding = path.scope.getBinding(path.node.name);
    const init = binding?.path.isVariableDeclarator()
      ? binding.path.get("init")
      : undefined;
    if (init && !Array.isArray(init)) return resolveDefineModuleCall(init);
  }

  return undefined;
}

/** Reads the `configKey` string literal, falling back to `meta.name`, from `defineModule`'s object argument. */
function extractConfigKey(call: CallExpression): string | undefined {
  const arg = call.arguments[0];
  if (!arg || arg.type !== "ObjectExpression") return undefined;

  const configKeyProp = findProperty(arg, "configKey");
  if (configKeyProp?.value.type === "StringLiteral")
    return configKeyProp.value.value;

  const metaProp = findProperty(arg, "meta");
  if (metaProp?.value.type === "ObjectExpression") {
    const nameProp = findProperty(metaProp.value, "name");
    if (nameProp?.value.type === "StringLiteral") return nameProp.value.value;
  }

  return undefined;
}

function findProperty(
  object: ObjectExpression,
  name: string,
): ObjectProperty | undefined {
  return object.properties.find(
    (prop): prop is ObjectProperty =>
      prop.type === "ObjectProperty" &&
      !prop.computed &&
      ((prop.key.type === "Identifier" && prop.key.name === name) ||
        (prop.key.type === "StringLiteral" && prop.key.value === name)),
  );
}

/** All identifier-looking tokens in a chunk of type source text. */
function matchIdentifiers(text: string): string[] {
  return text.match(/[A-Za-z_$][\w$]*/g) ?? [];
}

/** Renames every whole-word occurrence of `from` to `to` in `text`. */
function renameIdentifier(text: string, from: string, to: string): string {
  return text.replace(new RegExp(`\\b${from}\\b`, "g"), to);
}

/** `configKey` turned into a PascalCase prefix, used to namespace inlined local types (e.g. `content` -> `Content`). */
function pascalCase(name: string): string {
  const camel = name.replace(/[^a-zA-Z0-9]+(.)/g, (_, char: string) =>
    char.toUpperCase(),
  );
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

/**
 * Resolves every identifier referenced (transitively) by `optionsTypeText`:
 * - identifiers bound by an `import` become `import type` lines
 * - identifiers declared locally (and not exported) get inlined as ambient
 *   declarations instead, since they can't be imported — renamed with a
 *   `configKey`-derived prefix so two modules with a same-named local type
 *   (e.g. both call it `ModuleOptions`) don't collide once merged into the
 *   single generated `.d.ts`
 * - anything else (builtins like `Record`, `string`, ...) is left as-is
 */
function resolveTypeDependencies(
  extracted: ExtractedModuleOptions,
  configKey: string,
  outFile: string,
): { typeText: string; imports: string[]; localDeclarations: string[] } {
  const neededLocalTypes = new Set<string>();
  const imports = new Set<string>();
  const seen = new Set<string>();
  const queue = [...matchIdentifiers(extracted.optionsTypeText!)];

  while (queue.length) {
    const identifier = queue.shift()!;
    if (seen.has(identifier)) continue;
    seen.add(identifier);

    const importDecl = findImportSpecifier(extracted.imports, identifier);
    if (importDecl) {
      imports.add(buildImportLine(importDecl, extracted.configFile, outFile));
      continue;
    }

    const localText = extracted.localTypes.get(identifier);
    if (!localText) continue; // unknown identifier: assume global/builtin

    neededLocalTypes.add(identifier);
    for (const nested of matchIdentifiers(localText)) {
      if (!seen.has(nested)) queue.push(nested);
    }
  }

  const prefix = pascalCase(configKey);
  const renameMap = new Map(
    [...neededLocalTypes].map((name) => [name, `${prefix}${name}`] as const),
  );

  const rename = (text: string) => {
    let result = text;
    for (const [from, to] of renameMap)
      result = renameIdentifier(result, from, to);
    return result;
  };

  const localDeclarations = [...neededLocalTypes].map((name) =>
    rename(extracted.localTypes.get(name)!),
  );

  return {
    typeText: rename(extracted.optionsTypeText!),
    imports: [...imports],
    localDeclarations,
  };
}

function findImportSpecifier(imports: ImportDeclaration[], name: string) {
  for (const decl of imports) {
    const spec = decl.specifiers.find((s) => s.local.name === name);
    if (spec) return { decl, spec };
  }
  return undefined;
}

function buildImportLine(
  {
    decl,
    spec,
  }: { decl: ImportDeclaration; spec: ImportDeclaration["specifiers"][number] },
  configFile: string,
  outFile: string,
): string {
  const source = resolveModuleSpecifier(decl.source.value, configFile, outFile);

  if (spec.type === "ImportDefaultSpecifier")
    return `import type ${spec.local.name} from "${source}";`;
  if (spec.type === "ImportNamespaceSpecifier")
    return `import type * as ${spec.local.name} from "${source}";`;

  const imported =
    spec.imported.type === "Identifier"
      ? spec.imported.name
      : spec.imported.value;
  const named =
    imported === spec.local.name
      ? imported
      : `${imported} as ${spec.local.name}`;
  return `import type { ${named} } from "${source}";`;
}

/** Resolves a module's import specifier to a path valid from the generated `.d.ts`'s own location. Bare package specifiers are left untouched. */
function resolveModuleSpecifier(
  source: string,
  configFile: string,
  outFile: string,
): string {
  if (!source.startsWith(".")) return source;

  const absolute = resolve(dirname(configFile), source);
  let rel = relative(dirname(outFile), absolute)
    .replace(/\\/g, "/")
    .replace(/\.[cm]?[jt]sx?$/, "");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

function writeDts(
  outFile: string,
  importLines: Set<string>,
  localDeclarationLines: Set<string>,
  entries: Map<string, string>,
): void {
  const imports = [...importLines].sort().join("\n");
  const localDeclarations = [...localDeclarationLines].join("\n\n");

  const props = [...entries.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([configKey, typeText]) => `    ${configKey}?: ${typeText};`)
    .join("\n");

  const content = `// Auto-generated by Syora — do not edit by hand.
// Regenerated on every loadConfig() call from each module's \`defineModule<OptionsT>\` call.

${imports ? `${imports}\n\n` : ""}${localDeclarations ? `${localDeclarations}\n\n` : ""}
declare module "@syora/core" {
  interface SyoraConfig {
${props}
  }
}

export {};
`;

  atomicWriteFile(outFile, content);
}
