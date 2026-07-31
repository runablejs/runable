import { join } from "node:path";
import { defineConfig } from "./src/config";

export default defineConfig({
  appDir: "playground",
  // devtools: { enable: true },

  components: { dirs: "playground/components" },

  head: {
    title: "Syora/vue playground",

    link: [{ rel: "icon", href: "/favicon.svg" }],
  },

  css: ["./playground/css/index.css"],

  alias: { "@": join(import.meta.dirname, "src") },

  publicDir: "playground/public",
});
