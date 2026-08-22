import type {
  AppConfig as VueAppContext,
  App as VueApp,
  ComponentCustomProperties,
} from "vue";
import type { RouteLocationNormalizedLoaded } from "vue-router";

export type RunableApp = {
  vueApp: VueApp<Element>;

  _id: string;

  _route: RouteLocationNormalizedLoaded;
};

export function createRunableContext(options: { vueApp: VueApp }) {
  const runableApp: RunableApp = {
    vueApp: options.vueApp,
    _id: "runable-app",
  } as unknown as RunableApp;

  return runableApp;
}
