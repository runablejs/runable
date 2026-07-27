import { existsSync, statSync } from "node:fs";
import { join, parse, relative, resolve } from "node:path";
import MagicString from "magic-string";
import _ from "lodash";
import { getChildren } from "../utils/get-children.js";
import { createUnplugin } from "unplugin";
import {
  generateGlobalTypesFromExports,
  getExports,
  type ExportMetadata,
} from "../utils/get-exports.js";
import { atomicWriteFile } from "../utils/atomic-write-file.js";
import { normalizeDir, resolveDir } from "../utils/dir.js";
import { getPackageJson } from "@/utils/pkg.js";
import { resolvePackageEntry } from "@/utils/pkg-resolve-entry.js";

/**
 * Built-in presets: shortcuts for commonly used libraries so users don't
 * have to list every named import manually (e.g. `imports: "vue"`).
 */
const pressetNames = ["vue", "vue-router"] as const;
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
  "vue-router": {
    from: "vue-router",
    imports: [
      "onBeforeRouteLeave",
      "onBeforeRouteUpdate",
      "useRoute",
      "useRouter",
    ],
  },
};

type Arrayable<T> = T | Array<T>;
type ImportPresset = keyof typeof pressets;
type ImportsMap = Record<string, string[]>;
type ImportsCommon = { from: string; imports: string[] };

type GlobalConfig = {
  output?: string;
  imports?: Arrayable<
    | { directory: string }
    | { file: string }
    | ImportPresset
    | ImportsCommon
    | ImportsMap
  >;
};

// Public id used in user code (e.g. `import ":globals"`), and its resolved
// internal id (the leading "\0" tells other plugins this is a virtual
// module and should not be handled by the filesystem resolver).
const VIRTUAL_ID = ":globals";
const RESOLVED_VIRTUAL_ID = "\0:globals";

/**
 * Collects every named export that should be exposed as a global, from
 * presets, individual files, whole directories, or npm packages, and
 * generates the corresponding `globals.d.ts` declaration file.
 *
 * @param config - Plugin configuration (imports sources and output directory)
 * @returns The list of resolved exports to be injected at runtime by the `load` hook
 */
function plugin(config?: GlobalConfig) {
  let { imports = [], output = process.cwd() } = config ?? {};

  if (!Array.isArray(imports)) imports = [imports];

  const accumulatedExports: Record<string, ExportMetadata> = {};

  /**
   * Resolves a file path by trying each supported extension in order and
   * returning the first one that exists on disk, since callers may omit it.
   *
   * @param file - The file path, with or without extension
   * @returns The resolved path with extension, or `undefined` if none matched
   */
  function resolveFile(file: string) {
    let relativePath;

    for (const ext of [".js", ".ts", ".mjs", ".mts"]) {
      let dir = file;
      if (!dir.endsWith(ext)) dir = `${dir}${ext}`;

      if (!existsSync(dir)) continue;
      if (!statSync(dir).isFile()) continue;

      relativePath = dir;

      break;
    }

    return relativePath;
  }

  /**
   * Resolves a `{ from, imports }` entry (a preset or a user-declared
   * package import) to its actual file on disk via the package's
   * package.json, then registers each named import as a global.
   *
   * Supports subpath imports, e.g. `"@unhead/schema-org/vue"` resolves the
   * package `@unhead/schema-org` with subpath `"vue"`.
   *
   * @param common - The package name (`from`) and the named imports to expose as globals
   */
  function resolveImport(common: ImportsCommon) {
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
      const meta: ExportMetadata = {
        name,
        kind: "const",
        isDefault: false,
        file,
        fileType,
      };

      Object.assign(accumulatedExports, { [name]: meta });
    }
  }

  for (const toImport of imports) {
    if (typeof toImport === "string") resolveImport(pressets[toImport]);
    else if ("file" in toImport && typeof toImport.file === "string") {
      const file = resolveFile(toImport.file);
      if (!file) continue;

      const { code, exports } = getExports(file);
      Object.assign(accumulatedExports, exports);
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
        const { code, exports } = getExports(file.path);
        Object.assign(accumulatedExports, exports);
      }
    } else if ("from" in toImport && "imports" in toImport) {
      resolveImport(toImport as ImportsCommon);
    } else {
      const commons = Object.entries(toImport).map(([name, values]) => {
        return { from: name, imports: values as string[] };
      }) as ImportsCommon[];

      for (const common of commons) {
        resolveImport(common);
      }
    }
  }

  const { content } = generateGlobalTypesFromExports(accumulatedExports, {
    targetPath: output,
  });

  atomicWriteFile(resolve(output, "globals.d.ts"), content);

  return Object.values(accumulatedExports);
}

export default createUnplugin((config?: GlobalConfig) => {
  let exports: ExportMetadata[];

  return {
    name: "syora:vue-globals",
    enforce: "pre",

    /**
     * Tells Vite/Rollup that the `":globals"` virtual module (and any
     * `":globals:*"` id) is handled by this plugin rather than resolved
     * from the filesystem.
     *
     * @param id - The module id being resolved
     * @returns The resolved internal id, or `null` if not handled by this plugin
     */
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
      else if (id.startsWith(":globals:")) return id;
      return null;
    },

    /**
     * Generates the virtual module's content: imports every collected
     * export and assigns it onto `globalThis`, making it available
     * everywhere without an explicit import in user code.
     *
     * @param id - The module id being loaded
     * @returns The generated code and source map, or `null` if not handled by this plugin
     */
    load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return null;

      const s = new MagicString("");
      const imports: string[] = [];
      const assignments: string[] = [];

      exports.forEach((exp) => {
        if (["type", "interface", "unknown"].includes(exp.kind)) return;

        const namespace = exp.name;
        const rPath = normalizeDir(relative(process.cwd(), exp.file));

        imports.push(`import { ${namespace} } from "${rPath}";`);

        // assignments.push(namespace);
        assignments.push(
          `Object.assign(globalThis, { "${namespace}": ${namespace} });`,
        );
      });

      // const exportDefault = `export default {\n  ${assignments.join(",\n  ")}\n}`;

      const injection = [...imports, "\n", ...assignments].join("\n");

      s.prepend(injection);

      return {
        code: s.toString(),
        map: s.generateMap({ hires: true }),
      };
    },

    // transform(code, id) {
    //   if (
    //     id.includes("node_modules") ||
    //     ![".vue", ".ts", ".js", ".mjs", ".mts"].includes(parse(id).ext)
    //   ) {
    //     return null;
    //   }

    //   return `import __global ":globals";\n\n` + code;
    // },

    /**
     * Resolves all configured imports once per build, before any module is loaded.
     */
    async buildStart() {
      exports = plugin(config);
    },
  };
});
