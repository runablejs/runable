import type { Component, InjectionKey } from "vue";

export const LAYOUTS_CONTEXT_KEY: InjectionKey<
  Record<string, () => Promise<Component>>
> = Symbol("LAYOUTS_CONTEXT");
