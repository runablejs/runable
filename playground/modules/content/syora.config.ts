// packages/content/src/index.ts
import { defineModule } from "@syora/core";

export interface ContentModuleOptions {
  dir?: string;
  //   collections: Record<string, any>;
}

export default defineModule<ContentModuleOptions>({
  meta: {
    configKey: "content",
    default: { dir: "content" },
  },
});

declare module "@syora/core" {
  interface ModuleTypeRegistry {
    "@syora/content": {
      configKey: "content";
      options: ContentModuleOptions;
    };
  }
}
