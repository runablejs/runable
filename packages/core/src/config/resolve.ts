import { resolve } from "node:path";
import { resolveDir } from "@/utils";
import type { ResolvedConfig } from "./load.js";
import type { SyoraConfig } from "./types.js";

export function resolveConfig(config: SyoraConfig & { cwd: string }) {
  config.cwd ??= process.cwd();

  config.distDir ??= ".output";
  config.distDir = resolveDir(config.distDir, config.cwd);

  config.appDir ??= "app";
  config.appDir = resolveDir(config.appDir, config.cwd);

  config.output ??= ".app";
  config.output = resolveDir(config.output, config.cwd);

  config.globals ??= [
    resolve(config.appDir, "globals"),
    resolve(config.appDir, "composables"),
  ];

  config.components = resolveComponents(config);

  config.pages ??= ["pages"];

  config.plugins ??= [resolve(config.appDir, "plugins")];

  config.layouts ??= [resolve(config.appDir, "layouts")];

  config.ssr ??= true;

  config.publicDir ??= resolve(process.cwd(), "public");
  if (typeof config.publicDir === "string") {
    config.publicDir = resolveDir(config.publicDir, config.cwd);
  }

  config.modules ??= [];

  config.css ??= [];

  return config as ResolvedConfig;
}

function resolveComponents(config: SyoraConfig) {
  let components = config.components ?? [];

  if (!Array.isArray(components)) components = [components];

  return components;
}
