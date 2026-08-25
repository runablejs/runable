declare module "vue" {
  interface AppContext extends HookSystem {}
}

import { createContext } from "unctx";
import { ComponentCustomProperties, App as VueApp } from "vue";
import { HookSystem } from "./hook.js";

export type AppContext = VueApp &
  ComponentCustomProperties &
  HookSystem &
  Record<string, unknown>;

// export let globalAppContext: AppContext | null = null;

const appCtx = createContext<AppContext>({ asyncContext: true });
export const useVueApp = appCtx.use;
export const tryUseVueApp = appCtx.tryUse;

export function callWithAppCtx<T>(
  app: VueApp | AppContext,
  callback: () => T | Promise<T>,
) {
  return appCtx.callAsync(app as AppContext, callback);
}

export function setAppCtx(app: VueApp | AppContext) {
  //   globalAppContext = vuaApp as AppContext;
  appCtx.set(app as AppContext);
}
