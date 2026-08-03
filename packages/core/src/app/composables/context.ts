import { getCurrentInstance } from "vue";
import { type AppContext, globalAppContext } from "../../context/context.js";
import merge from "lodash/merge.js";

export function useApp(): AppContext {
  const instance = getCurrentInstance();

  const app = instance?.appContext.app ?? globalAppContext;

  if (!app) {
    throw new Error(
      "useApp() must be called within a component’s setup() method, or after the app context plugin has been installed.",
    );
  }

  return merge(app, app.config.globalProperties) as AppContext;
}
