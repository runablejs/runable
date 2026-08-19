import { basename, extname, isAbsolute, relative } from "node:path";
import { readFile } from "node:fs/promises";
import { parse as parseJavaScript } from "@babel/parser";
import { parse as parseSfc } from "vue/compiler-sfc";

function getStaticString(node: any): string | undefined {
  if (node?.type === "StringLiteral") return node.value;

  if (node?.type === "TemplateLiteral" && node.expressions.length === 0) {
    return node.quasis.map((part: any) => part.value.cooked).join("");
  }
}

function getNameProperty(node: any): string | undefined {
  if (node?.type !== "ObjectExpression") return;

  for (const property of node.properties) {
    if (property.type !== "ObjectProperty") continue;

    const key = property.key;
    const isName =
      (!property.computed && key.type === "Identifier" && key.name === "name") ||
      (key.type === "StringLiteral" && key.value === "name");

    if (!isName) continue;

    return getStaticString(property.value);
  }
}

function getOptionsObject(node: any): any | undefined {
  if (node?.type === "ObjectExpression") return node;
  if (node?.type !== "CallExpression") return;

  const callee = node.callee;
  const isDefineComponent =
    (callee.type === "Identifier" && callee.name === "defineComponent") ||
    (callee.type === "MemberExpression" &&
      !callee.computed &&
      callee.property.type === "Identifier" &&
      callee.property.name === "defineComponent");

  if (!isDefineComponent) return;

  return node.arguments.find(
    (argument: any) => argument?.type === "ObjectExpression",
  );
}

function extractNameFromScript(source: string, setup: boolean): string | undefined {
  let body: any[];

  try {
    body = parseJavaScript(source, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    }).program.body;
  } catch {
    return;
  }

  for (const statement of body) {
    if (setup && statement.type === "ExpressionStatement") {
      const expression = statement.expression;
      if (
        expression.type === "CallExpression" &&
        expression.callee.type === "Identifier" &&
        expression.callee.name === "defineOptions"
      ) {
        const name = getNameProperty(expression.arguments[0]);
        if (name) return name;
      }
    }

    if (!setup && statement.type === "ExportDefaultDeclaration") {
      const name = getNameProperty(getOptionsObject(statement.declaration));
      if (name) return name;
    }

    // Bundled JavaScript commonly rewrites
    // `export default defineComponent(...)` to a variable followed by a named
    // export (`var component_default = defineComponent(...); export { ... }`).
    // Read the options from that variable as well so built-in components keep
    // their declared public name after Syora itself has been built.
    if (!setup && statement.type === "VariableDeclaration") {
      for (const declaration of statement.declarations) {
        const name = getNameProperty(getOptionsObject(declaration.init));
        if (name) return name;
      }
    }
  }
}

/** Reads a statically declared Vue component name from an SFC or script module. */
export async function getExplicitComponentName(
  filePath: string,
): Promise<string | undefined> {
  let source: string;
  try {
    source = await readFile(filePath, "utf8");
  } catch {
    return;
  }

  if (!filePath.endsWith(".vue")) {
    return extractNameFromScript(source, false);
  }

  const { descriptor } = parseSfc(source, { filename: filePath });

  if (descriptor.scriptSetup) {
    const name = extractNameFromScript(descriptor.scriptSetup.content, true);
    if (name) return name;
  }

  if (descriptor.script) {
    return extractNameFromScript(descriptor.script.content, false);
  }
}

export function slash(p: string): string {
  return p.replace(/\\/g, "/");
}

/** Converts a single path segment (kebab-case, snake_case, dot.case...) to PascalCase. */
export function segmentToPascalCase(segment: string): string {
  return segment
    .split(/[-_.\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Computes the default PascalCase component name from an absolute file path.
 *
 * - `src/components/base/Button.vue` -> `BaseButton` (pathPrefix: true) or `Button`
 * - `src/components/Button/index.vue` -> `Button` (folder name is used, not "Index")
 */
export function getDefaultComponentName(
  absPath: string,
  scanDir: string,
  pathPrefix: boolean,
  prefix?: string,
): string {
  const ext = extname(absPath);
  const rel =
    absPath === scanDir ? basename(absPath) : relative(scanDir, absPath);
  const relNoExt = ext ? rel.slice(0, -ext.length) : rel;
  const segments = slash(relNoExt).split("/").filter(Boolean);

  // Folder/index.vue -> use the folder name only, drop the trailing "index".
  if (
    segments.length > 1 &&
    segments[segments.length - 1]?.toLowerCase() === "index"
  ) {
    segments.pop();
  }

  const parts = pathPrefix ? segments : [segments[segments.length - 1]!];

  if (prefix) parts.unshift(prefix);

  return parts.map(segmentToPascalCase).join("");
}

/** True if `child` is inside (or equal to) `parent`. */
export function isSubPath(parent: string, child: string): boolean {
  const rel = relative(parent, child);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}
