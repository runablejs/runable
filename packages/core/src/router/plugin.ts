import type { Plugin } from "vue";
import { routes } from ":router";
import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
} from "vue-router";

export const routerPlugin: Plugin = {
  install(app) {
    const router = createRouter({
      history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
      routes,
    });

    app.use(router);
  },
};
