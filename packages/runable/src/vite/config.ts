import { join, resolve } from "node:path";

import { mergeConfig, type UserConfig } from "vite";
import vue from "@vitejs/plugin-vue";

import { useAllConfigs } from "@/config/load.js";
import { resolveScanDirs_v2 } from "@/utils/dir/index.js";

import plugin, { type PluginOptions } from "../plugin/unplugin.js";
import appVue from "../app-vue/unplugin.js";
import routeMiddleWare, {
  RouterMiddlewaresOptions,
} from "../router/middleware/unplugin.js";
import layout, { type LayoutOptions } from "../layout/unplugin.js";
import components, {
  type AutoComponentOptions,
  type ComponentDir,
} from "../components/unplugin.js";
import configPlugin from "../config/unplugin.js";
import css, { type CssOptions } from "../css/unplugin.js";
import importMeta from "../import-meta/unplugin.js";
import runtime from "../runtime/unplugin.js";
import globals, {
  type GlobalConfig,
  type GlobalOptionsImports,
} from "../globals/unplugin.js";
import { ResolvedConfig } from "@/config/types.js";
import { buildRoutes } from "@/router/builder.js";
import type { EditableRouteTreeNode } from "@/router/types.js";
import { PagesOptions } from "@/router/pages.js";
import { watchConfigDirs } from "./watch-config-dirs.js";

declare module "vite" {
  interface UserConfig {
    runableConfig: ResolvedConfig;
  }
}

export function buildViteConfig(): UserConfig {
  const configs = useAllConfigs();
  const main = configs[0]!;

  const builtinGlobalImports: GlobalOptionsImports[] = [
    join(import.meta.dirname, "../app/globals"),
    join(import.meta.dirname, "../app/composables"),
    join(import.meta.dirname, "../fetch"),
    join(import.meta.dirname, "../async-data/composable"),
  ];
  const builtinComponents = resolveScanDirs_v2(
    resolve(import.meta.dirname, ".."),
    join(import.meta.dirname, "../app/components"),
    { defaultExtensions: ["js", "ts", "mjs", "mts", "cjs", "vue"] },
  );
  const builtinPlugins = resolveScanDirs_v2(
    resolve(import.meta.dirname, ".."),
    join(import.meta.dirname, "../app/plugins"),
    { defaultExtensions: ["js", "ts", "mjs", "mts", "cjs"] },
  );

  const _globals: GlobalConfig & { imports: GlobalOptionsImports[] } = {
    output: main.output,
    imports: [],
  };
  const _components: AutoComponentOptions & { dirs: ComponentDir[] } = {
    dts: join(main.output, "components.d.ts"),
    dirs: [],
  };

  const _css: CssOptions = { cwd: main.cwd, dirs: [] };

  const _layouts: LayoutOptions = { output: main.output, dirs: [] };

  const _pages: Required<PagesOptions> = { output: main.output, dirs: [] };
  const _middlewares: RouterMiddlewaresOptions = {
    output: main.output,
    dirs: [],
  };

  _pages.dirs.push(
    ...resolveScanDirs_v2(
      resolve(import.meta.dirname, ".."),
      join(import.meta.dirname, "../app/pages"),
      { defaultExtensions: ["vue"] },
    ),
  );

  const _plugins: PluginOptions = {
    output: main.output,
    dirs: [],
  };

  let _vites = {} as UserConfig;

  let viteConfig: UserConfig = {
    base: main.baseUrl,
    server: {
      middlewareMode: true,
    },
    appType: "custom",
    ssr: {
      noExternal: process.env.NODE_ENV === "development" ? ["vue-router"] : [],
    },
    root: process.cwd(),
    runableConfig: main,
    publicDir: main.publicDir,

    resolve: { alias: main.alias },
    // devtools: false,

    plugins: [
      vue(),

      configPlugin.vite(),
      runtime.vite({ output: main.output }),
      appVue.vite({
        dir: join(main.appDir, "app.vue"),
        errorDir: join(main.appDir, "error.vue"),
      }),
      importMeta.vite(),
    ],
  };

  const orderedConfigs = [...configs].reverse();

  for (const config of orderedConfigs) {
    _pages.dirs.push(...config.pages);
    _vites = mergeConfig(_vites, config.vite ?? {}) as UserConfig;
  }

  const rebuildAggregates = () => {
    _globals.imports.splice(
      0,
      _globals.imports.length,
      ...builtinGlobalImports,
    );
    _components.dirs.splice(0, _components.dirs.length);
    _css.dirs.splice(0, _css.dirs.length);
    _layouts.dirs.splice(0, _layouts.dirs.length);
    _middlewares.dirs.splice(0, _middlewares.dirs.length);
    _plugins.dirs.splice(0, _plugins.dirs.length);

    for (const config of orderedConfigs) {
      _globals.imports.push(config.globals, config.composables);
      _components.dirs.push(...config.components);
      _css.dirs.push(...config.css);
      _layouts.dirs.push(...config.layouts);
      _middlewares.dirs.push(...config.middlewares);
      _plugins.dirs.push(...config.plugins);
    }

    _components.dirs.push(...builtinComponents);
    _plugins.dirs.push(...builtinPlugins);
  };

  rebuildAggregates();

  viteConfig = mergeConfig(viteConfig, {
    plugins: [
      css.vite(_css),
      globals.vite(_globals),
      components.vite(_components),
      layout.vite(_layouts),
      // router.vite(_pages),

      routeMiddleWare.vite(_middlewares),
      plugin.vite(_plugins),
      watchConfigDirs(configs, rebuildAggregates),
    ],
  }) as UserConfig;

  viteConfig = mergeConfig(viteConfig, _vites) as UserConfig;

  const extendRoutesHooks = orderedConfigs
    .map((config) => config.extendRoutes)
    .filter((hook) => hook !== undefined);

  const extendRoutes = extendRoutesHooks.length
    ? async (routes: EditableRouteTreeNode) => {
        for (const hook of extendRoutesHooks) await hook(routes);
      }
    : undefined;

  viteConfig.plugins?.unshift(buildRoutes(_pages, extendRoutes));

  return viteConfig;
}
