declare module "vue" {
  //   interface AppContext extends HookSystem {}
}

import { createContext } from "unctx";
import type { ComponentCustomProperties, App as VueApp } from "vue";
// import { HookSystem } from "./hook.js";

export type AppContext = VueApp &
  ComponentCustomProperties &
  //   HookSystem &
  Record<string, unknown>;

const appContext = createContext<AppContext>({ asyncContext: true });
export const useVueApp = appContext.use;
export const tryUseVueApp = appContext.tryUse;

export function callWithAppCtx<T>(
  app: AppContext,
  callback: () => T | Promise<T>,
): Promise<T> {
  return appContext.callAsync(app, callback);
}
