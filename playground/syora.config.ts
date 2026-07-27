import { defineConfig } from "@syora/core";
import { join } from "node:path";

export default defineConfig({
  devtools: { enable: true },

  head: {
    title: "Syora/vue playground",

    link: [{ rel: "icon", href: "/favicon.svg" }],
  },

  css: ["./app/css/index.css"],

  alias: { "@": join(import.meta.dirname, "src") },

  ssr: true,
});
