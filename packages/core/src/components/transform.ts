import { dirname, extname, relative } from "node:path";
import MagicString from "magic-string";
import type { AutoImportContext } from "./context";
import { parseScript, traverse } from "./babel";
import { slash } from "./utils";
import { extractTemplateTags, parseSfc } from "./vue-sfc";

export interface TransformResult {
  code: string;
  map: ReturnType<MagicString["generateMap"]>;
}

const JS_LIKE = /\.(?:jsx?|tsx?|mjs|mts)$/;

export function shouldTransform(id: string, ctx: AutoImportContext): boolean {
  if (ctx.components.size === 0) return false;
  const [path] = id.split("?", 1);
  if (!path) return false;

  // if (path.includes('/node_modules/')) return false
  return path.endsWith(".vue") || JS_LIKE.test(path);
}

/** Builds the relative import specifier from `fromFile` to a component's absolute path. */
function toImportPath(fromFile: string, componentAbsPath: string): string {
  let rel = slash(relative(dirname(fromFile), componentAbsPath));
  if (!rel.startsWith(".")) rel = `./${rel}`;

  // Keep the extension for `.vue` (required for resolution), strip it for
  // JS/TS-like files so bundler/tsconfig extension rules stay in control.
  const ext = extname(rel);
  if (ext && ext !== ".vue") rel = rel.slice(0, -ext.length);
  return rel;
}

function buildImportLines(
  names: Iterable<string>,
  fromFile: string,
  ctx: AutoImportContext,
): string {
  const lines: string[] = [];
  for (const name of names) {
    const info = ctx.components.get(name);
    if (!info) continue;
    lines.push(`import ${name} from '${toImportPath(fromFile, info.path)}'`);
  }
  return lines.join("\n");
}

/** Collects every top-level bound identifier (imports, const/let/var, functions, classes...) of a script. */
function collectTopLevelBindings(code: string): Set<string> {
  const bindings = new Set<string>();
  try {
    const ast = parseScript(code);
    traverse(ast, {
      Program(path) {
        for (const name of Object.keys(path.scope.getAllBindings()))
          bindings.add(name);
      },
    });
  } catch {
    // Parse errors are ignored here — Vite's own pipeline will surface them properly.
  }
  return bindings;
}

/**
 * Handles `.vue` SFCs: template tags are matched (as-is, and PascalCase'd
 * from kebab-case) against the known component map, then any name not
 * already bound in the `<script>`/`<script setup>` block is imported.
 */
function transformVue(
  code: string,
  id: string,
  ctx: AutoImportContext,
): TransformResult | null {
  const { template, script } = parseSfc(code);
  if (!template) return null;

  const tags = extractTemplateTags(template.content);
  const candidateNames = new Set<string>();

  for (const tag of tags) {
    if (ctx.components.has(tag)) {
      candidateNames.add(tag);
      continue;
    }
    const pascal = tag
      .split("-")
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("");
    if (ctx.components.has(pascal)) candidateNames.add(pascal);
  }

  if (candidateNames.size === 0) return null;

  const existingBindings = script
    ? collectTopLevelBindings(script.content)
    : new Set<string>();
  const needed = [...candidateNames].filter((n) => !existingBindings.has(n));
  if (needed.length === 0) return null;

  const importLines = buildImportLines(needed, id, ctx);
  if (!importLines) return null;

  const s = new MagicString(code);

  if (script) {
    // Inject right at the top of the existing block (works for both
    // `<script setup>`, where an import is immediately usable in the
    // template, and a plain `<script>`, left for the user to wire into
    // `components: {}` if needed).
    s.appendLeft(script.contentStart, `\n${importLines}\n`);
  } else {
    // No <script> block at all: create a `<script setup>` before the template.
    s.appendLeft(
      template.start,
      `<script setup>\n${importLines}\n</script>\n\n`,
    );
  }

  return {
    code: s.toString(),
    map: s.generateMap({ source: id, hires: true, includeContent: true }),
  };
}

/** Handles `.js/.jsx/.ts/.tsx` files: any un-bound, PascalCase JSX tag is imported. */
function transformScript(
  code: string,
  id: string,
  ctx: AutoImportContext,
): TransformResult | null {
  let ast;
  try {
    ast = parseScript(code);
  } catch {
    return null;
  }

  const used = new Set<string>();
  const bound = new Set<string>();

  traverse(ast, {
    Program(path) {
      for (const name of Object.keys(path.scope.getAllBindings()))
        bound.add(name);
    },
    JSXOpeningElement(path) {
      const nameNode = path.node.name;
      if (nameNode.type === "JSXIdentifier" && /^[A-Z]/.test(nameNode.name)) {
        used.add(nameNode.name);
      }
    },
  });

  const needed = [...used].filter(
    (name) => ctx.components.has(name) && !bound.has(name),
  );
  if (needed.length === 0) return null;

  const importLines = buildImportLines(needed, id, ctx);
  if (!importLines) return null;

  const s = new MagicString(code);

  // Insert after the last top-level `import` declaration, or at the very top.
  let insertAt = 0;
  for (const node of ast.program.body) {
    if (node.type === "ImportDeclaration" && typeof node.end === "number")
      insertAt = node.end;
    else break;
  }

  s.appendLeft(insertAt, `${insertAt === 0 ? "" : "\n"}${importLines}\n`);

  return {
    code: s.toString(),
    map: s.generateMap({ source: id, hires: true, includeContent: true }),
  };
}

export function transformCode(
  code: string,
  id: string,
  ctx: AutoImportContext,
): TransformResult | null {
  if (ctx.components.size === 0) return null;
  const [path] = id.split("?", 1);
  if (!path) return null;

  if (path.endsWith(".vue")) return transformVue(code, path, ctx);
  if (JS_LIKE.test(path)) return transformScript(code, path, ctx);

  return null;
}
