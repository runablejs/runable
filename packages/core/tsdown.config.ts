import "dotenv/config";

import path from "node:path";
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    // "./src/**/*.{vue}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "!./src/**/*.test.{js,jsx,ts,tsx}",
    "!./src/**/*.spec.{js,jsx,ts,tsx}",
    "!./src/plugins/vite/vite-env.d.ts",
  ],

  tsconfig: "./tsconfig.build.json",
  format: ["esm"],
  dts: true,
  sourcemap: false,
  clean: true,
  unbundle: true,

  alias: {
    "@/*": path.resolve(import.meta.dirname, "src"),
  },

  plugins: [],

  deps: {
    neverBundle: (id) => {
      if (id.startsWith("@/")) return false;
      if (id.endsWith(".vue")) return true;
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
