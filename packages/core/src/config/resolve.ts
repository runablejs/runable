import { join } from "node:path";
import merge from "lodash/merge.js";

import { resolveDir, resolveScanDirs } from "@/utils";
import type { ResolvedConfig, SyoraConfig } from "./types.js";
import { resolveComponentDirs } from "@/components/options.js";

export function resolveConfig_v2(config: SyoraConfig & { cwd: string }) {
  let _cwd = config.cwd ?? process.cwd();

  let _appDir = config.appDir ?? "app";
  _appDir = resolveDir(_appDir, _cwd);

  let _output = config.output ?? ".app";
  _output = resolveDir(_output, _cwd);

  let _publicDir = config.publicDir ?? "public";
  if (typeof _publicDir === "string") _publicDir = resolveDir(_publicDir, _cwd);

  const _comps = config.components ?? [join(_appDir, "components")];
  const _components = resolveComponentDirs(_cwd, _comps);

  let _layouts = config.layouts ?? [join(_appDir, "layouts")];
  _layouts = resolveScanDirs(_cwd, _layouts, {
    defaultExtensions: ["vue", "js", "ts", "mjs", "mts", "cjs"],
  });

  let _globals = config.globals ?? [join(_appDir, "globals")];
  _globals = resolveScanDirs(_cwd, _globals, {
    defaultExtensions: ["js", "ts", "mjs", "mts"],
  });

  let _composables = config.composables ?? [join(_appDir, "composables")];
  _composables = resolveScanDirs(_cwd, _composables, {
    defaultExtensions: ["js", "ts", "mjs", "mts", "cjs"],
  });

  let _pages = config.pages ?? [join(_appDir, "pages")];
  _pages = resolveScanDirs(_cwd, _pages, {
    defaultExtensions: ["vue", "js", "ts", "mjs", "mts", "cjs"],
  });

  let _plugins = config.plugins ?? [join(_appDir, "plugins")];
  _plugins = resolveScanDirs(_cwd, _plugins, {
    defaultExtensions: ["js", "ts", "mjs", "mts", "cjs"],
  });

  let _css = config.css ?? [];
  _css = resolveScanDirs(_cwd, _css, {
    defaultExtensions: [
      "css",
      "scss",
      "sass",
      "less",
      "styl",
      "pcss",
      "sss",
      "wxss",
      "acss",
    ],
  });

  let _alias = merge(config.alias ?? {}, { "#app": _output });

  return {
    cwd: _cwd,
    appDir: _appDir,
    output: _output,
    publicDir: _publicDir,

    components: _components,
    layouts: _layouts,
    globals: _globals,
    composables: _composables,
    pages: _pages,
    plugins: _plugins,
    css: _css,

    alias: _alias,
    modules: config.modules ?? [],

    ssr: config.ssr ?? true,
    baseUrl: config.baseUrl,
    devtools: config.devtools,
    head: config.head,
    siteUrl: config.siteUrl,
    vite: config.vite,

    defineConfig: config,
  } as unknown as ResolvedConfig;
}
