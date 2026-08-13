import { join } from "node:path";
import { defineConfig } from "./src";

export default defineConfig({
  components: "./app/components",

  alias: {
    "@": join(import.meta.dirname, "./src"),
  },
});
