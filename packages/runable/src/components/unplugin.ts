export * from "./types";

import { createUnplugin } from "unplugin";

import type { ComponentInfo, AutoComponentOptions } from "./types.js";
import { atomicWriteFile, toArray } from "@/utils/index.js";
import {
  getDefaultComponentName,
  getExplicitComponentName,
  slash,
} from "./utils.js";
import { injectComponents, normalizeName } from "./inject.js";
import { dirname, relative, resolve } from "node:path";

const VIRTUAL_ID = ":components";
const RESOLVED_VIRTUAL_ID = "\0" + VIRTUAL_ID;

export function shouldTransformComponents(
  id: string,
  transformInclude: string[] = [],
): boolean {
  if (!id.includes("node_modules")) return true;

  const file = id.split("?", 1)[0];
  return transformInclude.includes(file!);
}

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

    const declaredName = await getExplicitComponentName(absPath);
    let name: string | false | undefined = declaredName ?? defaultName;

    if (componentName) {
      try {
        const configuredName = componentName(absPath, defaultName);
        if (configuredName !== undefined) name = configuredName;
      } catch (err) {
        console.log(
          `[runable:components] componentName() threw for "${absPath}": ${(err as Error).message}`,
        );
        name = declaredName ?? defaultName;
      }
    }
    if (name === false) continue;
    if (name === undefined) name = declaredName ?? defaultName;

    const previous = map.get(normalizeName(name));
    if (previous && previous.path !== absPath) {
      console.log(
        `[runable:components] duplicate component name "${name}": ` +
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
      lines.push(
        `${JSON.stringify(component.name)}: typeof import('${rPath}')['default'];`,
      );
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
      name: "runable:components",
      enforce: "pre",

      async buildStart() {
        components = await scanComponents(options);
        generatedDts();

        components.forEach((component) => this.addWatchFile(component.path));
      },

      async watchChange(id) {
        if (shouldRescan(id)) {
          components = await scanComponents(options);
          generatedDts();
        }
      },
    },

    {
      name: "runable:components:transform",
      enforce: "post",

      transform(code, id) {
        // On ne cible que le code JS compilé issu des .vue (le bloc <script>+<template>)
        // if (!id.endsWith(".vue") && !id.includes(".vue?vue&type=")) return;
        if (!shouldTransformComponents(id, options.transformInclude)) return;

        return injectComponents(code, id, components);
      },
    },

    {
      name: "runable:components:virtual",

      resolveId(id: string) {
        if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
      },

      load(id: string) {
        if (id !== RESOLVED_VIRTUAL_ID) return;

        const imports = [...components.values()]
          .map((c, i) => `import __c${i} from ${JSON.stringify(c.path)}`)
          .join("\n");

        const registrations = [...components.values()]
          .map((c, i) => `  app.component(${JSON.stringify(c.name)}, __c${i})`)
          .join("\n");

        return `
${imports}

export default {
  install(app) {
${registrations}
  }
}
`;
      },
    },
  ];
});
