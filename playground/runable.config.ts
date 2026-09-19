import { defineConfig } from "runable";

export default defineConfig({
  modules: ["./modules/test"],

  head: {
    title: "Runable/vue playground",

    link: [{ rel: "icon", href: "/favicon.svg" }],
  },

  css: ["./app/css/index.css"],

  alias: {},

  ssr: true,

  test01: {},
});
