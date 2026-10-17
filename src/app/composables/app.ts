import { tryUseVueApp, useVueApp, type AppContext } from "@/engine/context.js";

function wrapApp(app: AppContext) {
  return new Proxy(app, {
    get(target, key, receiver) {
      const globalProps = target.config.globalProperties as Record<
        PropertyKey,
        unknown
      >;

      if (key in globalProps) {
        const value = globalProps[key];
        return typeof value === "function" ? value.bind(globalProps) : value;
      }

      const value = Reflect.get(target, key, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
    has(target, key) {
      return key in target.config.globalProperties || key in target;
    },
  });
}

export function tryUseApp() {
  const app = tryUseVueApp();

  if (app) return wrapApp(app);
  return app;
}

export function useApp() {
  const app = useVueApp();
  return wrapApp(app);
}
