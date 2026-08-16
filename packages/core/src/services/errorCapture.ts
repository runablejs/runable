import { useApp } from "@/app/composables/context";
import { shallowRef } from "vue";

export interface ErrorRecord {
  id: string;
  code: string;
  message: string;
  stack: string;
  info: string;
  url: string;
  timestamp: string;
  userAgent: string;
}

export const currentError = shallowRef<ErrorRecord | null>(null);

export function setError(
  error: unknown,
  info = "",
  code = "INTERNAL_ERROR",
): ErrorRecord {
  const normalizedError =
    error instanceof Error ? error : new Error(String(error));

  const errorRecord: ErrorRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    code,
    message: normalizedError.message || "Erreur inconnue",
    stack: normalizedError.stack || "",
    info,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  };

  currentError.value = errorRecord;

  return errorRecord;
}

export function getError(): ErrorRecord | null {
  return currentError.value;
}

export function clearError(): void {
  currentError.value = null;
}

export function setupGlobalErrorHandlers(): void {
  const app = useApp();

  const redirectToErrorPage = (): void => {
    if (app.$router.currentRoute.value.name !== "ErrorPage") {
      void app.$router.push({
        name: "ErrorPage",
      });
    }
  };

  // Vue component errors
  app.config.errorHandler = (error, _instance, info): void => {
    console.error("[Vue Error]", error, info);

    setError(error, info, "VUE_ERROR");
    redirectToErrorPage();
  };

  if (typeof window !== "undefined") {
    // Global JavaScript errors
    window.onerror = (message, source, lineno, colno, error): boolean => {
      console.error("[Global Error]", message, error);

      setError(
        error ?? new Error(String(message)),
        `global: ${source ?? "unknown"}:${lineno ?? 0}:${colno ?? 0}`,
        "GLOBAL_ERROR",
      );

      redirectToErrorPage();

      return true;
    };

    // Unhandled promise rejections
    window.addEventListener(
      "unhandledrejection",
      (event: PromiseRejectionEvent): void => {
        console.error("[Unhandled Rejection]", event.reason);

        setError(
          event.reason instanceof Error
            ? event.reason
            : new Error(String(event.reason)),
          "unhandledrejection",
          "UNHANDLED_REJECTION",
        );

        redirectToErrorPage();
      },
    );
  }
}
