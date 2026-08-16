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
});

if (import.meta.hot) {
  handleHotUpdate(router);
}

installRouterMiddlewares(router);

export default router;
