import { uneval } from "devalue";
import type { CacheEntry } from "./types.js";

/**
 * Sérialise l'état du cache de manière sécurisée et robuste (SSR -> Client).
 *
 * Contrairement à JSON.stringify, uneval gère :
 * - Les types complexes (Date, Map, Set, BigInt, RegExp, etc.)
 * - Les références circulaires
 * - L'échappement strict des balises HTML pour empêcher les injections XSS
 *
 * @param state - Le dictionnaire extrait du CacheManager
 * @returns Une chaîne de caractères JavaScript exécutable en toute sécurité
 */
export function serializeState(state: Record<string, CacheEntry>): string {
  // uneval transforme l'objet en une expression JavaScript évaluable
  return uneval(state);
}

/**
 * Désérialise l'état transmis par le serveur pour alimenter le cache (Client).
 *
 * @param serializedState - La chaîne brute récupérée depuis le DOM (ex: window.__ASYNC_DATA__)
 * @returns Le dictionnaire de CacheEntry restauré
 */
export function deserializeState(
  serializedState: string,
): Record<string, CacheEntry> {
  if (!serializedState) return {};

  try {
    // Évaluation sécurisée de la structure transmise par le serveur
    return (0, eval)(`(${serializedState})`);
  } catch (error) {
    console.error("[vue-async-data] Failed to deserialize SSR state:", error);
    return {};
  }
}
