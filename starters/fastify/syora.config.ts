import { defineConfig } from "@syora/core";
import { join } from "node:path";

export default defineConfig({
  devtools: { enable: true },
  css: ["./app/css/main.css"],
  alias: { "@": join(import.meta.dirname, "src") },
});
