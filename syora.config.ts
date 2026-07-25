import { join } from "node:path";
import { defineConfig } from "./src/config";

export default defineConfig({
  appDir: "playground",
  devtools: { enable: true },

  head: {
    title: "Syora/vue playground",
  },

  css: ["./playground/css/index.css"],

  alias: { "@": join(import.meta.dirname, "src") },
});
