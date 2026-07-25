import { isAbsolute, join, relative, resolve } from "node:path";
import { resolveDir } from "@/utils";
import type { Config } from ".";

export function resolveConfig(config: Config = {}) {
  config.distDir ??= ".output";
  config.distDir = resolveDir(config.distDir);

  config.appDir ??= "app";
  config.appDir = resolveDir(config.appDir);

  config.output ??= ".app";
  config.output = resolveDir(config.output);

  config.globalsDir ??= [
    resolve(config.appDir, "globals"),
    resolve(config.appDir, "composables"),
  ];

  config.pagesDirs ??= [resolve(config.appDir, "pages")];

  config.pluginsDirs ??= [resolve(config.appDir, "plugins")];

  config.layoutsDirs ??= [resolve(config.appDir, "layouts")];

  config.componentsDirs ??= [resolve(config.appDir, "components")];

  config.ssr ??= true;

  return config as Required<Config>;
}
