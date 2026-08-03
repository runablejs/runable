import { defineConfig } from "@syora/core";
import { join } from "node:path";

export default defineConfig({
  // devtools: { enable: true },

  modules: ["./modules/content"],

  head: {
    title: "Syora/vue playground",

    link: [{ rel: "icon", href: "/favicon.svg" }],
  },

  css: ["./app/css/index.css"],

  alias: {
    "@/*": join(import.meta.dirname, "../packages/core/src/*"),
    "@syora/core": join(import.meta.dirname, "../packages/core/src/index.ts"),
    "@syora/core/*": join(import.meta.dirname, "../packages/core/src/*"),

    "@cli/*": join(import.meta.dirname, "../packages/cli/src/*"),
    "@syora/cli": join(import.meta.dirname, "../packages/cli/src/index.ts"),
    "@syora/cli/*": join(import.meta.dirname, "../packages/cli/src/*"),

    "@content/*": join(import.meta.dirname, "../packages/content/*"),
    "@syora/content/*": join(import.meta.dirname, "../packages/content/*"),
  },

  ssr: true,

  content: {},
});
