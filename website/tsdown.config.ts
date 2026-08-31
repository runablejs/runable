import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["start.ts"],
  outDir: ".output/runtime",
  format: ["esm"],
  clean: true,
  dts: false,
  sourcemap: false,
  deps: {
    neverBundle: (id) => /^[^./]/.test(id),
  },
});
