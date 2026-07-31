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
  layouts?: string[];
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

type LayoutEntry = { parent: string; file: string; dtsImportPath: string };

/**
 * Shared across every instance of this plugin (one per Syora config: main +
 * each module) so `:layouts` and `layouts.d.ts` include every config's
 * layouts, not just whichever instance's `buildStart`/`load` happens to win.
 */
let total = 0;
let completed = 0;
const sharedLayouts: Record<string, LayoutEntry> = {};
let sharedOutput: string | undefined;

function getLayoutName(parentDir: string, filePath: string): string {
  const baseName = path.relative(parentDir, filePath).replace(/\.vue$/, "");
  return _.camelCase(baseName);
}

function collectLayouts(parentDir: string, output: string) {
  if (!fs.existsSync(parentDir)) return;

  const files = getChildren(parentDir, { onlyFile: true, endWith: /\.vue$/ });

  for (const file of files) {
    const name = getLayoutName(parentDir, file.path);
    const dtsImportPath = normalizeDir(
      path.relative(output, file.path).replace(/\.vue$/, ""),
    );

    sharedLayouts[name] = { parent: parentDir, file: file.path, dtsImportPath };
  }
}

function generateDts(output: string) {
  if (!Object.keys(sharedLayouts).length) return;

  const layoutNames = Object.keys(sharedLayouts);

  const imports = Object.entries(sharedLayouts)
    .map(([name, entry]) => {
      return `type ${name}Component = (typeof import('${entry.dtsImportPath}.vue'))['default'];`;
    })
    .join("\n");

  const layoutConfigUnion = layoutNames
    .map(
      (name) => `  | {
      name: "${name}";
      props?: ExtractComponentProps<${name}Component>;
    }`,
    )
    .join("\n");

  const layoutUnionType = layoutNames.map((name) => `"${name}"`).join(" | ");
  const pageMetaHelperPath = normalizeDir(
    path.relative(output, path.resolve(import.meta.dirname, "../router/types")),
  );

  const dtsContent = dtsTemplate
    .replaceAll("{{page_meta_helper_path}}", pageMetaHelperPath)
    .replaceAll("{{imports}}", imports)
    .replaceAll("{{layout_union_type}}", layoutUnionType)
    .replaceAll("{{layout_config_union}}", layoutConfigUnion);

  atomicWriteFile(path.resolve(output, "layouts.d.ts"), dtsContent);
}

function generateVirtualCode(): string {
  const objectEntries = Object.entries(sharedLayouts)
    .map(([name, { file }]) => {
      const rPath = normalizeDir(path.relative(process.cwd(), file));
      return `  "${name}": () => import('${rPath}').then(m => m.default || m)`;
    })
    .join(",\n");

  return template.replace("{{layoutsObject}}", objectEntries);
}

export default createUnplugin((config?: LayoutConfig) => {
  total++;

  return {
    name: "syora:vue-layouts",
    enforce: "pre",

    buildStart() {
      const { output = process.cwd(), layouts = [] } = config ?? {};
      sharedOutput ??= output;

      for (const dir of layouts) collectLayouts(dir, output);

      completed++;
      if (completed === total) generateDts(sharedOutput);
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) return generateVirtualCode();
    },
  };
});
