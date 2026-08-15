import { join } from "node:path";

import tailwindcss from "@tailwindcss/vite";

import { defineConfig } from "../packages/core/src/index.js";

export default defineConfig({
  head: {
    title: "Syora",

    link: [{ rel: "icon", href: "/favicon.svg" }],
  },

  components: [
    { dirs: "./app/components/ui", prefix: "U", pathPrefix: false },
    { dirs: "./app/components/globals", prefix: "U", pathPrefix: false },
  ],

  css: ["./app/assets/css/main.css"],

  alias: {
    "@": join(import.meta.dirname, "../packages/core/src"),
    "~": join(import.meta.dirname, "./app"),
  },

  ssr: true,

  vite: {
    plugins: [tailwindcss()],
  },
});
