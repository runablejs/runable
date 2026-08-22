import { defineComponent, h, Suspense } from "vue";
import { app, error as errorPage } from ":app-vue";
import Layout from "./layout.js";
import Page from "./page.js";
import ErrorDisplay from "./error.js";
import { useAppError } from "../composables/useAppError.js";

export default defineComponent({
  name: "RunableApp",

  setup() {
    const { error, clearError } = useAppError();

    return () => {
      return h(Suspense, null, {
        default: () => {
          if (error.value) {
            return h(errorPage || ErrorDisplay, {
              error: error.value,
              onClear: clearError,
            });
          }

          return app ? h(app) : h(Layout, null, { default: () => h(Page) });
        },
        fallback: () => null,
      });
    };
  },
});
