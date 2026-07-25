import type { App } from "vue";
import { type AppContext, setAppContext } from "./context.js";
import { createHooks, installLifecycleBridge } from "./hook.js";

export const appContextPlugin = {
  install(app: App) {
    const hooks = createHooks();
    Object.assign(app._context, hooks);
    setAppContext(app._context as AppContext);

    installLifecycleBridge(app, hooks);
  },
};
