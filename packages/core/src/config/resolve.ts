import { join } from "node:path";
import merge from "lodash/merge.js";

import { resolveDir, resolveScanDirs_v2 } from "@/utils";
import type { ResolvedConfig, SyoraConfig } from "./types.js";
import { resolveComponentDirs } from "@/components/options.js";

/**
 * Applies defaults to every `SyoraConfig` field and resolves relative paths
 * to absolute ones. Doesn't fill in the `ResolvedConfig` bookkeeping fields
 * (`_name`, `_index`, `_dependents`...) — the caller (`resolveAllConfigs` in
 * `config.ts`) sets those once the module graph is known, hence the cast at
 * the end.
 */
export function resolveConfig(config: SyoraConfig & { cwd: string }) {
  let _cwd = config.cwd ?? process.cwd();

  let _appDir = config.appDir ?? "app";
  _appDir = resolveDir(_appDir, _cwd);

  // Also the target of the `#app` alias set up below.
  let _output = config.output ?? ".app";
  _output = resolveDir(_output, _cwd);

  let _distdir = config.distdir ?? ".output";
  _distdir = resolveDir(_distdir, _cwd);

  // `publicDir: false` disables the public dir — leave it as-is instead of resolving it.
  let _publicDir = config.publicDir ?? "public";
  if (typeof _publicDir === "string") _publicDir = resolveDir(_publicDir, _cwd);

  // Components go through their own resolver (per-dir prefix/global options),
  // unlike the plain scan dirs below.
  const _comps = config.components ?? [join(_appDir, "components")];
  const _components = resolveComponentDirs(_cwd, _comps);

  let _layouts = config.layouts ?? [join(_appDir, "layouts")];
  _layouts = resolveScanDirs_v2(_cwd, _layouts, {
    defaultExtensions: ["vue", "js", "ts", "mjs", "mts", "cjs"],
  });

  let _globals = config.globals ?? [join(_appDir, "globals")];
  _globals = resolveScanDirs_v2(_cwd, _globals, {
    defaultExtensions: ["js", "ts", "mjs", "mts", "cjs"],
  });

  let _composables = config.composables ?? [join(_appDir, "composables")];
  _composables = resolveScanDirs_v2(_cwd, _composables, {
    defaultExtensions: ["js", "ts", "mjs", "mts", "cjs"],
  });

  let _pages = config.pages ?? [join(_appDir, "pages")];
  _pages = resolveScanDirs_v2(_cwd, _pages, {
    defaultExtensions: ["vue", "js", "ts", "mjs", "mts", "cjs"],
  });

  let _plugins = config.plugins ?? [join(_appDir, "plugins")];
  _plugins = resolveScanDirs_v2(_cwd, _plugins, {
    defaultExtensions: ["js", "ts", "mjs", "mts"],
  });

  // Unlike the dirs above, CSS has no default directory — files must be declared explicitly.
  let _css = config.css ?? [];
  _css = resolveScanDirs_v2(_cwd, _css, {
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

  // Expose the resolved output dir under `#app` so runtime code can import
  // from it regardless of what `output` was configured to.
  let _alias = merge(config.alias ?? {}, { "#app": _output });

  return {
    cwd: _cwd,
    _cwd: _cwd,

    appDir: _appDir,
    output: _output,
    distdir: _distdir,
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

    // Keep the raw, pre-resolution config around (mirrors `defineConfig` on `ResolvedConfig`).
    defineConfig: config,
  } as unknown as ResolvedConfig;
}
