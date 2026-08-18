import { inject, type App, type ComponentPublicInstance, type Plugin } from "vue";
import type { Router } from "vue-router";

import { createAppErrorState } from "./state.js";
import { APP_ERROR_STATE_KEY } from "./symbols.js";
import type { AppErrorState } from "./types.js";

function logError(label: string, error: unknown, info?: string): void {
  console.error(`[Syora] ${label}`, error, info ?? "");
}

/** Installs an error state isolated to one Vue application instance. */
export function createErrorCapture(): Plugin {
  return {
    install(app: App) {
      const state = createAppErrorState();
      app.provide(APP_ERROR_STATE_KEY, state);

      const previousErrorHandler = app.config.errorHandler;

      app.config.errorHandler = (
        error: unknown,
        instance: ComponentPublicInstance | null,
        info: string,
      ) => {
        logError("Vue error", error, info);
        state.showError(error, { source: "vue", info });
        previousErrorHandler?.(error, instance, info);
      };

      if (typeof window === "undefined") return;

      const router = app.config.globalProperties.$router as Router | undefined;
      const removeRouterHandler = router?.onError((error, to, from) => {
        const info = `navigation: ${String(from.fullPath)} -> ${String(to.fullPath)}`;
        logError("Router error", error, info);
        state.showError(error, { source: "router", info });
      });

      const onWindowError = (event: ErrorEvent) => {
        const info = `global: ${event.filename || "unknown"}:${event.lineno}:${event.colno}`;
        const error = event.error ?? new Error(event.message);
        logError("Global error", error, info);
        state.showError(error, { source: "window", info });
      };

      const onUnhandledRejection = (event: PromiseRejectionEvent) => {
        logError("Unhandled rejection", event.reason);
        state.showError(event.reason, {
          source: "unhandled-rejection",
          info: "unhandledrejection",
        });
      };

      window.addEventListener("error", onWindowError);
      window.addEventListener("unhandledrejection", onUnhandledRejection);

      const unmount = app.unmount.bind(app);
      app.unmount = () => {
        window.removeEventListener("error", onWindowError);
        window.removeEventListener(
          "unhandledrejection",
          onUnhandledRejection,
        );
        removeRouterHandler?.();
        unmount();
      };
    },
  };
}

/** Reads the error state attached to an application outside component setup. */
export function getAppErrorState(app: App): AppErrorState | undefined {
  return app.runWithContext(() => inject(APP_ERROR_STATE_KEY));
}
