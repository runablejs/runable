import type { CacheManager, CacheEntry } from "./types.js";

export class DefaultCacheManager implements CacheManager {
  /**
   * Stockage interne brut.
   * Utilisation d'une Map pour des performances O(1) sur la lecture/écriture.
   */
  private cache: Map<string, CacheEntry<unknown>>;
  private defaultTTL: number;

  /**
   * @param defaultTTL - Durée de vie par défaut en ms (ex: 5 minutes = 300000)
   */
  constructor(defaultTTL: number = 300000) {
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  /**
   * Récupère une entrée du cache.
   * Note : Cette méthode retourne la donnée même si elle est expirée.
   * C'est au composable (le consommateur) de vérifier l'expiration pour
   * implémenter le pattern "Stale-While-Revalidate".
   */
  get<T>(key: string): CacheEntry<T> | undefined {
    return this.cache.get(key) as CacheEntry<T> | undefined;
  }

  /**
   * Stocke une donnée avec succès.
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.prune(); // Nettoyage opportuniste
    const timestamp = Date.now();
    this.cache.set(key, {
      data,
      timestamp,
      expiresAt: timestamp + ttl,
    });
  }

  /**
   * Stocke spécifiquement une erreur (utile pour éviter de retenter
   * une requête qui a échoué en boucle pendant le TTL).
   */
  setError(key: string, error: unknown, ttl: number = this.defaultTTL): void {
    const timestamp = Date.now();
    this.cache.set(key, {
      error,
      timestamp,
      expiresAt: timestamp + ttl,
    });
  }

  /**
   * Supprime physiquement une clé du cache.
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Vide le cache partiellement ou totalement.
   * @param match - Fonction optionnelle pour filtrer les clés à supprimer.
   */
  clear(match?: (key: string) => boolean): void {
    if (!match) {
      this.cache.clear();
      return;
    }

    // Itération sécurisée : on peut supprimer des éléments d'une Map
    // pendant qu'on l'itère en JavaScript.
    for (const key of this.cache.keys()) {
      if (match(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Invalide une clé sans la supprimer.
   * Rend la donnée immédiatement obsolète (expiresAt = 0).
   */
  invalidate(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      entry.expiresAt = 0;
    }
  }

  /**
   * Utilitaires SSR : Extraction de la mémoire pour déshydratation.
   */
  extract(): Record<string, CacheEntry> {
    // Convertit la Map en objet pur sérialisable
    return Object.fromEntries(this.cache.entries());
  }

  /**
   * Utilitaires SSR : Restauration de la mémoire depuis le payload client.
   */
  restore(payload: Record<string, CacheEntry>): void {
    for (const [key, entry] of Object.entries(payload)) {
      this.cache.set(key, entry);
    }
  }

  /**
   * Garbage Collection manuel.
   * Nettoie physiquement la mémoire des entrées expirées.
   */
  prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }
}
