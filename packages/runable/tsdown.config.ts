import "dotenv/config";

import path from "node:path";
import { defineConfig } from "tsdown";
import Vue from "unplugin-vue/rolldown";

export default defineConfig({
  entry: [
    "./src/**/*.{js,jsx,ts,tsx,vue}",
    "!./src/**/*.test.{js,jsx,ts,tsx}",
    "!./src/**/*.spec.{js,jsx,ts,tsx}",
    "!./src/plugins/vite/vite-env.d.ts",
  ],

  tsconfig: "./tsconfig.build.json",
  format: ["esm"],
  sourcemap: false,
  clean: true,
  unbundle: true,

  css: {
    inject: true,
  },

  dts: { vue: true },

  alias: {
    "@/*": path.resolve(import.meta.dirname, "src"),
  },

  plugins: [Vue({ isProduction: true })],

  deps: {
    neverBundle: (id) => {
      if (id.startsWith("@/")) return false;
      if (id.startsWith(":")) return true;

      return /^[^./]/.test(id);
    },
  },

  outExtensions: (ctx) => {
    return {
      js: ctx.format === "cjs" ? ".cjs" : ".js",
    };
  },
});
