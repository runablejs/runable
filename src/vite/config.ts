import type { InlineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

import { createRuntime } from "@/runtime/runtime.js";
import { buildRoutes } from "@/engine/pages/build-routes.js";
import { useAllConfigs } from "@/config/load.js";
import type { RouterOptionsRawResolved } from "@/engine/pages/types.js";

import * as engine from "@/engine/index.js";

export function createViteConfig() {
  const runtime = createRuntime();
  const mode = runtime.getEnv("NODE_ENV") ?? "development";

  const configs = useAllConfigs();
  const main = configs[0]!;

  const pages = configs.map((config) => config.pages).flat();
  const globals: RouterOptionsRawResolved[] = [];
  const css: RouterOptionsRawResolved[] = [];
  const components: RouterOptionsRawResolved[] = [];
  const layouts: RouterOptionsRawResolved[] = [];
  const middlewares: RouterOptionsRawResolved[] = [];
  const plugins: RouterOptionsRawResolved[] = [];

  configs
    .slice()
    .reverse()
    .forEach((config) => {
      globals.push(...config.globals);
      globals.push(...config.composables);
      css.push(...config.css);
      components.push(...config.components);
      layouts.push(...config.layouts);
      middlewares.push(...config.middlewares);
      plugins.push(...config.plugins);
    });

  const config: InlineConfig = {
    server: { middlewareMode: true },
    appType: "custom",

    ssr: {
      noExternal: mode === "development" ? ["vue-router"] : [],
    },

    plugins: [
      buildRoutes(main.output, pages),
      vue(),
      engine.componentPlugin({ dirs: components, output: main.output }),
    ],

    resolve: {
      alias: main.alias,
    },
  };

  return config;
}
