import { defineModule } from "@syora/core";
import { ContentConfig, initContent } from "./core";

export default defineModule<ContentConfig>({
  components: { dirs: "app/components", pathPrefix: false },

  configKey: "content",

  vite: {
    server: {
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
      },
    },

    preview: {
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
      },
    },

    worker: { format: "es" },

    optimizeDeps: {
      exclude: ["@sqlite.org/sqlite-wasm"],
    },
  },

  async setup(options) {
    await initContent(options);
  },
});
