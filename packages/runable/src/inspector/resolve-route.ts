import { createMemoryHistory, createRouter, type RouteRecordRaw } from "vue-router";

import { RunableInspectorError } from "./errors.js";
import type { InspectorRoute, InspectorRouteMatch } from "./types.js";

/**
 * `resolveRoute()`'s matching engine — reuses Vue Router's own public,
 * documented `Router.resolve()` (via `createRouter()` + `createMemoryHistory()`,
 * the exact combination Runable's own runtime router setup already uses for
 * SSR — see `router/plugin.ts`) instead of a hand-rolled matcher. This is
 * deliberate: dynamic/optional/catch-all param extraction, nested-route
 * resolution, and `alias` handling are all real Vue Router path-matching
 * semantics that a bespoke regex/path-to-regexp reimplementation would risk
 * silently drifting from.
 *
 * `createRouterMatcher()` (a lower-level primitive `createRouter()` itself
 * uses) was considered and rejected: it's exported by `vue-router`, but its
 * own JSDoc marks it `@internal` — no stability guarantee. `Router.resolve()`
 * is the fully public, documented API that reaches the exact same matching
 * logic, so it's the safer canonical choice for something this package now
 * depends on indefinitely.
 *
 * Every record is registered as an independent, *flat* top-level route —
 * not nested via `children`, even where `getRoutes()`'s `parent` field
 * indicates one route's page is wrapped by another's. `InspectorRoute.path`
 * is already the final, fully-resolved absolute pattern for every route
 * (`resolveInspectorRoutes()` composes it from the full ancestor chain), so
 * a flat record produces byte-identical matching (same matched route, same
 * params) to declaring the equivalent nested `children` tree — nesting only
 * changes `<router-view>` composition and the resolved `matched` chain's
 * *length*, neither of which `resolveRoute()` exposes (see `types.ts`'s
 * `InspectorRouteMatch` doc for why: `parent` names a wrapping *file*, not
 * necessarily a distinct navigable route, so reconstructing a `children`
 * tree from it wouldn't map cleanly onto Vue Router's own model — not
 * worth the complexity for a chain this API doesn't return anyway).
 */
export interface InspectorRouteMatcher {
  resolve(path: string): InspectorRouteMatch | null;
}

// A placeholder is registered for every record instead of the page's real
// component — resolveRoute() only ever calls Router.resolve(), which never
// renders (loads/executes) a matched route's component.
const PLACEHOLDER_COMPONENT = {};

function toRouteRecord(route: InspectorRoute): RouteRecordRaw {
  const record: RouteRecordRaw = {
    path: route.path,
    component: PLACEHOLDER_COMPONENT,
  };
  if (route.name) record.name = route.name;
  if (route.meta) record.meta = route.meta;
  return record;
}

export function createInspectorRouteMatcher(
  routes: InspectorRoute[],
): InspectorRouteMatcher {
  const byPath = new Map(routes.map((route) => [route.path, route]));
  const router = createRouter({
    history: createMemoryHistory(),
    routes: routes.map(toRouteRecord),
  });

  return {
    resolve(path: string): InspectorRouteMatch | null {
      if (!path.startsWith("/")) {
        throw new RunableInspectorError(
          `resolveRoute() expects an absolute path starting with "/", got ${JSON.stringify(path)}.`,
        );
      }

      const resolved = router.resolve(path);
      const matchedRecord = resolved.matched.at(-1);
      if (!matchedRecord) return null;

      // Always found in practice — every registered record's `path` came
      // straight from this same map's keys — but a Map miss degrading to
      // "no match" is a safer failure mode than a non-null assertion here.
      const route = byPath.get(matchedRecord.path);
      if (!route) return null;

      return {
        route,
        params: resolved.params,
        query: resolved.query,
        hash: resolved.hash,
      };
    },
  };
}
