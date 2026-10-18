import type { InlineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

import { createRuntime } from "@/runtime/runtime.js";
import { buildRoutes } from "@/engine/pages/build-routes.js";
import { useAllConfigs } from "@/config/load.js";

export function createViteConfig() {
  const runtime = createRuntime();
  const mode = runtime.getEnv("NODE_ENV") ?? "development";

  const configs = useAllConfigs();
  const main = configs[0]!;

  const config: InlineConfig = {
    server: { middlewareMode: true },
    appType: "custom",

    ssr: {
      noExternal: mode === "development" ? ["vue-router"] : [],
    },

    plugins: [buildRoutes(main.output, []), vue()],

    resolve: {
      alias: main.alias,
    },
  };

  return config;
}
