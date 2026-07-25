import type { App } from "vue";
import { inject } from "vue";
import { ASYNC_DATA_CONTEXT_KEY } from "./symbols.js";
import type { AsyncDataContext, CacheEntry } from "./types.js";

/**
 * Récupère le contexte injecté hors de l'arbre des composants.
 */
function getContext(app: App): AsyncDataContext | undefined {
  if (app.runWithContext) {
    // Vue 3.3+ : La méthode officielle pour injecter hors setup()
    return app.runWithContext(() => inject(ASYNC_DATA_CONTEXT_KEY));
  }
  // Fallback robuste pour la compatibilité ascendante
  return app._context.provides[ASYNC_DATA_CONTEXT_KEY];
}

/**
 * Extrait l'état de la mémoire pour l'injection dans le HTML.
 * À exécuter CÔTÉ SERVEUR, obligatoirement après le rendu de l'application.
 */
export function dehydrateAsyncData(app: App): Record<string, CacheEntry> {
  const context = getContext(app);
  if (!context) {
    throw new Error(
      "[vue-async-data] Plugin is not installed on this app instance.",
    );
  }

  return context.cache.extract();
}

/**
 * Restaure l'état en mémoire avant le montage de l'application.
 * À exécuter CÔTÉ CLIENT, avant l'appel à `app.mount()`.
 */
export function hydrateAsyncData(
  app: App,
  payload: Record<string, CacheEntry> | undefined,
): void {
  if (!payload) return; // Aucune donnée à hydrater

  const context = getContext(app);
  if (!context) {
    throw new Error(
      "[vue-async-data] Plugin is not installed on this app instance.",
    );
  }

  context.cache.restore(payload);
}
