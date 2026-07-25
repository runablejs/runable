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
import { resolveDir } from "../utils/dir.js";

type GlobalConfig = {
  globalsDirs?: string[];
  output?: string;
};

const VIRTUAL_ID = ":globals";
const RESOLVED_VIRTUAL_ID = "\0:globals";

export default createUnplugin((config?: GlobalConfig) => {
  const { globalsDirs = [], output = process.cwd() } = config ?? {};
  // const outputDir = join(process.cwd(), ".syora", "app");

  let globalsEntries: { file: string; parent: string; importId: string }[] = [];
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
      globalsEntries = [];

      for (const globalsDir of globalsDirs) {
        getGlobalsDirs(globalsDir);
      }

      for (const entry of globalsEntries) {
        const { code, exports: fileExports } = getExports(entry.file, {
          // target: process.cwd(),
        });

        // Store the tree-shaken code for the load() hook
        virtualModulesStore[entry.importId] = code;

        // Process export names to avoid collisions on the "default" keyword
        for (const [originalName, meta] of Object.entries(fileExports)) {
          let globalName = originalName;

          if (meta.isDefault) {
            // Convert default export to a camelCased file name
            globalName = _.camelCase(parse(entry.file).name);
          }

          // Warning log in case a global variable name is duplicated across files
          if (accumulatedExports[globalName]) {
            console.warn(
              `Collision detected: The global variable "${globalName}" is defined multiple times.`,
            );
          }

          accumulatedExports[globalName] = {
            ...meta,
            name: globalName, // Override with the resolved final name
          };
        }
      }

      // Atomic write of the global declaration file (.d.ts)
      atomicWriteFile(
        resolve(output, "globals.d.ts"),
        generateGlobalTypesFromExports(accumulatedExports, {
          targetPath: output,
        }),
      );
    },
  };
});
