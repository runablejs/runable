/**
 * useScrollReveal — Composable d'animations au scroll
 * ====================================================
 * Basé sur IntersectionObserver natif. Zero dépendance externe.
 *
 * Philosophie Runable :
 *   - Pas de rebond, pas d'élasticité, pas de scale
 *   - Gestes de précision : opacity + translateY microscopique
 *   - Stagger contrôlé pour les grilles
 *   - Respect des tokens motion (duration, ease)
 *
 * Usage :
 *   const { reveal } = useScrollReveal({ threshold: 0.15, stagger: 80 });
 *   reveal(elRef);
 */

import { ref, onMounted, onUnmounted } from "vue";

export interface ScrollRevealOptions {
  /** Seuil de visibilité avant déclenchement (0–1) */
  threshold?: number;
  /** Marge autour du viewport (px ou %) */
  rootMargin?: string;
  /** Délai entre chaque élément d'un groupe (ms) */
  stagger?: number;
  /** Classe CSS appliquée avant l'animation */
  hiddenClass?: string;
  /** Classe CSS appliquée après l'animation */
  visibleClass?: string;
  /** Durée de transition (override le token CSS) */
  duration?: string;
  /** Timing function (override le token CSS) */
  ease?: string;
  /** Décalage vertical initial (px) */
  y?: number;
}

const defaultOptions: Required<ScrollRevealOptions> = {
  threshold: 0.15,
  rootMargin: "0px 0px -40px 0px",
  stagger: 0,
  hiddenClass: "sr-hidden",
  visibleClass: "sr-visible",
  duration: "var(--runable-duration-base, 200ms)",
  ease: "var(--runable-ease-smooth, cubic-bezier(0.4, 0, 0.2, 1))",
  y: 12,
};

/**
 * Applique une animation de révélation sur un élément ou un groupe d'éléments.
 */
export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const opts = { ...defaultOptions, ...options };
  const observerRef = ref<IntersectionObserver | null>(null);

  /**
   * Révèle un élément unique ou un NodeList/Array d'éléments.
   */
  function reveal(
    target: HTMLElement | HTMLElement[] | NodeListOf<HTMLElement> | null,
  ) {
    if (!target) return;

    const elements =
      Array.isArray(target) || target instanceof NodeList
        ? Array.from(target)
        : [target];

    if (elements.length === 0) return;

    // Applique les styles initiaux (hidden state)
    elements.forEach((el, index) => {
      el.classList.add(opts.hiddenClass);
      el.style.transitionProperty = "opacity, transform";
      el.style.transitionDuration = opts.duration;
      el.style.transitionTimingFunction = opts.ease;
      el.style.transitionDelay = `${index * opts.stagger}ms`;
    });

    // Crée l'observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.classList.remove(opts.hiddenClass);
            el.classList.add(opts.visibleClass);
            observer.unobserve(el);
          }
        });
      },
      {
        threshold: opts.threshold,
        rootMargin: opts.rootMargin,
      },
    );

    elements.forEach((el) => observer.observe(el));
    observerRef.value = observer;
  }

  /**
   * Révèle les enfants d'un conteneur avec stagger automatique.
   */
  function revealChildren(
    container: HTMLElement | null,
    childSelector?: string,
    staggerOverride?: number,
  ) {
    if (!container) return;

    const children = childSelector
      ? Array.from(container.querySelectorAll<HTMLElement>(childSelector))
      : (Array.from(container.children) as HTMLElement[]);

    reveal(children);

    // Override le stagger si spécifié
    if (staggerOverride !== undefined) {
      children.forEach((el, index) => {
        el.style.transitionDelay = `${index * staggerOverride}ms`;
      });
    }
  }

  onUnmounted(() => {
    observerRef.value?.disconnect();
  });

  return { reveal, revealChildren, observer: observerRef };
}

/**
 * Variante simplifiée : révèle au mount (sans scroll).
 * Utile pour les éléments déjà visibles au chargement.
 */
export function useMountReveal(delay: number = 0) {
  const isVisible = ref(false);

  onMounted(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        isVisible.value = true;
      }, delay);
    });
  });

  return { isVisible };
}

export default useScrollReveal;
