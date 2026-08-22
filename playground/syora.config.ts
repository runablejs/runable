import { defineConfig } from "runable";
import { join } from "node:path";

export default defineConfig({
  // devtools: { enable: true },

  modules: ["@runable/content"],

  head: {
    title: "Runable/vue playground",

    link: [{ rel: "icon", href: "/favicon.svg" }],
  },

  css: ["./app/css/index.css"],

  alias: {},

  ssr: true,

  content: {},
});
