// packages/content/src/index.ts
import { defineModule } from "@/config/module";

interface ModuleOptions {
  dir?: string;
}

export default defineModule<ModuleOptions, "content">({
  meta: {
    default: { dir: "content" },
  },

  modules: [],
});
