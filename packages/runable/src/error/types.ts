import type { ShallowRef } from "vue";

export type AppErrorSource =
  | "vue"
  | "router"
  | "window"
  | "unhandled-rejection"
  | "manual";

export interface AppError {
  id: string;
  code: string;
  statusCode: number;
  message: string;
  stack: string;
  info: string;
  source: AppErrorSource;
  url: string;
  timestamp: string;
  userAgent: string;
  cause: unknown;
}

export interface ShowErrorOptions {
  code?: string;
  statusCode?: number;
  info?: string;
  source?: AppErrorSource;
}

export interface AppErrorState {
  error: ShallowRef<AppError | null>;
  showError(error: unknown, options?: ShowErrorOptions): AppError;
  clearError(): void;
}
