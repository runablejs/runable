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

const VIRTUAL_ID = ":globals";
const RESOLVED_VIRTUAL_ID = "\0:globals";

function plugin(config?: GlobalConfig) {
  let { imports = [], output = process.cwd() } = config ?? {};

  if (!Array.isArray(imports)) imports = [imports];

  const accumulatedExports: Record<string, ExportMetadata> = {};
  const virtualModulesStore: Record<string, string> = {};

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

  function resolveImport(common: ImportsCommon) {
    const splits = common.from.split("/");
    const packageName = splits.slice(0, 2).join("/");
    const { dir, content } = getPackageJson(packageName, import.meta.baseUrl);

    const entry = resolvePackageEntry(
      content,
      splits.length > 2 ? splits.slice(2).join("/") : undefined,
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
      // console.log(files);
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

  // Atomic write of the global declaration file (.d.ts)
  atomicWriteFile(resolve(output, "globals.d.ts"), content);

  return Object.values(accumulatedExports);
}

export default createUnplugin((config?: GlobalConfig) => {
  let exports: ExportMetadata[];
  let { imports = [], output = process.cwd() } = config ?? {};

  let globalsEntries: (
    | { file: string; parent: string; importId: string }
    | { from: string; imports: string[] }
  )[] = [];
  const accumulatedExports: Record<string, ExportMetadata> = {};
  const virtualModulesStore: Record<string, string> = {};

  function getGlobalsDirs(parentDir: string) {
    parentDir = resolveDir(parentDir);

    for (const ext of [".js", ".ts"]) {
      let dir = parentDir;
      if (!dir.endsWith(ext)) dir = `${dir}${ext}`;

      if (!existsSync(dir)) continue;
      if (!statSync(dir).isFile()) continue;

      const relativePath = relative(process.cwd(), dir).replace(/\\/g, "/");

      globalsEntries.push({
        file: dir,
        parent: process.cwd(),
        importId: `:globals:${relativePath}`,
      });
    }

    if (!existsSync(parentDir)) return [];

    const files = getChildren(parentDir, {
      recursive: true,
      onlyFile: true,
      endWith: /\.(js|ts)$/,
    });

    files.forEach((file) => {
      const relativePath = relative(parentDir, file.path).replace(/\\/g, "/");

      globalsEntries.push({
        file: file.path,
        parent: parentDir,
        importId: `:globals:${relativePath}`,
      });
    });
  }

  return {
    name: "syora:vue-globals",
    enforce: "pre",

    // 1. REQUIRED: Tell Vite/Rollup that virtual:globals is handled in-memory
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
      else if (id.startsWith(":globals:")) return id;
      return null;
    },

    // 2. Load the cleaned source code for virtual modules intercepted by resolveId
    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) {
        const s = new MagicString("");
        const imports: string[] = [];
        const assignments: string[] = [];

        exports.forEach((exp) => {
          const namespace = `__${exp.name}`;
          const rPath = normalizeDir(relative(process.cwd(), exp.file));
          imports.push(`import * as ${namespace} from "${rPath}"`);
        });

        globalsEntries.forEach((entry, idx) => {
          const namespace = `_globals_file_${idx}`;

          // 1. Import the entire virtual module namespace
          imports.push(`import * as ${namespace} from "${entry.importId}"`);

          // 2. Map members individually to preserve class prototypes, getters, and default exports
          const fileExports = getExports(entry.file).exports;

          for (const [originalName, meta] of Object.entries(fileExports)) {
            let globalName = originalName;
            let sourceProperty = originalName;

            if (["type", "interface"].includes(meta.kind)) continue;

            if (meta.isDefault) {
              globalName = _.camelCase(parse(entry.file).name);
              sourceProperty = "default";
            }

            assignments.push(
              `  globalThis.${globalName} = ${namespace}.${sourceProperty};`,
            );
          }
        });

        const injection = [
          imports.join(";\n") + ";",
          `(() => {`,
          assignments.join("\n"),
          `})();`,
        ].join("\n");

        s.prepend(injection);

        return {
          code: s.toString(),
          map: s.generateMap({ hires: true }),
        };
      } else if (id.startsWith(":globals:")) {
        return virtualModulesStore[id] ?? "";
      }
      return null;
    },

    async buildStart() {
      exports = plugin(config);
    },
  };
});
