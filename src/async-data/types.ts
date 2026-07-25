import type { Ref, WatchSource } from "vue";
import type { RequestManager } from "./RequestManager.js";

// ============================================================================
// 1. Core State Types
// ============================================================================

/**
 * Représente l'état actuel de la requête asynchrone.
 */
export type AsyncDataStatus = "idle" | "pending" | "success" | "error";

// ============================================================================
// 2. Options & Configuration
// ============================================================================

/**
 * Options globales passées lors de l'initialisation du plugin Vue.
 */
export interface AsyncDataPluginOptions {
  /** TTL par défaut en millisecondes pour toutes les requêtes. */
  ttl?: number;
  /** Optionnel : fonction pour logger les erreurs de requêtes. */
  onError?: (error: unknown, key: string) => void;
}

/**
 * Fonction responsable de la récupération des données.
 */
export type AsyncDataFetcher<Data> = () => Promise<Data>;

/**
 * Options spécifiques passées au composable `useAsyncData`.
 *
 * @template Data - Le type brut retourné par le fetcher.
 * @template TransformedData - Le type final après passage dans la fonction `transform`.
 */
export interface AsyncDataOptions<Data, TransformedData = Data> {
  /** Exécute la requête sur le serveur pendant le SSR. (Défaut: true) */
  server?: boolean;
  /** Ne bloque pas la navigation ou le SSR en attendant la résolution. (Défaut: false) */
  lazy?: boolean;
  /** Déclenche le fetch immédiatement à l'appel du composable. (Défaut: true) */
  immediate?: boolean;
  /** Durée de vie spécifique au cache de cette requête en ms. */
  ttl?: number;
  /** Fonction pour fournir une valeur par défaut avant la résolution. */
  default?: () => TransformedData;
  /** Fonction pour modifier ou filtrer la donnée avant de la stocker. */
  transform?: (data: Data) => TransformedData;
  /**
   * Tableau de sources réactives (Refs, Reactive, ou getters).
   * Le changement d'une de ces sources redéclenchera automatiquement la requête.
   */
  watch?: (WatchSource<unknown> | object)[];
}

// ============================================================================
// 3. Return Types
// ============================================================================

/**
 * L'objet réactif retourné par le composable.
 *
 * @template Data - Le type final des données (potentiellement transformé).
 * @template ErrorType - Le type de l'erreur interceptée.
 */
export interface AsyncDataResult<Data, ErrorType = Error> {
  /** La donnée réactive. `null` si non résolue et sans option `default`. */
  data: Ref<Data | null>;
  /** Raccourci pour status === 'pending'. */
  pending: Ref<boolean>;
  /** L'objet erreur si la requête échoue. */
  error: Ref<ErrorType | null>;
  /** L'état précis de la machine à états. */
  status: Ref<AsyncDataStatus>;
  /** Méthode pour forcer une nouvelle exécution manuelle de la requête. */
  execute: () => Promise<void>;
  /** Alias sémantique de execute(). */
  refresh: () => Promise<void>;
}

// ============================================================================
// 4. Cache & Memory Types
// ============================================================================

/**
 * Représentation d'une entrée isolée dans le cache.
 *
 * @template T - Le type de la donnée stockée.
 */
export interface CacheEntry<T = unknown> {
  /** La donnée stockée. Optionnelle car l'entrée peut contenir une erreur à la place. */
  data?: T;
  /** L'erreur stockée si le dernier fetch a échoué. */
  error?: unknown;
  /** Timestamp de création de l'entrée. */
  timestamp: number;
  /** Timestamp d'expiration calculé (timestamp + TTL). */
  expiresAt: number;
}

/**
 * Interface du gestionnaire de cache pour garantir l'inversion de contrôle (IoC).
 */
export interface CacheManager {
  get<T>(key: string): CacheEntry<T> | undefined;
  set<T>(key: string, data: T, ttl?: number): void;
  setError(key: string, error: unknown, ttl?: number): void;
  delete(key: string): void;
  clear(match?: (key: string) => boolean): void;
  /** Extrait l'état brut pour la déshydratation SSR. */
  extract(): Record<string, CacheEntry>;
  /** Restaure l'état brut lors de l'hydratation client. */
  restore(payload: Record<string, CacheEntry>): void;
}

// ============================================================================
// 5. Context & Architecture Types
// ============================================================================

/**
 * Le contexte injecté à la racine de l'application Vue.
 * Il contient l'état isolé pour une requête SSR donnée ou pour l'instance SPA.
 */
export interface AsyncDataContext {
  /** Le gestionnaire de cache en mémoire. */
  cache: CacheManager;

  //   /**
  //    * Dictionnaire des promesses en cours.
  //    * Sert de dédoublonneur pour le "Promise Deduplication".
  //    */
  //   promises: Map<string, Promise<unknown>>;

  /**
   * Le gestionnaire de requêtes réseau.
   * Remplace l'ancienne propriété `promises` basique.
   */
  requestManager: RequestManager;

  /** Les options globales configurées par l'utilisateur. */
  options: AsyncDataPluginOptions;
}
