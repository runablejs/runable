import {
  defineComponent,
  shallowRef,
  onMounted,
  h,
  cloneVNode,
  createCommentVNode,
  RendererNode,
  type PropType,
  type VNode,
  type Component,
  type ComponentOptions,
  getCurrentInstance,
} from "vue";

function sanitizeTag(tag: string | undefined, fallback: string): string {
  if (!tag) return fallback;
  const t = tag.trim().toLowerCase();
  // Liste blanche restrictive pour éviter les balises dangereuses en SSR
  const allowed =
    /^(div|span|p|section|article|aside|header|footer|main|nav|ul|ol|li|table|tr|td|th|thead|tbody|tfoot|h[1-6]|label|strong|em|i|b|small|mark|del|ins|sub|sup|code|pre|samp|kbd|var|cite|q|abbr|address|blockquote|details|summary|figure|figcaption|time|progress|meter)$/;
  return allowed.test(t) ? t : fallback;
}

export default defineComponent({
  name: "ClientOnly",
  inheritAttrs: false,

  props: {
    fallback: {
      type: String as PropType<string>,
      default: undefined,
    },
    placeholder: {
      type: String as PropType<string>,
      default: undefined,
    },
    fallbackTag: {
      type: String as PropType<string>,
      default: undefined,
    },
    placeholderTag: {
      type: String as PropType<string>,
      default: undefined,
    },
  },

  setup(props, { slots, attrs }) {
    const mounted = shallowRef(false);

    onMounted(() => {
      mounted.value = true;
    });

    return () => {
      if (mounted.value) {
        const vnodes = slots.default?.();
        if (vnodes && vnodes.length === 1) {
          return [cloneVNode(vnodes[0] as VNode, attrs)];
        }
        return vnodes;
      }

      // Pas encore monté → fallback
      const slot = slots.fallback || slots.placeholder;
      if (slot) {
        return h(slot as any);
      }

      const fallbackStr = props.fallback || props.placeholder || "";
      const tag = sanitizeTag(
        props.fallbackTag || props.placeholderTag,
        "span",
      );

      // Placeholder : commentaire si possible, sinon <div>
      if (!fallbackStr && typeof window === "undefined") {
        return createCommentVNode("client-only");
      }

      return h(tag, attrs, fallbackStr);
    };
  },
});

import {} from "vue";

const cache = new WeakMap<ComponentOptions, Component>();

function isServer(): boolean {
  return typeof window === "undefined";
}

function createPlaceholder(el?: RendererNode | null) {
  if (el && el.nodeType !== 8) {
    // 8 = comment node
    // On réutilise l'élément existant si possible
    return h("div");
  }
  return createCommentVNode("client-only");
}

export function createClientOnly<T extends ComponentOptions>(
  component: T,
): Component {
  // Côté serveur : on retourne un composant qui ne rend qu'un placeholder
  if (isServer()) {
    return {
      name: `${component.name || "Anonymous"}ClientOnly`,
      render() {
        return createCommentVNode("client-only");
      },
    };
  }

  if (cache.has(component)) {
    return cache.get(component)!;
  }

  const clone: ComponentOptions = { ...component };

  // --- 1. Composant avec render() (Options API ou compilé) ---
  if (clone.render) {
    const originalRender = clone.render;
    clone.render = function (
      ctx: any,
      cache: any,
      $props: any,
      $setup: any,
      $data: any,
      $options: any,
    ) {
      if ($setup.mounted$ ?? ctx.mounted$) {
        const res = originalRender.call(
          ctx,
          ctx,
          cache,
          $props,
          $setup,
          $data,
          $options,
        );
        // Si le résultat est un texte ou null, on clone pour éviter les mutations
        return res?.children === null || typeof res?.children === "string"
          ? cloneVNode(res)
          : h(res);
      }
      return createPlaceholder(ctx._.vnode?.el);
    };
  }

  // --- 2. Composant avec template (runtime compiler) ---
  else if (clone.template) {
    const originalTemplate = clone.template;
    clone.template = `
      <template v-if="mounted$">${originalTemplate}</template>
      <template v-else><!--client-only--></template>
    `;
  }

  // --- 3. Setup intercepté ---
  const originalSetup = clone.setup;
  clone.setup = (props, ctx) => {
    const mounted$ = shallowRef(false);

    onMounted(() => {
      mounted$.value = true;
    });

    const setupState = originalSetup?.(props, ctx);

    // Si la setup retourne une Promise (async setup)
    if (setupState && typeof setupState === "object" && "then" in setupState) {
      return Promise.resolve(setupState).then((state: any) => {
        if (typeof state === "function") {
          // Render function retournée par setup
          return (...args: any[]) => {
            if (mounted$.value) {
              const res = state(...args);
              const attrs =
                clone.inheritAttrs !== false ? ctx.attrs : undefined;
              return res?.children === null || typeof res?.children === "string"
                ? cloneVNode(res, attrs)
                : h(res, attrs);
            }
            return createPlaceholder(getCurrentInstance()?.vnode?.el);
          };
        }
        // Objet de setup
        state ||= {};
        state.mounted$ = mounted$;
        return state;
      });
    }

    // Si la setup retourne une render function synchrone
    if (typeof setupState === "function") {
      return (...args: any[]) => {
        if (mounted$.value) {
          const res = setupState(...args);
          const attrs = clone.inheritAttrs !== false ? ctx.attrs : undefined;
          return res?.children === null || typeof res?.children === "string"
            ? cloneVNode(res, attrs)
            : h(res, attrs);
        }
        return createPlaceholder(getCurrentInstance()?.vnode?.el);
      };
    }

    // Setup qui retourne un objet
    return Object.assign(setupState || {}, { mounted$ });
  };

  cache.set(component, clone);
  return clone;
}
