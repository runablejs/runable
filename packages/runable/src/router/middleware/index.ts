import type { NavigationGuard, RouteLocationNormalized } from "vue-router";

import { Arrayable } from "@/utils/types.js";
import { toArray } from "@/utils/to-array";

export type VueRouterMiddleware = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
) => ReturnType<NavigationGuard>;

export function defineVueMiddleware(
  middleware: Arrayable<VueRouterMiddleware>,
): VueRouterMiddleware[] {
  const middlewares = toArray(middleware);
  return middlewares;
}
