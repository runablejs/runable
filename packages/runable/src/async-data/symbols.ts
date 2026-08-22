import type { InjectionKey } from "vue";
import type { AsyncDataContext } from "./types.js";

/**
 * Clé d'injection unique pour l'écosystème de la librairie.
 *
 * L'utilisation d'un Symbol natif garantit qu'aucune collision de nommage
 * ne peut survenir avec d'autres librairies Vue ou avec le code de l'utilisateur final.
 *
 * Le passage du générique `InjectionKey<AsyncDataContext>` permet à Vue
 * d'inférer automatiquement le type du contexte lors de l'appel à `inject()`,
 * sans avoir à le redéclarer manuellement dans chaque composable.
 */
export const ASYNC_DATA_CONTEXT_KEY: InjectionKey<AsyncDataContext> =
  Symbol("ASYNC_DATA_CONTEXT");
