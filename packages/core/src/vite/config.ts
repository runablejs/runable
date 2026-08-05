import { join, resolve } from "node:path";

import { mergeConfig, type UserConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { unheadVueComposablesImports } from "@unhead/vue";
import { schemaOrgAutoImports } from "@unhead/schema-org/vue";
import reverse from "lodash/reverse.js";
import cloneDeep from "lodash/cloneDeep.js";

import { useAllConfigs } from "@/config/load.js";
import { resolveScanDirs } from "@/utils/dir/index.js";

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
import { ResolvedConfig } from "@/config/types.js";

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
    imports: [
      join(import.meta.dirname, "../app/globals"),
      join(import.meta.dirname, "../app/composables"),

      join(import.meta.dirname, "../fetch"),
      join(import.meta.dirname, "../async-data/composable"),

      unheadVueComposablesImports,

      ...schemaOrgAutoImports,
    ],
  };
  const _components: AutoComponentOptions & { dirs: ComponentDir[] } = {
    dts: join(main.output, "components.d.ts"),
    dirs: [],
  };

  const _css: CssOptions = { cwd: main.cwd, dirs: [] };

  const _layouts: LayoutOptions = { output: main.output, dirs: [] };

  const _pages: PagesOptions = { output: main.output, dirs: [] };

  const _plugins: PluginOptions = {
    output: main.output,
    dirs: [
      ...resolveScanDirs(
        resolve(import.meta.dirname, ".."),
        [join(import.meta.dirname, "../app/plugins")],
        {
          defaultExtensions: ["js", "ts", "mjs", "mts", "cjs"],
        },
      ),
    ],
  };

  let _vites = {} as UserConfig;

  let viteConfig: UserConfig = {
    base: main.baseUrl,
    server: {
      middlewareMode: true,
    },
    appType: "custom",
    ssr: {
      // noExternal: process.env.NODE_ENV === "production" ? [] : ["vue-router"],
    },
    root: process.cwd(),
    syoraConfig: main,
    publicDir: main.publicDir,

    resolve: { alias: main.alias },
    // devtools: false,

    plugins: [
      vue(),

      configPlugin.vite(),
      runtime.vite({ output: main.output }),
      appVue.vite({ dir: join(main.appDir, "app.vue") }),
      importMeta.vite(),
    ],
  };

  const resolveViteConfig = (config: ResolvedConfig) => {
    _globals.imports.push(config.globals);

    _components.dirs.push(...config.components);
    _css.dirs.push(...config.css);
    _layouts.dirs.push(...config.layouts);
    _pages.dirs.push(...config.pages);
    _plugins.dirs.push(...config.plugins);

    _vites = mergeConfig(_vites, config.vite ?? {}) as UserConfig;
  };

  reverse(cloneDeep(configs)).forEach((config) => {
    resolveViteConfig(withMainOverrides(main, config));
  });

  _components.dirs.push(
    ...resolveScanDirs(
      resolve(import.meta.dirname, ".."),
      [join(import.meta.dirname, "../app/components")],
      { defaultExtensions: ["js", "ts", "mjs", "mts", "cjs", "vue"] },
    ),
  );

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
