import { defineComponent, h } from "vue";
import { RouterView } from "vue-router";
// import { app } from ":app-vue";
// import Layout from "./layout.js";

export default defineComponent({
  name: "SyoraApp",

  setup() {
    return () => {
      return h(RouterView);

      // if (app) return h(app);

      // return h(Layout, null, { default: () => h(RouterView) });
    };
  },
});
