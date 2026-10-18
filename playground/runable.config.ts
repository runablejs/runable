import { defineConfig } from "@/index.js";
import { resolve } from "node:path";

export default defineConfig({
  modules: [],

  head: {
    title: "Runable playground",

    link: [{ rel: "icon", href: "/favicon.svg" }],
  },

  css: ["./app/css/index.css"],

  alias: {
    "@": resolve(import.meta.dirname, "../src"),
  },

  ssr: true,
});
