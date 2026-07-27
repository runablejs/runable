import type {
  AppConfig as VueAppContext,
  App as VueApp,
  ComponentCustomProperties,
} from "vue";
import type { RouteLocationNormalizedLoaded } from "vue-router";

export type SyoraApp = {
  vueApp: VueApp<Element>;

  _id: string;

  _route: RouteLocationNormalizedLoaded;
};

export function createSyoraApp(options: { vueApp: VueApp }) {
  const syoraApp: SyoraApp = {
    vueApp: options.vueApp,
    _id: "syora-app",
  } as unknown as SyoraApp;

  return syoraApp;
}
