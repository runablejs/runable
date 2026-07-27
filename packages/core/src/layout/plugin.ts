import type { App } from "vue";
import { LAYOUTS_CONTEXT_KEY } from "./symbols";
import { layouts } from ":layouts";

export const layoutPlugin = {
  install(app: App) {
    app.provide(LAYOUTS_CONTEXT_KEY, layouts);
  },
};
