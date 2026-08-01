import { atomicWriteFile, normalizeDir } from "@/utils";
import { useAllConfigs, useConfig } from "./load.ts";
import { join, relative, resolve } from "node:path";

const dtsTemplate = `
import type {
  ExtractConfigKey,
  ExtractConfigOptions,
} from "{{module_path}}"

// declare module "{{types_path}}" {
//   export interface Config {
//     {{entries}}
//   }
// }

// export {};
`;

export async function generateModulesDts(): Promise<void> {
  const config = useConfig();

  const configs = useAllConfigs().filter(
    (config) => config._parentName === "__main",
  );
  const entries = [];

  for (const { _configFile } of configs) {
    if (!_configFile) continue;

    const rPath = normalizeDir(relative(config.output, _configFile));
    entries.push(`typeof import("${rPath}")`);
  }

  const modulePath = normalizeDir(
    relative(config.output, resolve(import.meta.dirname, "./module.js")),
  );

  const typesPath = normalizeDir(
    relative(config.output, resolve(import.meta.dirname, "./types.js")),
  );

  const content = dtsTemplate
    .replaceAll("{{types_path}}", typesPath)
    .replace("{{module_path}}", modulePath)
    .replace(
      "{{entries}}",
      entries
        .map((entry) => {
          return [
            `[K in ExtractConfigKey<${entry}>]?: `,
            `ExtractConfigOptions<${entry}>;`,
          ].join("");
        })
        .join("&\n  "),
    )
    .trimStart();

  atomicWriteFile(join(config.output, "modules.d.ts"), content);
}
