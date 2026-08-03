import { join } from "node:path";
import { defineConfig } from "./src";

export default defineConfig({
  css: ["./app/css/index.css"],

  alias: {
    "@": join(import.meta.dirname, "./src"),
  },
});
