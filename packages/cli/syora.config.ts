import { defineModule } from "@syora/core";

interface ModuleOptions {
}

export default defineModule<ModuleOptions>({
  configKey: "my-module",

  async setup(options, config) {
  },
});
