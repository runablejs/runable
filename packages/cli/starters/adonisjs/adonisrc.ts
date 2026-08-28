import { defineConfig } from "@adonisjs/core/app";

export default defineConfig({
  commands: [() => import("@adonisjs/core/commands")],
  providers: [
    () => import("@adonisjs/core/providers/app_provider"),
    () => import("@adonisjs/core/providers/http_provider"),
  ],
  preloads: [() => import("#start/routes")],
});
