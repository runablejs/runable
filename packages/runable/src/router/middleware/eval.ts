import type { Router } from "vue-router";
import middlewareDefinitions from ":router-middlewares";

import { type VueRouterMiddleware } from "./index.js";
import { toArray } from "@/utils/to-array.js";

// Cache des middlewares déjà résolus (évite de ré-importer à chaque navigation)
const resolvedCache = new Map<string, VueRouterMiddleware[]>();

async function resolveMiddleware(name: string): Promise<VueRouterMiddleware[]> {
  const cached = resolvedCache.get(name);
  if (cached) return cached;

  const definition = middlewareDefinitions.find((mw) => mw.name === name);

  if (!definition) {
    throw new Error(`[router-middlewares] Middleware "${name}" introuvable.`);
  }

  const mod = await definition.middleware();
  const fns = toArray(mod.default);

  resolvedCache.set(name, fns);
  return fns;
}

export function installRouterMiddlewares(router: Router): void {
  const globalMiddlewareNames = middlewareDefinitions
    .filter((mw) => mw.isGlobal)
    .map((mw) => mw.name);

  router.beforeEach(async (to, from) => {
    const routeMiddlewareNames = to.matched.flatMap((record) => {
      const meta = record.meta.middleware as string[];
      if (!meta) return [];
      return toArray(meta);
    });

    routeMiddlewareNames.unshift(...globalMiddlewareNames);

    // Dédoublonne (une route + ses parents peuvent redéfinir le même middleware)
    const uniqueRouteMiddlewareNames = [...new Set(routeMiddlewareNames)];

    const routeMiddlewares = await Promise.all(
      uniqueRouteMiddlewareNames.map((name) => resolveMiddleware(name)),
    );

    for (const routeMiddleware of routeMiddlewares.flat()) {
      try {
        const result = await routeMiddleware(to, from);

        // Si un middleware renvoie explicitement false, une redirection,
        // ou undefined/void ne bloquant pas, on interprète le résultat :
        if (result !== undefined && result !== true) {
          return result; // stoppe la chaîne (redirection ou false)
        }
      } catch (error) {
        console.error("[Middleware Error]", error);
        throw error;
      }
    }

    return true;
  });
}
