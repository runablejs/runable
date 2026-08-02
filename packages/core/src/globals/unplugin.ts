import { existsSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import MagicString from "magic-string";
import { parse as parseVueSFC } from "vue/compiler-sfc";
import { parse as babelParse, type ParserOptions } from "@babel/parser";
import _traverse from "@babel/traverse";
import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import { createUnplugin } from "unplugin";
import { getChildren } from "../utils/get-children.js";
import {
  generateGlobalTypesFromExports,
  getExports,
  type ExportMetadata,
} from "../utils/get-exports.js";
import { atomicWriteFile } from "../utils/atomic-write-file.js";
import { normalizeDir } from "../utils/dir.js";
import { getPackageJson } from "@/utils/pkg.js";
import { resolvePackageEntry } from "@/utils/pkg-resolve-entry.js";
import type { Arrayable } from "@/utils/types.js";

const traverse: typeof _traverse = (_traverse as any).default ?? _traverse;

// -----------------------------------------------------------------------
// Config types
// -----------------------------------------------------------------------

type ImportsCommon = { from: string; imports: string[] };
type ImportsMap = Record<string, string[]>;
type ImportPreset = keyof typeof presets;

export type GlobalConfig = {
  /** Directory where `globals.d.ts` is written. Defaults to `process.cwd()`. */
  output?: string;
  imports?: Arrayable<
    | { directory: string }
    | { file: string }
    | ImportPreset
    | ImportsCommon
    | ImportsMap
  >;
};

// -----------------------------------------------------------------------
// Built-in presets
// -----------------------------------------------------------------------

const presets = {
  vue: {
    from: "vue",
    imports: [
      "computed",
      "customRef",
      "defineAsyncComponent",
      "defineComponent",
      "effect",
      "effectScope",
      "getCurrentInstance",
      "getCurrentScope",
      "h",
      "hasInjectionContext",
      "inject",
      "isProxy",
      "isReactive",
      "isReadonly",
      "isRef",
      "isShallow",
      "markRaw",
      "nextTick",
      "onActivated",
      "onBeforeMount",
      "onBeforeUnmount",
      "onBeforeUpdate",
      "onDeactivated",
      "onErrorCaptured",
      "onMounted",
      "onRenderTracked",
      "onRenderTriggered",
      "onScopeDispose",
      "onServerPrefetch",
      "onUnmounted",
      "onUpdated",
      "onWatcherCleanup",
      "provide",
      "proxyRefs",
      "reactive",
      "readonly",
      "ref",
      "resolveComponent",
      "shallowReactive",
      "shallowReadonly",
      "shallowRef",
      "toRaw",
      "toRef",
      "toRefs",
      "toValue",
      "triggerRef",
      "unref",
      "useAttrs",
      "useCssModule",
      "useCssVars",
      "useId",
      "useModel",
      "useShadowRoot",
      "useSlots",
      "useTemplateRef",
      "useTransitionState",
      "watch",
      "watchEffect",
      "watchPostEffect",
      "watchSyncEffect",
      "withCtx",
      "withDirectives",
      "withKeys",
      "withMemo",
      "withModifiers",
      "withScopeId",
    ],
  },
} as const satisfies Record<string, ImportsCommon>;

// -----------------------------------------------------------------------
// Export resolution — turns config `imports` entries into a flat map of
// exportable names, run once per config during `buildStart`.
// -----------------------------------------------------------------------

const JS_EXTENSIONS = [".js", ".ts", ".mjs", ".mts"] as const;
const TYPE_ONLY_KINDS = new Set(["type", "interface", "unknown"]);

/**
 * Resolves a file path by trying each supported extension in order and
 * returning the first one that exists on disk, since callers may omit it.
 */
function resolveFile(file: string): string | undefined {
  for (const ext of JS_EXTENSIONS) {
    const candidate = file.endsWith(ext) ? file : `${file}${ext}`;
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return undefined;
}

/**
 * Resolves a `{ from, imports }` entry (a preset or a user-declared
 * package import) to its actual file on disk via the package's
 * package.json, then merges each named import into `target`.
 *
 * Supports subpath imports, e.g. `"@unhead/schema-org/vue"` resolves the
 * package `@unhead/schema-org` with subpath `"vue"`.
 */
function resolvePackageImport(
  common: ImportsCommon,
  target: Record<string, ExportMetadata>,
): void {
  const segments = common.from.split("/");
  const packageName = segments.slice(0, 2).join("/");
  const subpath = segments.length > 2 ? segments.slice(2).join("/") : undefined;

  const { dir, content } = getPackageJson(packageName, import.meta.dirname);
  const entry = resolvePackageEntry(content, subpath, "import");
  if (!entry.default) return;

  const file = join(dir, entry.default);
  const fileType = entry.types ? join(dir, entry.types) : undefined;

  for (const name of common.imports) {
    target[name] = { name, kind: "const", isDefault: false, file, fileType };
  }
}

/**
 * Resolves one config's `imports` (presets, files, directories, packages)
 * and merges the resulting exports into `target`. Pure merge — never
 * touches the filesystem output, so several configs can call this against
 * the same shared accumulator without clobbering each other.
 */
function resolveConfigImports(
  config: GlobalConfig | undefined,
  target: Record<string, ExportMetadata>,
): void {
  const rawImports = config?.imports ?? [];
  const entries = Array.isArray(rawImports) ? rawImports : [rawImports];

  for (const entry of entries) {
    if (typeof entry === "string") {
      resolvePackageImport(presets[entry], target);
      continue;
    }

    if ("file" in entry && typeof entry.file === "string") {
      const file = resolveFile(entry.file);
      if (!file) continue;
      Object.assign(target, getExports(file).exports);
      continue;
    }

    if ("directory" in entry && typeof entry.directory === "string") {
      const files = getChildren(entry.directory, {
        recursive: true,
        onlyFile: true,
        endWith: /\.(js|ts|mjs|mts)$/,
      });
      for (const file of files) {
        Object.assign(target, getExports(file.path).exports);
      }
      continue;
    }

    if ("from" in entry && "imports" in entry) {
      resolvePackageImport(entry as ImportsCommon, target);
      continue;
    }

    for (const [from, imports] of Object.entries(entry)) {
      resolvePackageImport({ from, imports }, target);
    }
  }
}

// -----------------------------------------------------------------------
// Free-identifier analysis — decides, per transformed file, which exports
// are actually referenced so only those get imported.
// -----------------------------------------------------------------------

const INJECTABLE_EXTENSIONS = new Set([
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  ".mjs",
  ".mts",
  ".vue",
]);

const BABEL_PLUGINS = [
  "typescript",
  "jsx",
  "decorators-legacy",
  "importAttributes",
  "topLevelAwait",
] as ParserOptions["plugins"];

/**
 * Ancestor node types under which an identifier only exists at the type
 * level and is erased before runtime. Prevents e.g. `Ref<string>` or
 * `x satisfies Foo` from being treated as a value usage of `Ref`/`Foo`.
 */
const TYPE_ONLY_ANCESTORS = new Set([
  "TSTypeAnnotation",
  "TSTypeParameterDeclaration",
  "TSTypeParameterInstantiation",
  "TSTypeAliasDeclaration",
  "TSInterfaceDeclaration",
  "TSInterfaceBody",
  "TSTypeReference",
  "TSTypeQuery",
  "TSTypeLiteral",
  "TSImportType",
  "TSAsExpression",
  "TSSatisfiesExpression",
]);

function isTypeOnlyPosition(path: NodePath<t.Identifier>): boolean {
  return path.findParent((p) => TYPE_ONLY_ANCESTORS.has(p.node.type)) !== null;
}

/**
 * Parses a JS/TS/JSX source and returns the subset of `candidates` used
 * as free value references — read but never bound locally (import,
 * declaration, parameter, destructuring, function/class name) anywhere
 * in the file, and not a property key or `.prop` access.
 *
 * Delegates scope, shadowing, and hoisting analysis entirely to Babel
 * (`isReferencedIdentifier` + `scope.hasBinding`) rather than a hand-rolled
 * tracker, since Babel already resolves the edge cases correctly
 * (forward references, nested blocks, `catch` bindings, destructuring).
 */
function collectFreeIdentifiers(
  code: string,
  fileName: string,
  candidates: Set<string>,
): Set<string> {
  if (candidates.size === 0) return new Set();

  const ast = babelParse(code, {
    sourceType: "module",
    sourceFilename: fileName,
    plugins: BABEL_PLUGINS,
  });

  const used = new Set<string>();

  traverse(ast, {
    Identifier(path: NodePath<t.Identifier>) {
      const { name } = path.node;
      if (!candidates.has(name)) return;
      if (!path.isReferencedIdentifier()) return;
      if (isTypeOnlyPosition(path)) return;
      if (path.scope.hasBinding(name)) return;
      used.add(name);
    },
    // JSX tag names (`<Ref />`) are a distinct node type from Identifier,
    // so component usages need their own visitor to be picked up.
    JSXIdentifier(path: NodePath<t.JSXIdentifier>) {
      const { name } = path.node;
      if (!candidates.has(name)) return;
      const { parent } = path;
      const isTagName =
        (parent.type === "JSXOpeningElement" ||
          parent.type === "JSXClosingElement") &&
        parent.name === path.node;
      if (!isTagName) return;
      if (path.scope.hasBinding(name)) return;
      used.add(name);
    },
  });

  return used;
}

// -----------------------------------------------------------------------
// Import injection — turns a set of resolved names into real `import`
// statements, grouped by source file, relative to the consuming file.
// -----------------------------------------------------------------------

/**
 * Builds a relative import specifier from the file being transformed to
 * the target export's file. Must be relative to the *consuming* file's
 * directory, not `process.cwd()` — bundlers resolve relative imports
 * against the file that contains them, so anchoring on `cwd` produces a
 * broken path for any file outside the project root.
 */
function toImportSpecifier(fromFile: string, targetFile: string): string {
  const rel = normalizeDir(relative(dirname(fromFile), targetFile));
  return rel.startsWith(".") ? rel : `./${rel}`;
}

/**
 * Groups free-identifier names by their source file and renders one
 * `import { ... } from "..."` per file, so multiple names sharing a
 * module collapse into a single statement.
 */
function buildImportStatements(
  names: Set<string>,
  exportsByName: Record<string, ExportMetadata>,
  fromFile: string,
): string {
  const namesByFile = new Map<string, string[]>();

  for (const name of names) {
    const meta = exportsByName[name];
    if (!meta || TYPE_ONLY_KINDS.has(meta.kind)) continue;

    const specifier = toImportSpecifier(fromFile, meta.file);
    const list = namesByFile.get(specifier);
    if (list) list.push(name);
    else namesByFile.set(specifier, [name]);
  }

  return [...namesByFile.entries()]
    .map(([file, list]) => `import { ${list.join(", ")} } from "${file}";`)
    .join("\n");
}

/**
 * Scans `code` for free references to any known export and, if any are
 * found, prepends the corresponding `import` statements. Returns `null`
 * when nothing needs to change, so callers can pass that straight back
 * as the plugin hook's return value.
 */
function injectImports(
  code: string,
  id: string,
  exportsByName: Record<string, ExportMetadata>,
): { code: string; map: ReturnType<MagicString["generateMap"]> } | null {
  const candidates = new Set(Object.keys(exportsByName));
  if (candidates.size === 0) return null;

  const s = new MagicString(code);

  if (extname(id) === ".vue") {
    const { descriptor } = parseVueSFC(code, { filename: id });
    const blocks = [descriptor.scriptSetup, descriptor.script].filter(
      (block): block is NonNullable<typeof block> => block != null,
    );
    if (blocks.length === 0) return null;

    let touched = false;
    for (const block of blocks) {
      const virtualName = `${id}.${block.lang === "ts" ? "ts" : "js"}`;
      const used = collectFreeIdentifiers(
        block.content,
        virtualName,
        candidates,
      );
      if (used.size === 0) continue;

      const importStatements = buildImportStatements(used, exportsByName, id);
      if (!importStatements) continue;

      s.appendLeft(block.loc.start.offset, `\n${importStatements}\n`);
      touched = true;
    }
    if (!touched) return null;
  } else {
    const used = collectFreeIdentifiers(code, id, candidates);
    if (used.size === 0) return null;

    const importStatements = buildImportStatements(used, exportsByName, id);
    if (!importStatements) return null;

    s.prepend(`${importStatements}\n`);
  }

  return { code: s.toString(), map: s.generateMap({ hires: true }) };
}

// -----------------------------------------------------------------------
// Plugin
// -----------------------------------------------------------------------

/**
 * State shared by every instance of this plugin within one `buildViteConfig()`
 * call — one instance is created per Syora config (main + each module), and
 * they must all contribute to the same export map and the same
 * `globals.d.ts`, not each overwrite the others' work.
 *
 * `total`/`completed` gate the `.d.ts` write to happen exactly once, after
 * the last instance's `buildStart` has merged its exports in — Rollup
 * awaits every plugin's `buildStart` before resolving the entry, so this
 * is safe even though `buildStart` is async.
 *
 * CAVEAT: this state is module-level and never reset. If `buildViteConfig()`
 * runs more than once in the same process (e.g. a long-lived dev server
 * restarting its config without a fresh Node process), exports from a
 * removed module would linger. Flag if that's a real scenario — it would
 * need an explicit reset hook instead of this counter.
 */
let total = 0;
let completed = 0;
const sharedExports: Record<string, ExportMetadata> = {};
let sharedOutput: string | undefined;

export default createUnplugin((config?: GlobalConfig) => {
  total++;

  return {
    name: "syora:globals",
    enforce: "pre",

    transform(code, id) {
      const [path] = id.split("?");
      if (!path) return code;

      if (path.includes("node_modules")) return null;
      if (!INJECTABLE_EXTENSIONS.has(extname(path))) return null;

      return injectImports(code, path, sharedExports);
    },

    async buildStart() {
      const { output = process.cwd() } = config ?? {};
      sharedOutput ??= output;

      resolveConfigImports(config, sharedExports);
      completed++;

      if (completed === total) {
        const { content } = generateGlobalTypesFromExports(sharedExports, {
          targetPath: sharedOutput,
        });
        atomicWriteFile(resolve(sharedOutput, "globals.d.ts"), content);
      }
    },
  };
});
