import { join, resolve } from "node:path";

import { mergeConfig, type UserConfig } from "vite";
// import { DevTools as viteDevtools } from "@vitejs/devtools";
import vue from "@vitejs/plugin-vue";
// import vueDevTools from "vite-plugin-vue-devtools";
import { type ResolvedConfig } from "@/config/index.js";

import plugin from "../plugin/unplugin.js";
import appVue from "../app-vue/unplugin.js";
import layout from "../layout/unplugin.js";
import components from "../components/unplugin.js";
import configPlugin from "../config/unplugin.js";
import css from "../css/unplugin.js";
import importMeta from "../import-meta/unplugin.js";
import runtime from "../runtime/unplugin.js";
import router from "../router/unplugin.js";
import globals from "../globals/unplugin.js";

import {
  schemaOrgAutoImports,
  SchemaOrgResolver,
} from "@unhead/schema-org/vue";
import { unheadVueComposablesImports } from "@unhead/vue";
import { useConfig } from "../config";

declare module "vite" {
  interface UserConfig {
    syoraConfig: ResolvedConfig;
  }
}

export function buildViteConfig() {
  const config = useConfig();

  const _config = mergeConfig(config.vite ?? {}, {
    base: config.baseUrl,

    server: {
      middlewareMode: true,
    },

    appType: "custom",

    ssr: {
      noExternal: process.env.NODE_ENV === "production" ? [] : ["vue-router"],
    },

    root: process.cwd(),

    syoraConfig: config,

    publicDir: config.publicDir,

    plugins: [
      // TODO: revoire le devtool
      // config.devtools ? viteDevtools() : [],

      vue(),

      globals.vite({
        output: config.output,
        imports: [
          "vue",

          { file: join(import.meta.dirname, "../plugin/define") },
          { file: join(import.meta.dirname, "../layout/useLayouts") },

          { file: join(import.meta.dirname, "../router/composables") },
          { file: join(import.meta.dirname, "../router/types") },

          { directory: join(import.meta.dirname, "../config/composable") },
          { directory: join(import.meta.dirname, "../context/composables") },
          { directory: join(import.meta.dirname, "../fetch") },
          { directory: join(import.meta.dirname, "../async-data/composable") },
          { directory: join(import.meta.dirname, "../runtime/composable") },

          unheadVueComposablesImports,
          ...schemaOrgAutoImports,
          ...config.globalsDir.map((dir) => ({ directory: dir })),
        ],
      }),

      configPlugin.vite(),

      css.vite({ cssDirs: config.css }),

      components.vite({
        dts: join(config.output, "components.d.ts"),

        resolvers: [SchemaOrgResolver() as any],

        dirs: [
          ...config.components,
          resolve(import.meta.dirname, "../app/components"),
        ],

        componentName(filePath, defaultName) {
          if (defaultName.endsWith(".global")) {
            return defaultName.replace(/\.global$/, "");
          }
        },
      }),

      layout.vite({
        layoutsDirs: [...config.layoutsDirs],
        output: config.output,
      }),

      router.vite({ routeDirs: [...config.pagesDirs], output: config.output }),

      plugin.vite({
        pluginsDirs: [...config.pluginsDirs],
        output: config.output,
      }),

      appVue.vite({ dir: join(config.appDir, "app.vue") }),

      importMeta.vite(),
      runtime.vite({ output: config.output }),
    ],

    resolve: { alias: config.alias },
  }) as UserConfig;

  return _config;
}
