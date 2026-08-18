import { shallowRef } from "vue";

import type {
  AppError,
  AppErrorSource,
  AppErrorState,
  ShowErrorOptions,
} from "./types.js";

const DEFAULT_CODES: Record<AppErrorSource, string> = {
  vue: "VUE_ERROR",
  router: "ROUTER_ERROR",
  window: "GLOBAL_ERROR",
  "unhandled-rejection": "UNHANDLED_REJECTION",
  manual: "INTERNAL_ERROR",
};

function normalizeError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === "string") return new Error(error);

  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error(String(error));
  }
}

export function createAppErrorState(): AppErrorState {
  const error = shallowRef<AppError | null>(null);

  function showError(
    value: unknown,
    options: ShowErrorOptions = {},
  ): AppError {
    const normalized = normalizeError(value);
    const source = options.source ?? "manual";

    const record: AppError = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      code: options.code ?? DEFAULT_CODES[source],
      statusCode: options.statusCode ?? 500,
      message: normalized.message || "Unknown error",
      stack: normalized.stack ?? "",
      info: options.info ?? "",
      source,
      url: typeof window === "undefined" ? "" : window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator === "undefined" ? "" : navigator.userAgent,
      cause: value,
    };

    error.value = record;
    return record;
  }

  function clearError(): void {
    error.value = null;
  }

  return { error, showError, clearError };
}
