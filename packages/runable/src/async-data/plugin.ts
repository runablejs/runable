import type { App, Plugin } from "vue";
import type { AsyncDataPluginOptions, AsyncDataContext } from "./types.js";
import { DefaultCacheManager } from "./CacheManager.js";
import { RequestManager } from "./RequestManager.js";
import { ASYNC_DATA_CONTEXT_KEY } from "./symbols.js";

/**
 * Factory du plugin vue-async-data.
 *
 * @param options - Configuration globale (ex: { ttl: 30000 })
 * @returns Un objet Plugin installable via app.use()
 */
export function createAsyncData(options: AsyncDataPluginOptions = {}): Plugin {
  // Fusion avec les options par défaut du système
  const finalOptions = {
    ttl: 300000, // 5 minutes par défaut
    ...options,
  };

  return {
    install(app: App) {
      // 1. Instanciation isolée pour CETTE instance de l'application Vue
      const cache = new DefaultCacheManager(finalOptions.ttl);
      const requestManager = new RequestManager();

      // 2. Création du contexte global de la librairie
      const context: AsyncDataContext = {
        cache,
        requestManager,
        options: finalOptions,
      };

      // 3. Injection à la racine de l'application
      app.provide(ASYNC_DATA_CONTEXT_KEY, context);

      // 4. (Optionnel) Accès via la globale Vue pour le debugging
      // app.config.globalProperties.$asyncData = context
    },
  };
}
