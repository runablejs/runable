import { defineConfig } from "@syora/core";
import { join } from "node:path";

export default defineConfig({
  // devtools: { enable: true },

  modules: ["@syora/content"],

  head: {
    title: "Syora/vue playground",

    link: [{ rel: "icon", href: "/favicon.svg" }],
  },

  css: ["./app/css/index.css"],

  alias: {},

  ssr: true,

  content: {},
});
