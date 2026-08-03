import { join, resolve } from "node:path";

import { mergeConfig, type UserConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { unheadVueComposablesImports } from "@unhead/vue";
import { schemaOrgAutoImports } from "@unhead/schema-org/vue";

import { useAllConfigs, type ResolvedConfig } from "@/config/load.js";
import { resolveDir } from "@/utils/dir.js";

import plugin, { type PluginOptions } from "../plugin/unplugin.js";
import appVue from "../app-vue/unplugin.js";
import layout, { type LayoutOptions } from "../layout/unplugin.js";
import components, {
  type AutoComponentOptions,
  type ComponentDir,
} from "../components/unplugin.js";
import configPlugin from "../config/unplugin.js";
import css, { type CssOptions } from "../css/unplugin.js";
import importMeta from "../import-meta/unplugin.js";
import runtime from "../runtime/unplugin.js";
import router, { type PagesOptions } from "../router/unplugin.js";
import globals, {
  type GlobalConfig,
  type GlobalOptionsImports,
} from "../globals/unplugin.js";

declare module "vite" {
  interface UserConfig {
    syoraConfig: ResolvedConfig;
  }
}

const MAIN_OVERRIDE_FIELDS = [
  "output",
] as const satisfies readonly (keyof ResolvedConfig)[];

function withMainOverrides(
  main: ResolvedConfig,
  config: ResolvedConfig,
): ResolvedConfig {
  const overrides = {} as Pick<
    ResolvedConfig,
    (typeof MAIN_OVERRIDE_FIELDS)[number]
  >;

  for (const key of MAIN_OVERRIDE_FIELDS) overrides[key] = main[key];

  return { ...config, ...overrides };
}

export function buildViteConfig(): UserConfig {
  const configs = useAllConfigs();
  const main = configs[0]!;

  const _globals: GlobalConfig & { imports: GlobalOptionsImports[] } = {
    output: main.output,
    imports: [],
  };
  const _components: AutoComponentOptions & { dirs: ComponentDir[] } = {
    dts: join(main.output, "components.d.ts"),
    dirs: [],
  };

  const _css: CssOptions & { dirs: string[] } = { cwd: main.cwd, dirs: [] };

  const _layouts: LayoutOptions & { dirs: string[] } = {
    output: main.output,
    dirs: [],
  };

  const _pages: PagesOptions & { dirs: PagesOptions["dirs"][] } = {
    output: main.output,
    dirs: [],
  };

  const _plugins: PluginOptions & { dirs: string[] } = {
    output: main.output,
    dirs: [],
  };

  let _vites = {} as UserConfig;

  let viteConfig: UserConfig = {
    base: main.baseUrl,
    server: { middlewareMode: true },
    appType: "custom",
    ssr: {
      noExternal: process.env.NODE_ENV === "production" ? [] : ["vue-router"],
    },
    root: process.cwd(),
    syoraConfig: main,
    publicDir: main.publicDir,

    resolve: { alias: main.alias },
    devtools: false,

    plugins: [
      vue(),

      configPlugin.vite(),
      runtime.vite({ output: main.output }),
      appVue.vite({ dir: join(main.appDir, "app.vue") }),
      importMeta.vite(),
    ],
  };

  const resolveViteConfig = (config: ResolvedConfig) => {
    resolveGlobals();
    function resolveGlobals() {
      _globals.imports.push(
        ...config.globals.map((dir) => ({ directory: dir })),
      );
    }

    resolveComponents();
    function resolveComponents() {
      config.components = Array.isArray(config.components)
        ? config.components
        : [config.components];

      config.components = config.components.map((component) => {
        if (typeof component === "string") {
          component = resolveDir(component, config.cwd);
        } else {
          component.dirs = Array.isArray(component.dirs)
            ? component.dirs
            : [component.dirs];

          for (let i = 0; i < component.dirs.length; i++) {
            const _dir = component.dirs[i];
            if (!_dir) continue;

            component.dirs[i] = resolveDir(_dir, config.cwd);
          }
        }

        return component;
      });

      _components.dirs.push(...config.components);
    }

    resolveCss();
    function resolveCss() {
      _css.dirs.push(...config.css.map((css) => resolveDir(css, config.cwd)));
    }

    resolveLayouts();
    function resolveLayouts() {
      _layouts.dirs.push(
        ...config.layouts.map((layout) => resolveDir(layout, config.cwd)),
      );
    }

    _pages.dirs.push({ appDir: config.appDir, pages: config.pages });

    _plugins.dirs.push(...config.plugins);

    _vites = mergeConfig(_vites, config.vite ?? {}) as UserConfig;
  };

  configs.forEach((config) => {
    resolveViteConfig(withMainOverrides(main, config));
  });

  _globals.imports.unshift(
    { directory: join(import.meta.dirname, "../app/globals") },
    { file: join(import.meta.dirname, "../plugin/define") },
    { file: join(import.meta.dirname, "../layout/useLayouts") },
    { file: join(import.meta.dirname, "../router/composables") },
    { file: join(import.meta.dirname, "../router/helpers") },
    { file: join(import.meta.dirname, "../config/composables") },
    { file: join(import.meta.dirname, "../context/composables") },
    { directory: join(import.meta.dirname, "../fetch") },
    { file: join(import.meta.dirname, "../async-data/composable") },
    { file: join(import.meta.dirname, "../runtime/composables") },

    unheadVueComposablesImports,

    ...schemaOrgAutoImports,
  );

  _components.dirs.push({
    dirs: resolve(import.meta.dirname, "../app/components"),
    pathPrefix: false,
    extensions: ["ts", "js", "jsx", "tsx", "vue"],
  });

  _plugins.dirs.unshift(join(import.meta.dirname, "../app/plugins"));

  viteConfig = mergeConfig(viteConfig, {
    plugins: [
      globals.vite(_globals),
      components.vite(_components),
      css.vite(_css),
      layout.vite(_layouts),
      router.vite(_pages),
      plugin.vite(_plugins),
    ],
  }) as UserConfig;

  viteConfig = mergeConfig(viteConfig, _vites) as UserConfig;

  return viteConfig;
}
