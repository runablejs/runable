import type { InlineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import VueRouter from "vue-router/vite";

import { createRuntime } from "@/runtime/runtime.js";
import { resolve } from "node:path";

export function createViteConfig() {
  const runtime = createRuntime();
  const mode = runtime.getEnv("NODE_ENV") ?? "development";

  const config: InlineConfig = {
    server: { middlewareMode: true },
    appType: "custom",

    ssr: {
      noExternal: mode === "development" ? ["vue-router"] : [],
    },

    plugins: [
      VueRouter({ routesFolder: [], extensions: [".vue", ".jsx", ".tsx"] }),
      vue(),
    ],

    resolve: {
      alias: {
        "@": resolve(import.meta.dirname, ".."),
      },
    },
  };

  return config;
}
