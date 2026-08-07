import { defineModule } from "@syora/core";
import { SyoraUIConfig } from "./app/types/config";
import generateTokens from "./app/generaors";
import tailwindcss from "@tailwindcss/vite";

export default defineModule<SyoraUIConfig>({
  components: {
    dirs: "app/components",
    pathPrefix: false,
    extensions: ["vue"],
    prefix: "u",
  },

  css: "./app/css/main.css",

  configKey: "ui",

  vite: {
    plugins: [tailwindcss()],
  },

  async setup(options, config) {
    console.log("+++++++++++++++");
    generateTokens({ output: config.output });
  },
});
