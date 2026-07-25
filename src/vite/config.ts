import { join, resolve } from "node:path";

import { type UserConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import AutoImport from "unplugin-auto-import/vite";

import router from "../router/unplugin.js";
import plugin from "../plugin/unplugin.js";
import appVue from "../app-vue/unplugin.js";
import layout from "../layout/unplugin.js";
import Components from "../components/vite.js";
import pconfig from "../config/unplugin.js";
import css from "../css/unplugin.js";
import importMeta from "../import-meta/unplugin.js";
import runtime from "../runtime/unplugin.js";

import {
  schemaOrgAutoImports,
  SchemaOrgResolver,
} from "@unhead/schema-org/vue";
import { unheadVueComposablesImports, type ResolvableHead } from "@unhead/vue";
import type { Config } from "../config";

declare module "vite" {
  interface UserConfig {
    _config: Config;
  }
}

export function buildViteConfig(config: Required<Config>) {
  const _config: UserConfig = {
    base: config.baseUrl,
    server: { middlewareMode: true },
    appType: "custom",
    ssr: {
      noExternal: process.env.NODE_ENV === "production" ? [] : ["vue-router"],
    },

    root: process.cwd(),

    _config: config,

    plugins: [
      vue(),
      config.devtools?.enable ? vueDevTools({}) : [],

      pconfig.vite(),
      css.vite({ cssDirs: config.css }),

      AutoImport({
        dtsMode: "overwrite",

        dirs: [
          ...config.globalsDir.map((dir) => ({
            glob: join(dir, "**"),
            type: true,
          })),

          join(import.meta.dirname, "../config/composable"),
          join(import.meta.dirname, "../vue/composable"),
          join(import.meta.dirname, "../fetch"),
          join(import.meta.dirname, "../async-data/composable"),
          join(import.meta.dirname, "../runtime/composable"),
          join(import.meta.dirname, "../plugin/globals"),
          {
            glob: join(import.meta.dirname, "../router/types.ts"),
            types: true,
          },
        ],

        imports: [
          "vue",
          "vue-router",
          unheadVueComposablesImports,
          ...schemaOrgAutoImports,
        ],
        dts: join(config.output, "imports.d.ts"),
      }),

      Components({
        dts: join(config.output, "components.d.ts"),

        resolvers: [SchemaOrgResolver() as any],

        dirs: [
          ...config.componentsDirs,
          resolve(import.meta.dirname, "../app-vue/layout.vue"),
        ],

        componentName(filePath, defaultName) {
          if (defaultName.endsWith(".global")) {
            return defaultName.replace(/\.global$/, "");
          }

          if (resolve(import.meta.dirname, "../app-vue/layout.vue")) {
            return "Layout";
          }
        },
      }),

      router.vite({ routeDirs: [...config.pagesDirs], output: config.output }),

      layout.vite({
        layoutsDirs: [...config.layoutsDirs],
        output: config.output,
      }),

      plugin.vite({
        pluginsDirs: [...config.pluginsDirs],
        output: config.output,
      }),

      appVue.vite({ dir: join(config.appDir, "app.vue") }),

      importMeta.vite(),
      runtime.vite({ output: config.output }),
    ],

    resolve: { alias: config.alias },
  };

  return _config;
}
