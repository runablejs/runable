import type { App } from "vue";
import { createHooks, installLifecycleBridge } from "./hook.js";

export const appContextPlugin = {
  install(app: App) {
    const hooks = createHooks();
    Object.assign(app, hooks);

    installLifecycleBridge(app, hooks);
  },
};
