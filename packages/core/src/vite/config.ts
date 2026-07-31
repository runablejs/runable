import { join, resolve } from "node:path";

import { mergeConfig, type Plugin, type UserConfig } from "vite";
// import { DevTools as viteDevtools } from "@vitejs/devtools";
import vue from "@vitejs/plugin-vue";
// import vueDevTools from "vite-plugin-vue-devtools";
import { useAllConfigs, type ResolvedConfig } from "@/config/index.js";

import plugin from "../plugin/unplugin.js";
import appVue from "../app-vue/unplugin.js";
import layout from "../layout/unplugin.js";
import components from "../components/unplugin.js";
import configPlugin from "../config/unplugin.js";
import css from "../css/unplugin.js";
import importMeta from "../import-meta/unplugin.js";
import runtime from "../runtime/unplugin.js";
import router from "../router/unplugin.js";
import globals, { type GlobalConfig } from "../globals/unplugin.js";

import {
  schemaOrgAutoImports,
  SchemaOrgResolver,
} from "@unhead/schema-org/vue";
import { unheadVueComposablesImports } from "@unhead/vue";

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

  const configToViteConfig = (config: ResolvedConfig): UserConfig => {
    const isMain = config._name === "__main";

    const plugins: (Plugin<any> | Plugin<any>[])[] = [];

    function getGlbalsImports() {
      const imports: GlobalConfig["imports"] = [
        "vue",
        { file: join(import.meta.dirname, "../plugin/define") },
        { file: join(import.meta.dirname, "../layout/useLayouts") },
        { file: join(import.meta.dirname, "../router/composables") },
        { file: join(import.meta.dirname, "../router/helpers") },
        {
          directory: join(import.meta.dirname, "../config/composable"),
        },
        {
          directory: join(import.meta.dirname, "../context/composables"),
        },
        { directory: join(import.meta.dirname, "../fetch") },
        {
          directory: join(import.meta.dirname, "../async-data/composable"),
        },
        {
          directory: join(import.meta.dirname, "../runtime/composable"),
        },
        unheadVueComposablesImports,
        ...schemaOrgAutoImports,
      ];

      return imports;
    }

    plugins.push(
      globals.vite({
        output: config.output,
        imports: [
          ...(isMain ? getGlbalsImports() : []),
          ...config.globals.map((dir) => ({ directory: dir })),
        ],
      }),
    );

    plugins.push(css.vite({ cssDirs: config.css, cwd: config.cwd }));

    plugins.push(
      components.vite({
        dts: join(config.output, "components.d.ts"),
        resolvers: isMain ? [SchemaOrgResolver() as any] : [],
        dirs: [
          ...config.components,

          ...(isMain
            ? [
                {
                  dirs: resolve(import.meta.dirname, "../app/components"),
                  pathPrefix: false,
                },
              ]
            : []),
        ],

        cwd: config.cwd,
      }),
    );

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
      plugin.vite({ plugins: config.plugins, output: config.output }),
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
    plugins: [vue()],
    resolve: { alias: main.alias },
  });

  return viteCOnfig as UserConfig;
}
