import { existsSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import MagicString from "magic-string";
import { getChildren } from "../utils/get-children.js";
import { createUnplugin } from "unplugin";
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

/**
 * Built-in presets: shortcuts for commonly used libraries so users don't
 * have to list every named import manually (e.g. `imports: "vue"`).
 */
const pressetNames = ["vue"] as const;
const pressets: Record<(typeof pressetNames)[number], ImportsCommon> = {
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
};

type ImportPresset = keyof typeof pressets;
type ImportsMap = Record<string, string[]>;
type ImportsCommon = { from: string; imports: string[] };

export type GlobalConfig = {
  output?: string;
  imports?: Arrayable<
    | { directory: string }
    | { file: string }
    | ImportPresset
    | ImportsCommon
    | ImportsMap
  >;
};

const VIRTUAL_ID = ":globals";
const RESOLVED_VIRTUAL_ID = "\0:globals";

/**
 * Resolves a file path by trying each supported extension in order and
 * returning the first one that exists on disk, since callers may omit it.
 */
function resolveFile(file: string) {
  for (const ext of [".js", ".ts", ".mjs", ".mts"]) {
    let dir = file;
    if (!dir.endsWith(ext)) dir = `${dir}${ext}`;

    if (!existsSync(dir)) continue;
    if (!statSync(dir).isFile()) continue;

    return dir;
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
function resolveImport(
  common: ImportsCommon,
  target: Record<string, ExportMetadata>,
) {
  const splits = common.from.split("/");
  const packageName = splits.slice(0, 2).join("/");
  const { dir, content } = getPackageJson(packageName, import.meta.dirname);

  const entry = resolvePackageEntry(
    content,
    splits.length > 2 ? splits.slice(2).join("/") : undefined,
    "import",
  );

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
) {
  let { imports = [] } = config ?? {};
  if (!Array.isArray(imports)) imports = [imports];

  for (const toImport of imports) {
    if (typeof toImport === "string") resolveImport(pressets[toImport], target);
    else if ("file" in toImport && typeof toImport.file === "string") {
      const file = resolveFile(toImport.file);
      if (!file) continue;

      const { exports } = getExports(file);
      Object.assign(target, exports);
    } else if (
      "directory" in toImport &&
      typeof toImport.directory === "string"
    ) {
      const files = getChildren(toImport.directory, {
        recursive: true,
        onlyFile: true,
        endWith: /\.(js|ts|mjs|mts)$/,
      });

      for (const file of files) {
        const { exports } = getExports(file.path);
        Object.assign(target, exports);
      }
    } else if ("from" in toImport && "imports" in toImport) {
      resolveImport(toImport as ImportsCommon, target);
    } else {
      for (const [name, values] of Object.entries(toImport)) {
        resolveImport({ from: name, imports: values as string[] }, target);
      }
    }
  }
}

/**
 * State shared by every instance of this plugin within one `buildViteConfig()`
 * call — one instance is created per Syora config (main + each module), and
 * they must all contribute to the same `:globals` virtual module and the
 * same `globals.d.ts`, not each overwrite the others' work.
 *
 * `total`/`completed` gate the file write to happen exactly once, after the
 * last instance's `buildStart` has merged its exports in — Rollup awaits
 * every plugin's `buildStart` before resolving the entry, so this is safe
 * even though `buildStart` is async.
 *
 * CAVEAT: this state is module-level and never reset. If `buildViteConfig()`
 * can run more than once in the same process (e.g. a long-lived dev server
 * restarting its config without a fresh Node process), exports from a
 * removed module would linger. Flag if that's a real scenario — it'd need
 * an explicit reset hook instead of this counter.
 */
let total = 0;
let completed = 0;
const sharedExports: Record<string, ExportMetadata> = {};
let sharedOutput: string | undefined;

export default createUnplugin((config?: GlobalConfig) => {
  total++;

  return {
    name: "syora:vue-globals",
    enforce: "pre",

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
      else if (id.startsWith(":globals:")) return id;
      return null;
    },

    /**
     * Reads from `sharedExports` (module-level, merged across every
     * instance) rather than a per-instance list, so it doesn't matter
     * which instance's `load` actually wins the resolution.
     */
    load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return null;

      const s = new MagicString("");
      const imports: string[] = [];
      const assignments: string[] = [];

      for (const exp of Object.values(sharedExports)) {
        if (["type", "interface", "unknown"].includes(exp.kind)) continue;

        const rPath = normalizeDir(relative(process.cwd(), exp.file));
        imports.push(`import { ${exp.name} } from "${rPath}";`);
        assignments.push(
          `Object.assign(globalThis, { "${exp.name}": ${exp.name} });`,
        );
      }

      s.prepend([...imports, "\n", ...assignments].join("\n"));

      return { code: s.toString(), map: s.generateMap({ hires: true }) };
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
