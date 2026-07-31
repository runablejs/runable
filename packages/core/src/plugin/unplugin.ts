import { existsSync } from "node:fs";
import { getChildren } from "../utils/get-children.js";
import { relative, resolve } from "node:path";
import { atomicWriteFile } from "../utils/atomic-write-file.js";
import { normalizeDir, resolveDir } from "../utils/dir.js";
import { createUnplugin } from "unplugin";
import camelCase from "lodash/camelCase.js";

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

type PluginConfig = {
  plugins?: string[];
  output?: string;
};

/**
 * Shared across every instance of this plugin (one per Syora config: main +
 * each module) so `:plugins` and `plugins.d.ts` include every config's
 * plugins, not just whichever instance's `buildStart`/`load` happens to win.
 */
let total = 0;
let completed = 0;
const sharedPlugins: Record<string, string> = {};
let sharedOutput: string | undefined;

function getPluginVariableName(parentDir: string, filePath: string): string {
  const baseName = relative(parentDir, filePath).replace(/\.(ts|js)$/, "");
  return camelCase(baseName) + "Plugin";
}

function collectPlugins(parentDir: string) {
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
    sharedPlugins[varName] = file.path;
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
        .map((filePath) => {
          const relativePluginPath = normalizeDir(relative(output, filePath));
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

function generateVirtualCode(): string {
  const imports = Object.entries(sharedPlugins)
    .map(([varName, filePath]) => {
      const rPath = normalizeDir(relative(process.cwd(), filePath));
      return `import ${varName} from ${JSON.stringify(rPath)};`;
    })
    .join("\n");

  const pluginArray = Object.keys(sharedPlugins)
    .map((varName) => `  ${varName}`)
    .join(",\n");

  return template
    .replace("{{imports}}", imports)
    .replace("{{pluginArray}}", pluginArray);
}

export default createUnplugin((config?: PluginConfig) => {
  total++;

  return {
    name: "syora:vue-plugins",
    enforce: "pre",

    buildStart() {
      const { plugins = [], output = process.cwd() } = config ?? {};
      sharedOutput ??= output;

      for (const dir of plugins) collectPlugins(dir);

      completed++;
      if (completed === total) generateDtsFile(sharedOutput);
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) return generateVirtualCode();
    },
  };
});
