import { toArray } from "@/utils";
import type { Router, RouteRecordRaw, NavigationGuard } from "vue-router";
import { middlewares } from ":router-middlewares";

/**
 * Extrait definePageMeta() de tous les composants de page
 * et les injecte dans les meta des routes
 */
export function extractPageMeta(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  function processRoute(route: RouteRecordRaw): RouteRecordRaw {
    const component = route.component as any;

    // Si le composant a une propriété __pageMeta (exposée par un loader/vite plugin)
    // ou si on l'a déjà extraite via le registre
    const extractedMeta: Ro = component?.__pageMeta || {};

    // Fusionne avec les meta existantes de vue-router
    route.meta = {
      ...route.meta,
      ...extractedMeta,
      pageMeta: extractedMeta,
    };

    // Traite les enfants récursivement
    if (route.children) {
      route.children = route.children.map(processRoute);
    }

    return route;
  }

  return routes.map(processRoute);
}

/**
 * Plugin vue-router qui applique les métadonnées extraites
 * (titre, middleware, auth, etc.)
 */
export function createPageMetaPlugin(router: Router): void {
  // Navigation guard : exécute les middlewares et applique le titre
  router.beforeEach((to, from, next) => {
    const meta = to.meta?.pageMeta as PageMeta | undefined;

    if (!meta) {
      next();
      return;
    }

    // Exécute les middlewares
    if (meta.middleware) {
      const middlewares = toArray(meta.middleware ?? []);

      for (const mw of middlewares) {
        if (typeof mw === "string") {
          // Middleware par nom (à résoudre via un registre de middlewares)
          const middlewareFn = getMiddleware(mw);
          if (middlewareFn) {
            const result = middlewareFn(to, from);
            if (result === false || result instanceof Promise) {
              // Gère la navigation bloquée
              if (result === false) return;
              if (result instanceof Promise) {
                result
                  .then((res) => {
                    if (res === false) return;
                    next();
                  })
                  .catch(() => {});
                return;
              }
            }
          }
        } else if (typeof mw === "function") {
          const result = mw(to, from);
          if (result === false) return;
          if (result instanceof Promise) {
            result
              .then((res) => {
                if (res !== false) next();
              })
              .catch(() => {});
            return;
          }
        }
      }
    }

    next();
  });
}

function getMiddleware(name: string): NavigationGuard | undefined {
  // Registre de middlewares
  const middlewares: Record<string, NavigationGuard> = {
    // 'admin': (to, from) => { ... },
    // 'verified': (to, from) => { ... },
  };
  return middlewares[name];
}
