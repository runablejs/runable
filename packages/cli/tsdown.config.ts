import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    // "./src/**/*.{vue}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "!./src/**/*.test.{js,jsx,ts,tsx}",
    "!./src/**/*.spec.{js,jsx,ts,tsx}",
  ],

  tsconfig: "./tsconfig.build.json",
  format: ["esm"],
  dts: true,
  sourcemap: false,
  clean: true,
  unbundle: true,

  deps: {
    neverBundle: (id) => {
      return /^[^./]/.test(id);
    },
  },

  outExtensions: (ctx) => {
    return {
      js: ctx.format === "cjs" ? ".cjs" : ".js",
    };
  },
});
