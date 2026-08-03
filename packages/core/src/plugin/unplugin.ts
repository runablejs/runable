import { existsSync, statSync } from "node:fs";
import { basename, relative, resolve } from "node:path";

import camelCase from "lodash/camelCase.js";
import fg from "fast-glob";
import { createUnplugin } from "unplugin";

import { getChildren } from "../utils/get-children.js";
import { atomicWriteFile } from "../utils/atomic-write-file.js";
import {
  normalizeDir,
  removeFileExtension,
  resolveDir,
  ResolvedScanDir,
} from "../utils/dir/index.js";

const VIRTUAL_ID = ":plugins";
const RESOLVED_VIRTUAL_ID = "\0:plugins";

const template = `
{{imports}}

export const plugins = [
{{pluginArray}}
];
`;

const dtsTemplate = `/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck

import type { VuePluginObject } from "{{plugin_types_path}}";

type Decorate<T extends Record<string, any>> = {
  [K in keyof T as K extends string ? \`\$\${K}\` : never]: T[K];
};

type InjectionType<A extends VuePluginObject> = A extends {
  default: VuePluginObject<infer T>;
}
  ? Decorate<T>
  : unknown;

type Injections = {{custom_properties_union}};

declare module 'vue' {
  interface ComponentCustomProperties extends Injections {}
}

export {};
`;

export type PluginOptions = {
  dirs: ResolvedScanDir[];
  output?: string;
};

/**
 * Which build a plugin file is allowed into, derived from its filename:
 * `*.server.*` -> only the SSR build, `*.client.*` -> only the client
 * build, anything else -> both.
 */
type PluginEnvironment = "server" | "client" | "universal";

interface PluginEntry {
  filePath: string;
  environment: PluginEnvironment;
}

/**
 * Shared across every instance of this plugin (one per Syora config: main +
 * each module) so `:plugins` and `plugins.d.ts` include every config's
 * plugins, not just whichever instance's `buildStart`/`load` happens to win.
 */
let total = 0;
let completed = 0;
const sharedPlugins: Record<string, PluginEntry> = {};
let sharedOutput: string | undefined;

function getPluginVariableName(filePath: string, parentDir?: string): string {
  filePath = removeFileExtension(filePath);
  if (parentDir) filePath = relative(parentDir, filePath);

  if (parentDir) relative(parentDir, filePath);
  else basename(filePath);

  const baseName = parentDir
    ? relative(parentDir, filePath)
    : basename(filePath);

  return camelCase(baseName) + "Plugin";
}

/** `foo.server.ts` -> "server", `foo.client.ts` -> "client", anything else -> "universal" (loaded in both builds). */
function getPluginEnvironment(filePath: string): PluginEnvironment {
  if (/\.server\.(ts|js)$/.test(filePath)) return "server";
  if (/\.client\.(ts|js)$/.test(filePath)) return "client";
  return "universal";
}

/** Whether a plugin's declared environment matches the build currently being generated. */
function matchesEnvironment(
  environment: PluginEnvironment,
  isSsr: boolean,
): boolean {
  if (environment === "universal") return true;
  return isSsr ? environment === "server" : environment === "client";
}

function collectPlugins(lists: ResolvedScanDir[]) {
  for (const ntry of lists) {
    for (const dir of ntry.dirs) {
      if (existsSync(dir) && statSync(dir).isFile()) {
        const varName = getPluginVariableName(dir);

        sharedPlugins[varName] = {
          filePath: dir,
          environment: getPluginEnvironment(dir),
        };

        continue;
      }

      const files = fg.sync(ntry.extGlob, {
        ...ntry,
        cwd: dir,
        absolute: true,
        onlyFiles: true,
      });

      for (const file of files) {
        const varName = getPluginVariableName(file, dir);

        sharedPlugins[varName] = {
          filePath: file,
          environment: getPluginEnvironment(file),
        };
      }
    }
  }
}

function collectPlugins0(parentDir: string) {
  parentDir = resolveDir(parentDir);
  if (!existsSync(parentDir)) return;

  const files = getChildren(parentDir, {
    recursive: true,
    onlyFile: true,
    endWith: /\.(ts|js)$/,
  });

  for (const file of files) {
    if (file.path.endsWith(".d.ts")) continue;

    const varName = getPluginVariableName(parentDir, file.path);
    sharedPlugins[varName] = {
      filePath: file.path,
      environment: getPluginEnvironment(file.path),
    };
  }
}

function generateDtsFile(output: string) {
  const dtsPath = resolve(output, "plugins.d.ts");
  const pluginHelperPath = normalizeDir(
    relative(output, resolve(import.meta.dirname, "./types")),
  );

  const entries = Object.values(sharedPlugins);
  let customPropertiesUnion = "{}";

  if (entries.length > 0) {
    customPropertiesUnion =
      "\n  " +
      entries
        .map((entry) => {
          const relativePluginPath = normalizeDir(
            relative(output, entry.filePath),
          );
          return `InjectionType<typeof import("${relativePluginPath}")>`;
        })
        .join("&\n  ");
  }

  try {
    const content = dtsTemplate
      .replaceAll("{{plugin_types_path}}", pluginHelperPath)
      .replaceAll("{{custom_properties_union}}", customPropertiesUnion);

    atomicWriteFile(dtsPath, content);
  } catch (error) {
    console.error("[Vite Plugin] Failed to write plugins.d.ts:", error);
  }
}

/**
 * Only plugins matching the current build (`isSsr`) get an `import` line —
 * a `*.server.*` plugin is simply never imported into the client's
 * `:plugins` module (and vice versa), rather than shipped and guarded at
 * runtime. Works the same in `vite dev` and `vite build`, since inclusion
 * happens at `load()` time per the `ssr` flag Vite passes for each call.
 */
function generateVirtualCode(isSsr: boolean): string {
  const included = Object.entries(sharedPlugins).filter(([, entry]) =>
    matchesEnvironment(entry.environment, isSsr),
  );

  const imports = included
    .map(([varName, entry]) => {
      const rPath = normalizeDir(relative(process.cwd(), entry.filePath));
      return `import ${varName} from ${JSON.stringify(rPath)};`;
    })
    .join("\n");

  const pluginArray = included.map(([varName]) => `  ${varName}`).join(",\n");

  return template
    .replace("{{imports}}", imports)
    .replace("{{pluginArray}}", pluginArray);
}

export default createUnplugin((config?: PluginOptions) => {
  total++;

  return {
    name: "syora:vue-plugins",
    enforce: "pre",

    buildStart() {
      const { dirs = [], output = process.cwd() } = config ?? {};
      sharedOutput ??= output;

      collectPlugins(dirs);

      completed++;
      if (completed === total) generateDtsFile(sharedOutput);
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
    },

    vite: {
      load(id, options) {
        if (id !== RESOLVED_VIRTUAL_ID) return;

        const isSsr = !!options?.ssr;
        return generateVirtualCode(isSsr);
      },
    },
  };
});
