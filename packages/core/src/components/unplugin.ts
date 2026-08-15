export * from "./types";

import { createUnplugin } from "unplugin";

import type { ComponentInfo, AutoComponentOptions } from "./types.js";
import { atomicWriteFile, toArray } from "@/utils/index.js";
import { getDefaultComponentName, slash } from "./utils.js";
import { injectComponents, normalizeName } from "./inject.js";
import { dirname, relative, resolve } from "node:path";

export async function scanComponents(
  options: AutoComponentOptions,
): Promise<Map<string, ComponentInfo>> {
  const map = new Map<string, ComponentInfo>();
  const dirs = toArray(options.dirs ?? []);

  for (const dirConfig of dirs) {
    const { extensions, pathPrefix, componentName, file, parent, prefix } =
      dirConfig;

    const absPath = slash(file);
    const defaultName = getDefaultComponentName(
      absPath,
      parent,
      pathPrefix ?? true,
      prefix,
    );

    if (!defaultName) continue;

    let name: string | false | undefined = defaultName;

    if (componentName) {
      try {
        name = componentName(absPath, defaultName);
      } catch (err) {
        console.log(
          `[syora:components] componentName() threw for "${absPath}": ${(err as Error).message}`,
        );
        name = defaultName;
      }
    }
    if (name === false) continue;
    if (name === undefined) name = defaultName;

    const previous = map.get(normalizeName(name));
    if (previous && previous.path !== absPath) {
      console.log(
        `[syora:components] duplicate component name "${name}": ` +
          `"${previous.path}" is overridden by "${absPath}"`,
      );
    }
    const ext = extensions.find((e) => absPath.endsWith(`.${e}`)) ?? "";
    map.set(normalizeName(name), { name, path: absPath, ext });
  }

  return map;
}

export default createUnplugin<AutoComponentOptions>((options) => {
  let components: Map<string, ComponentInfo>;

  function generatedDts() {
    if (!options.dts) return;

    const outFile = options.dts;
    const lines: string[] = [];

    components.forEach((component) => {
      const rPath = relative(dirname(outFile), component.path);
      lines.push(`${component.name}: typeof import('${rPath}')['default'];`);
    });

    const content = `
declare module 'vue' {
  export interface GlobalComponents {
    ${lines.join("\n    ")}
  }
}

export {}
    `;

    atomicWriteFile(outFile, content);
  }

  const shouldRescan = (path: string) => {
    const dirs = toArray(options.dirs ?? []);
    return dirs.some((d) => resolve(path).startsWith(resolve(d.parent)));
  };

  return [
    {
      name: "syora:components",
      enforce: "pre",

      async buildStart() {
        components = await scanComponents(options);
        generatedDts();

        components.forEach((component) => this.addWatchFile(component.path));
      },

      async watchChange(id) {
        if (shouldRescan(id)) await scanComponents(options);
      },
    },

    {
      name: "syora:components:transform",
      enforce: "post",

      transform(code, id) {
        // On ne cible que le code JS compilé issu des .vue (le bloc <script>+<template>)
        // if (!id.endsWith(".vue") && !id.includes(".vue?vue&type=")) return;
        if (id.includes("node_modules")) return;

        return injectComponents(code, id, components);
      },
    },
  ];
});
