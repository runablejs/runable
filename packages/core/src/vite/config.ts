import { join, resolve } from "node:path";

import { mergeConfig, type Plugin, type UserConfig } from "vite";
// import { DevTools as viteDevtools } from "@vitejs/devtools";
import vue from "@vitejs/plugin-vue";
// import vueDevTools from "vite-plugin-vue-devtools";
import { useAllConfigs, type ResolvedConfig } from "@/config/load.js";

import plugin from "../plugin/unplugin.js";
import appVue from "../app-vue/unplugin.js";
import layout from "../layout/unplugin.js";
import components, {
  type AutoComponentOptions,
  type ComponentDir,
} from "../components/unplugin.js";
import configPlugin from "../config/unplugin.js";
import css from "../css/unplugin.js";
import importMeta from "../import-meta/unplugin.js";
import runtime from "../runtime/unplugin.js";
import router from "../router/unplugin.js";
import globals, {
  type GlobalConfig,
  type GlobalOptionsImports,
} from "../globals/unplugin.js";

import {
  schemaOrgAutoImports,
  SchemaOrgResolver,
} from "@unhead/schema-org/vue";
import { unheadVueComposablesImports } from "@unhead/vue";
import { resolveDir } from "@/utils/dir.js";

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

  const configToViteConfig = (config: ResolvedConfig): UserConfig => {
    const isMain = config._name === "__main";
    const plugins: (Plugin<any> | Plugin<any>[])[] = [];

    function getGlbalsImports() {
      const imports: GlobalConfig["imports"] = [
        // "vue",
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
      ];

      return imports;
    }

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

    plugins.push(css.vite({ cssDirs: config.css, cwd: config.cwd }));

    // plugins.push(
    //   globals.vite({
    //     output: config.output,
    //     imports: [
    //       ...(isMain ? getGlbalsImports() : []),
    //       ...config.globals.map((dir) => ({ directory: dir })),
    //     ],
    //   }),
    // );

    plugins.push(
      layout.vite({ layouts: config.layouts, output: config.output }),
    );

    plugins.push(
      router.vite({
        pages: config.pages,
        output: config.output,
        appDir: config.appDir,
      }),
    );

    plugins.push(
      plugin.vite({
        plugins: [
          ...(isMain ? [join(import.meta.dirname, "../app/plugins")] : []),
          ...config.plugins,
        ],
        output: config.output,
      }),
    );

    if (isMain) {
      plugins.push(
        configPlugin.vite(),

        runtime.vite({ output: config.output }),

        appVue.vite({ dir: join(main.appDir, "app.vue") }),

        importMeta.vite(),
      );
    }

    return mergeConfig(config.vite ?? {}, { plugins }) as UserConfig;
  };

  let viteCOnfig = {};

  configs.forEach((config) => {
    const _config = configToViteConfig(withMainOverrides(main, config));
    viteCOnfig = mergeConfig(viteCOnfig, _config) as UserConfig;
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

  viteCOnfig = mergeConfig(viteCOnfig, {
    base: main.baseUrl,
    server: { middlewareMode: true },
    appType: "custom",
    ssr: {
      noExternal: process.env.NODE_ENV === "production" ? [] : ["vue-router"],
    },
    root: process.cwd(),
    syoraConfig: main,
    publicDir: main.publicDir,
    plugins: [vue(), globals.vite(_globals), components.vite(_components)],
    resolve: { alias: main.alias },
    devtools: false,
  });

  return viteCOnfig as UserConfig;
}
