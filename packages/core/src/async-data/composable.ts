import { ref, inject, watch, onServerPrefetch, type Ref } from "vue";
import type {
  AsyncDataOptions,
  AsyncDataResult,
  AsyncDataStatus,
  AsyncDataContext,
} from "./types.js";
import { ASYNC_DATA_CONTEXT_KEY } from "./symbols.js";

// Définition du type "Thenable" pour permettre l'await optionnel
export type _AsyncData<Data, ErrorType> = AsyncDataResult<Data, ErrorType> &
  PromiseLike<AsyncDataResult<Data, ErrorType>>;

export function useAsyncData<Data, TransformedData = Data>(
  key: string,
  fetcher: (signal?: AbortSignal) => Promise<Data>,
  options: AsyncDataOptions<Data, TransformedData> = {},
): _AsyncData<TransformedData, Error> {
  // 1. Récupération du contexte isolé (Crucial pour éviter le Cross-Request State Pollution en SSR)
  const context = inject<AsyncDataContext>(ASYNC_DATA_CONTEXT_KEY);
  if (!context) {
    throw new Error(
      "useAsyncData must be used within an app initialized with createAsyncDataPlugin()",
    );
  }

  const { cache, requestManager, options: pluginOptions } = context;

  // 2. Fusion des options avec les valeurs par défaut
  const config = {
    server: true,
    lazy: false,
    immediate: true,
    default: () => null as unknown as TransformedData,
    ttl: pluginOptions.ttl ?? 300000,
    ...options,
  };

  // 3. Initialisation de l'état réactif
  const data = ref<TransformedData>(config.default()) as Ref<TransformedData>;
  const pending = ref(false);
  const error = ref<Error | null>(null);
  const status = ref<AsyncDataStatus>("idle");

  // Détection de l'environnement
  const isServer = typeof window === "undefined";

  // 4. Moteur d'exécution principal
  const execute = async (force: boolean = false): Promise<void> => {
    // Éviter l'exécution serveur si explicitement désactivé
    if (isServer && !config.server) return;

    pending.value = true;
    status.value = "pending";
    error.value = null;

    try {
      // Stratégie de Cache (Stale-While-Revalidate partiel)
      const cached = cache.get<TransformedData>(key);
      if (!force && cached && cached.expiresAt > Date.now()) {
        // Si la donnée est en erreur, on relance (sauf si un comportement différent est souhaité)
        if (cached.error) throw cached.error;

        data.value = cached.data as TransformedData;
        status.value = "success";
        pending.value = false;
        return;
      }

      // Appel au RequestManager (gère la déduplication et les signaux d'annulation)
      const rawData = await requestManager.execute(
        key,
        (signal) => fetcher(signal),
        force,
      );

      // Transformation éventuelle de la donnée
      const finalData = config.transform
        ? config.transform(rawData)
        : (rawData as unknown as TransformedData);

      data.value = finalData;
      cache.set(key, finalData, config.ttl);
      status.value = "success";
    } catch (e) {
      const err = e as Error;

      // Ignorer silencieusement si la requête a été annulée (AbortController)
      if (err.name === "AbortError") return;

      error.value = err as Error;
      status.value = "error";
      cache.setError(key, err, config.ttl);

      if (pluginOptions.onError) pluginOptions.onError(err, key);
    } finally {
      // pending passe à false que ce soit un succès ou une erreur
      pending.value = false;
    }
  };

  // 5. Alias sémantique
  const refresh = () => execute(true);

  // 6. Gestion du Watcher (Réactivité dynamique)
  if (config.watch) {
    watch(
      config.watch,
      () => {
        // Force le rafraîchissement dès qu'une dépendance change
        execute(true);
      },
      { deep: true },
    );
  }

  // 7. Initialisation de la requête (Cycle de vie Vue)
  let fetchPromise = Promise.resolve();

  if (config.immediate) {
    // CSR: On cherche d'abord dans le payload d'hydratation (si injecté dans index.html)
    // C'est ici que l'isomorphisme se crée. Si la donnée est là, execute() tapera dans le cache.

    fetchPromise = execute();
  }

  // Intégration stricte au cycle de vie SSR de Vue 3
  if (isServer && config.server && !config.lazy) {
    onServerPrefetch(() => fetchPromise);
  }

  // 8. L'objet de retour de base
  const result: AsyncDataResult<TransformedData, Error> = {
    data,
    pending,
    error,
    status,
    execute,
    refresh,
  };

  // 9. Le pattern "Thenable" : La magie de la DX
  const promiseHandler = config.lazy
    ? Promise.resolve(result)
    : fetchPromise.then(() => result);

  return Object.assign(promiseHandler, result) as _AsyncData<
    TransformedData,
    Error
  >;
}
