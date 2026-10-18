import { join } from "node:path";
import merge from "lodash/merge.js";

import { resolveDir, resolveScanDirOptions, scanDirs } from "@/utils/index.js";
import type { ResolvedConfig, RunableConfig } from "./types.js";

/**
 * Applies defaults to every `RunableConfig` field and resolves relative paths
 * to absolute ones. Doesn't fill in the `ResolvedConfig` bookkeeping fields
 * (`_name`, `_index`, `_dependents`...) — the caller (`resolveAllConfigs` in
 * `config.ts`) sets those once the module graph is known, hence the cast at
 * the end.
 */
export function resolveConfig(config: RunableConfig & { _cwd: string }) {
  let _cwd = config._cwd ?? process.cwd();

  let _appDir = config.appDir ?? "app";
  _appDir = resolveDir(_appDir, _cwd);

  // Also the target of the `#build` alias set up below.
  let _output = config.output ?? ".app";
  _output = resolveDir(_output, _cwd);

  let _distDir = config.distDir ?? ".output";
  _distDir = resolveDir(_distDir, _cwd);

  // `publicDir: false` disables the public dir — leave it as-is instead of resolving it.
  let _publicDir = config.publicDir ?? "public";
  if (typeof _publicDir === "string") _publicDir = resolveDir(_publicDir, _cwd);

  // Components go through their own resolver (per-dir prefix/global options),
  // unlike the plain scan dirs below.

  const _components = scanDirs(
    resolveScanDirOptions(config.components ?? [join(_appDir, "components")], {
      extensions: ["vue", "js", "ts", "mjs", "mts", "cjs"],
      cwd: _cwd,
      pathPrefix: true,
    }),
  );

  const _layouts = scanDirs(
    resolveScanDirOptions(config.pages ?? [join(_appDir, "layouts")], {
      extensions: ["vue"],
      cwd: _cwd,
    }),
  );

  const _globals = scanDirs(
    resolveScanDirOptions(config.globals ?? [join(_appDir, "globals")], {
      extensions: ["js", "ts", "mjs", "mts", "cjs"],
      cwd: _cwd,
    }),
  );

  const _composables = scanDirs(
    resolveScanDirOptions(
      config.composables ?? [join(_appDir, "composables")],
      {
        extensions: ["js", "ts", "mjs", "mts", "cjs"],
        cwd: _cwd,
      },
    ),
  );

  const _pages = scanDirs(
    resolveScanDirOptions(config.pages ?? [join(_appDir, "pages")], {
      extensions: ["vue"],
      cwd: _cwd,
    }),
  );

  const _middlewares = scanDirs(
    resolveScanDirOptions(
      config.middlewares ?? [join(_appDir, "middlewares")],
      {
        extensions: ["js", "ts", "mjs", "mts", "cjs"],
        cwd: _cwd,
      },
    ),
  );

  const _plugins = scanDirs(
    resolveScanDirOptions(config.plugins ?? [join(_appDir, "plugins")], {
      extensions: ["js", "ts", "mjs", "mts", "cjs"],
      cwd: _cwd,
    }),
  );

  // Unlike the dirs above, CSS has no default directory — files must be declared explicitly.
  const _css = scanDirs(
    resolveScanDirOptions(config.css ?? [], {
      extensions: [
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
      cwd: _cwd,
    }),
  );

  // Expose the resolved output dir under `#build` so runtime code can import
  // from it regardless of what `output` was configured to.
  let _alias = merge(config.alias ?? {}, { "#build": _output });

  const resolvedConfig = {
    _cwd: _cwd,

    extendConfig: config.extendConfig,

    appDir: _appDir,
    output: _output,
    distdir: _distDir,
    distDir: _distDir,
    publicDir: _publicDir,

    components: _components,
    layouts: _layouts,
    globals: _globals,
    composables: _composables,
    pages: _pages,
    extendRoutes: config.extendRoutes,
    middlewares: _middlewares,
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

    _runtime: { public: {} },

    // Keep the raw, pre-resolution config around (mirrors `defineConfig` on `ResolvedConfig`).
    defineConfig: config,
  } as unknown as ResolvedConfig;

  return resolvedConfig;
}
