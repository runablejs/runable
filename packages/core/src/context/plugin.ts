import type { App } from "vue";
import { type AppContext, setAppContext } from "./context.js";
import { createHooks, installLifecycleBridge } from "./hook.js";

export const appContextPlugin = {
  install(app: App) {
    const hooks = createHooks();
    Object.assign(app, hooks);
    setAppContext(app);

    installLifecycleBridge(app, hooks);
  },
};
