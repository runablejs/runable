import { defineComponent, h } from "vue";
import { app, error as errorPage } from ":app-vue";
import Layout from "./layout.js";
import Page from "./page.js";
import ErrorDisplay from "./error.js";
import { useAppError } from "../composables/useAppError.js";

export default defineComponent({
  name: "SyoraApp",

  setup() {
    const { error, clearError } = useAppError();

    return () => {
      if (error.value) {
        return h(errorPage || ErrorDisplay, {
          error: error.value,
          onClear: clearError,
        });
      }

      if (app) return h(app);
      return h(Layout, null, { default: () => h(Page) });
    };
  },
});
