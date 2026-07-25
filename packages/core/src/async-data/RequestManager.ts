/**
 * Type du fetcher qui reçoit le signal d'annulation.
 * Le développeur final DOIT passer ce signal à son client HTTP (fetch, axios, etc.)
 * pour que l'annulation réseau soit effective.
 */
export type FetcherWithSignal<T> = (signal?: AbortSignal) => Promise<T>;

export class RequestManager {
  /**
   * Stocke les promesses en cours d'exécution.
   * C'est le cœur de la déduplication.
   */
  private pendingPromises: Map<string, Promise<unknown>>;

  /**
   * Stocke les contrôleurs d'annulation associés à chaque clé.
   */
  private abortControllers: Map<string, AbortController>;

  constructor() {
    this.pendingPromises = new Map();
    this.abortControllers = new Map();
  }

  /**
   * Exécute une requête avec déduplication et prévention des race conditions.
   *
   * @param key - L'identifiant unique de la requête.
   * @param fetcher - La fonction retournant la Promesse.
   * @param force - Si true, annule la requête en cours (s'il y en a une) et en relance une nouvelle.
   */
  execute<T>(
    key: string,
    fetcher: FetcherWithSignal<T>,
    force: boolean = false,
  ): Promise<T> {
    // 1. Gestion de la concurrence et des Race Conditions
    if (this.pendingPromises.has(key)) {
      if (!force) {
        // DÉDUPLICATION : Une requête est déjà en cours, on partage la promesse.
        // Si 10 composants demandent "user-profile" au même instant,
        // 1 seul appel réseau part, les 9 autres s'abonnent à cette promesse.
        return this.pendingPromises.get(key) as Promise<T>;
      }

      // PREVENTION RACE CONDITION : L'utilisateur a forcé le rafraîchissement.
      // On annule explicitement la requête précédente pour éviter que sa
      // résolution tardive n'écrase les données de la nouvelle requête.
      this.abort(key, "Cancelled by a new forced execution");
    }

    // 2. Initialisation du contrôleur d'annulation
    const controller = new AbortController();
    this.abortControllers.set(key, controller);

    // 3. Encapsulation et exécution
    const promise = (async () => {
      try {
        // On passe le signal au fetcher pour permettre l'annulation native
        return await fetcher(controller.signal);
      } finally {
        // 4. Nettoyage garanti (que ça réussisse ou que ça throw)
        // C'est vital pour éviter les fuites de mémoire et permettre
        // aux futures requêtes pour cette même clé de s'exécuter.
        this.pendingPromises.delete(key);
        this.abortControllers.delete(key);
      }
    })(); // IIFE asynchrone

    // On stocke la promesse AVANT de la retourner
    this.pendingPromises.set(key, promise);

    return promise as Promise<T>;
  }

  /**
   * Annule manuellement une requête en cours d'exécution.
   */
  abort(key: string, reason: string = "Aborted manually"): void {
    const controller = this.abortControllers.get(key);
    if (controller) {
      controller.abort(reason);

      // On supprime immédiatement les références pour débloquer la clé
      this.abortControllers.delete(key);
      this.pendingPromises.delete(key);
    }
  }

  /**
   * Annule toutes les requêtes en cours.
   * Très utile lors du démontage global d'une SPA ou en cas d'erreur fatale.
   */
  abortAll(reason: string = "All requests aborted"): void {
    for (const [, controller] of this.abortControllers.entries()) {
      controller.abort(reason);
    }
    this.abortControllers.clear();
    this.pendingPromises.clear();
  }
}
