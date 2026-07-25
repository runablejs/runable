import "dotenv/config";

import path from "node:path";
import { defineConfig } from "tsdown";
// import Vue from "unplugin-vue/rolldown";

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

  plugins: [
    // Vue({ isProduction: true }),

    {
      name: "copy-vue-files",
      async buildEnd() {
        const fs = await import("node:fs/promises");
        const path = await import("node:path");
        const { glob } = await import("tinyglobby"); // ou n'importe quel globber comme fast-glob

        const vueFiles = await glob("./src/**/*.vue");

        for (const file of vueFiles) {
          // On calcule le chemin de sortie par rapport à ton dossier de destination (ex: dist)
          const relativePath = path.relative("./src", file);
          const destPath = path.join("./dist", relativePath);

          await fs.mkdir(path.dirname(destPath), { recursive: true });
          await fs.copyFile(file, destPath);
        }
      },
    },
  ],

  // deps: {
  //   neverBundle: [/^[^./]/, /^\/?#(server|app)/, /\.vue$/],
  // },

  deps: {
    neverBundle: (id) => {
      if (id.startsWith("@/")) return false;
      if (id.endsWith(".vue")) return true;

      return /^[^./]/.test(id);
    },
  },

  outExtensions: (ctx) => {
    return {
      js: ctx.format === "cjs" ? ".cjs" : ".js",
    };
  },
});
