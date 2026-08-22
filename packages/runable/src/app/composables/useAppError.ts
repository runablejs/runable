import { inject } from "vue";

import { APP_ERROR_STATE_KEY } from "../../error/symbols.js";

export function useAppError() {
  const state = inject(APP_ERROR_STATE_KEY);

  if (!state) {
    throw new Error(
      "useAppError() must be called after Runable's error capture plugin has been installed.",
    );
  }

  return state;
}
