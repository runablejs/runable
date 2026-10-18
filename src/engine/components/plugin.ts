import { dirname, join, relative } from "node:path";
import { createUnplugin } from "unplugin";

import { atomicWriteFile } from "@/utils/atomic-write-file.js";
import type { ComponentDirResolved, ComponentInfo } from "./types.js";
import {
  getDefaultComponentName,
  getExplicitComponentName,
  injectComponents,
  normalizeName,
} from "./utils.js";

const VIRTUAL_ID = ":components";
const RESOLVED_VIRTUAL_ID = "\0" + VIRTUAL_ID;

export const componentPlugin = createUnplugin<{
  dirs: ComponentDirResolved[];
  output: string;
}>((options) => {
  let components: Map<string, ComponentInfo>;
  const files = options.dirs.map((dir) => dir.files).flat();

  async function scanComponents() {
    const map = new Map<string, ComponentInfo>();

    for (const dir of options.dirs) {
      const parent = dir.cwd!;
      const pathPrefix = dir.pathPrefix ?? true;
      const prefix = dir.prefix;

      for (const file of dir.files) {
        const defaultName = getDefaultComponentName(
          file,
          parent,
          pathPrefix,
          prefix,
        );

        if (!defaultName) continue;

        const declaredName = await getExplicitComponentName(file);
        let name: string | false | undefined = declaredName ?? defaultName;

        if (dir.componentName) {
          try {
            const configuredName = dir.componentName(file, defaultName);
            if (configuredName !== undefined) name = configuredName;
          } catch (err) {
            console.log(
              `[runable:components] componentName() threw for "${file}": ${(err as Error).message}`,
            );
            name = declaredName ?? defaultName;
          }
        }
        if (name === false) continue;
        if (name === undefined) name = declaredName ?? defaultName;

        const previous = map.get(normalizeName(name));
        if (previous && previous.path !== file) {
          console.log(
            `[runable:components] duplicate component name "${name}": ` +
              `"${previous.path}" is overridden by "${file}"`,
          );
        }

        const ext = dir.extensions?.find((e) => file.endsWith(e));
        map.set(normalizeName(name), { name, path: file, ext: ext ?? "" });
      }
    }

    return map;
  }

  function generatedDts() {
    const lines: string[] = [];
    const outFile = join(options.output, "components.d.ts");

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

  return [
    {
      name: "runable:components",
      enforce: "pre",

      async buildStart() {
        components = await scanComponents();

        generatedDts();
        components.forEach((component) => this.addWatchFile(component.path));
      },

      async watchChange(id) {
        const file = id.split("?", 1)[0];
        const should = file && files.includes(file);

        if (should) {
          components = await scanComponents();
          generatedDts();
        }
      },
    },

    {
      name: "runable:components:transform",
      enforce: "post",

      transform(code, id) {
        const file = id.split("?", 1)[0];
        const should = file && files.includes(file);

        if (!should) return;

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
}).vite;
