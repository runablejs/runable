import type { App as VueApp, ComponentCustomProperties } from "vue";
import type { HookSystem } from "./hook.js";

declare module "vue" {
  interface AppContext extends HookSystem {}
}

export type AppContext = VueApp &
  ComponentCustomProperties &
  HookSystem &
  Record<string, unknown>;

export let globalAppContext: AppContext | null = null;

export function setAppContext(vuaApp: VueApp): void {
  globalAppContext = vuaApp as AppContext;
}
