import type { InjectionKey } from "vue";

import type { AppErrorState } from "./types.js";

export const APP_ERROR_STATE_KEY: InjectionKey<AppErrorState> = Symbol(
  "runable-app-error-state",
);
