import fs from "node:fs";
import { getChildren } from "../utils/get-children.js";
import path from "node:path";
import _ from "lodash";
import { normalizeDir } from "../utils/dir.js";
import { atomicWriteFile } from "../utils/atomic-write-file.js";
import { createUnplugin } from "unplugin";

const VIRTUAL_ID = ":layouts";
const RESOLVED_VIRTUAL_ID = "\0:layouts";

type LayoutConfig = {
  layoutsDirs?: string[];
  output?: string;
};

const template = `
export const layouts = {
{{layoutsObject}}
};
`;

const dtsTemplate = `/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck

import type { Component, AllowedComponentProps, ComponentCustomProps, VNodeProps } from 'vue'

{{imports}}

// Helper type to extract only the user-defined props of a Vue Component, excluding internal Vue props
type ExtractComponentProps<T> = T extends new (...args: any[]) => { $props: infer P }
  ? Omit<P, keyof VNodeProps | keyof AllowedComponentProps | keyof ComponentCustomProps>
  : Record<string, any>;

declare module '{{page_meta_helper_path}}' {
  export interface PageMeta {
    /**
     * Define layout behavior with strict TypeScript verification and props validation:
     * - \`false\`: Disables the layout.
     * - \`string\`: Loads the specified layout without passing props.
     * - \`object\`: Loads the layout and strictly validates its associated props.
     */
    layout?: 
      | false 
      | {{layout_union_type}}
      | { name: {{layout_union_type}}; props?: Record<string, any> } // Loose backup
      | CustomLayoutConfigurations;
  }
}

type CustomLayoutConfigurations =
{{layout_config_union}};
`;

async function generateCode({
  output = process.cwd(),
  layoutsDirs = [],
}: LayoutConfig) {
  // Structure: Record<layoutName, { parent: string; file: string; dtsImportPath: string }>
  const layoutsEntries: Record<
    string,
    { parent: string; file: string; dtsImportPath: string }
  > = {};

  function getLayoutName(parentDir: string, filePath: string): string {
    const baseName = path.relative(parentDir, filePath).replace(/\.vue$/, "");
    return _.camelCase(baseName);
  }

  async function getLayouts(parentDir: string) {
    if (!fs.existsSync(parentDir)) return;

    const files = getChildren(parentDir, {
      onlyFile: true,
      endWith: /\.vue$/,
    });

    for (const file of files) {
      const name = getLayoutName(parentDir, file.path);

      // Calculate a relative path from where layouts.d.ts will live (root) to the layout file
      // to import its native component type definition
      const dtsImportPath = normalizeDir(
        path.relative(output, file.path).replace(/\.vue$/, ""),
      );

      layoutsEntries[name] = {
        parent: parentDir,
        file: file.path,
        dtsImportPath,
      };
    }
  }

  // Generates the TypeScript declaration file with typed props imports
  async function generateDts(): Promise<void> {
    if (!Object.keys(layoutsEntries).length) return;

    const layoutNames = Object.keys(layoutsEntries);

    // 1. Generate individual dynamic imports for each layout to extract their props types
    const imports = Object.entries(layoutsEntries)
      .map(([name, entry]) => {
        // We import the component instance type to extract its runtime props structure
        return `type ${name}Component = (typeof import('${entry.dtsImportPath}.vue'))['default'];`;
      })
      .join("\n");

    // 2. Map mapped types matching each layout name with its specific props
    const layoutConfigUnion = Object.keys(layoutsEntries)
      .map((name) => {
        return `  | {
      name: "${name}";
      props?: ExtractComponentProps<${name}Component>;
    }`;
      })
      .join("\n");

    const layoutUnionType = layoutNames.map((name) => `"${name}"`).join(" | ");
    const pageMetaHelperPath = normalizeDir(
      path.relative(
        output,
        path.resolve(import.meta.dirname, "../router/types"),
      ),
    );

    const dtsContent = dtsTemplate
      .replaceAll("{{page_meta_helper_path}}", pageMetaHelperPath)
      .replaceAll("{{imports}}", imports)
      .replaceAll("{{layout_union_type}}", layoutUnionType)
      .replaceAll("{{layout_config_union}}", layoutConfigUnion);

    const dtsPath = path.resolve(output, "layouts.d.ts");
    atomicWriteFile(dtsPath, dtsContent);
  }

  for (const layoutsDir of layoutsDirs) await getLayouts(layoutsDir);

  await generateDts();

  const objectEntries = Object.entries(layoutsEntries)
    .map(([name, { file }]) => {
      const rPath = normalizeDir(path.relative(process.cwd(), file));
      return `  "${name}": () => import('${rPath}').then(m => m.default || m)`;
    })
    .join(",\n");

  return template.replace("{{layoutsObject}}", objectEntries);
}

export default createUnplugin((config?: LayoutConfig) => {
  let code = "";

  return {
    name: "syora:vue-layouts",
    enforce: "pre",

    async buildStart() {
      code = await generateCode(config ?? {});
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) return code;
    },
  };
});
