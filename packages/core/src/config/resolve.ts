import { resolve } from "node:path";
import { resolveDir } from "@/utils";
import type { Config, ResolvedConfig } from "./index.js";

export function resolveConfig(config: Config = {}) {
  config.cwd ??= process.cwd();

  config.distDir ??= ".output";
  config.distDir = resolveDir(config.distDir, config.cwd);

  config.appDir ??= "app";
  config.appDir = resolveDir(config.appDir, config.cwd);

  config.output ??= ".app";
  config.output = resolveDir(config.output, config.cwd);

  config.globalsDir ??= [
    resolve(config.appDir, "globals"),
    resolve(config.appDir, "composables"),
  ];

  config.components = resolveComponents(config);

  config.pagesDirs ??= [resolve(config.appDir, "pages")];

  config.pluginsDirs ??= [resolve(config.appDir, "plugins")];

  config.layoutsDirs ??= [resolve(config.appDir, "layouts")];

  config.ssr ??= true;

  config.publicDir ??= resolve(process.cwd(), "public");
  if (typeof config.publicDir === "string") {
    config.publicDir = resolveDir(config.publicDir, config.cwd);
  }

  config.modules ??= [];

  return config as ResolvedConfig;
}

function resolveComponents(config: Config) {
  let components = config.components ?? [];

  if (!Array.isArray(components)) components = [components];

  components = components.map((component) => {
    if (typeof component === "string") {
      component = resolveDir(component, config.cwd);
    }

    return component;
  });

  return components;
}
