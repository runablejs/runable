import { getCurrentInstance } from "vue";
import { type AppContext, globalAppContext } from "../context.js";
import merge from "lodash/merge.js";

export function useApp(): AppContext {
  const instance = getCurrentInstance();
  const ctx = instance?.appContext ?? globalAppContext;

  if (!ctx) {
    throw new Error(
      "useApp() must be called within a component’s setup() method, or after the app context plugin has been installed.",
    );
  }

  return merge(ctx, ctx.config.globalProperties);
}
