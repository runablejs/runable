import { routes, handleHotUpdate } from "vue-router/auto-routes";
import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
} from "vue-router";

import { installRouterMiddlewares } from "./middleware/eval";
// import { routes } from ":router";

const router = createRouter({
  history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;

    if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth",
      };
    }

    return { left: 0, top: 0 };
  },
});

if (import.meta.hot) {
  handleHotUpdate(router);
}

installRouterMiddlewares(router);

export default router;
