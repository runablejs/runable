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
  pluginsDirs?: string[];
  output?: string;
};

async function generateCode({
  pluginsDirs = [],
  output = process.cwd(),
}: PluginConfig) {
  // Key: Plugin variable name, Value: Absolute file path
  const pluginEntries: Record<string, string> = {};

  // Converts a file path into a valid JS variable name (CamelCase)
  function getPluginVariableName(parentDir: string, filePath: string): string {
    const baseName = relative(parentDir, filePath).replace(/\.(ts|js)$/, "");

    return camelCase(baseName) + "Plugin";
  }

  function getPlugins(parentDir: string) {
    parentDir = resolveDir(parentDir);

    if (!existsSync(parentDir)) return;

    // Scan all files ending with .ts or .js (excluding .d.ts)
    const files = getChildren(parentDir, {
      recursive: true,
      onlyFile: true,
      endWith: /\.(ts|js)$/,
    });

    for (const file of files) {
      if (file.path.endsWith(".d.ts")) continue;

      const varName = getPluginVariableName(parentDir, file.path);
      pluginEntries[varName] = file.path;
    }
  }

  async function generateDtsFile(): Promise<void> {
    const dtsPath = resolve(output, "plugins.d.ts");
    const pluginHelperPath = normalizeDir(
      relative(output, resolve(import.meta.dirname, "./types")),
    );

    // 2. Build the TypeScript intersection type mapping all plugins
    const entries = Object.values(pluginEntries);
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

  for (const pluginsDir of pluginsDirs) getPlugins(pluginsDir);

  // Write TS declarations
  await generateDtsFile();

  // 1. Generate Static Imports (e.g., import myPluginPlugin from "path/to/plugin.ts")
  const imports = Object.entries(pluginEntries)
    .map(([varName, filePath]) => {
      const rPath = normalizeDir(relative(process.cwd(), filePath));
      return `import ${varName} from ${JSON.stringify(rPath)};`;
    })
    .join("\n");

  // 2. Generate the key-value dictionary for the array
  const pluginArray = Object.keys(pluginEntries)
    .map((varName) => `  ${varName}`)
    .join(",\n");

  return template
    .replace("{{imports}}", imports)
    .replace("{{pluginArray}}", pluginArray);
}

export default createUnplugin((config?: PluginConfig) => {
  let code = "";

  return {
    name: "syora:vue-plugins",
    enforce: "pre",

    async buildStart() {
      code = await generateCode(config ?? {});
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) {
        return code;
      }
    },
  };
});
