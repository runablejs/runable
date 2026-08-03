import { computed, defineAsyncComponent, defineComponent, h } from "vue";
import { useRoute } from "@/app/composables/router.js";
import { useLayouts } from "@/layout/useLayouts.js";

type LayoutMeta =
  | string
  | false
  | { name: string; props?: Record<string, unknown> }
  | undefined;

export default defineComponent({
  name: "SyoraLayout",

  setup(_, { slots }) {
    const layouts = useLayouts();
    const route = useRoute();

    function resolveLoader(name: string) {
      return layouts[name];
    }

    const layoutConfig = computed(() => {
      const metaLayout = route.meta.layout as LayoutMeta;

      if (metaLayout === false) {
        return {
          name: null as string | null,
          props: {} as Record<string, unknown>,
        };
      }

      if (
        metaLayout &&
        typeof metaLayout === "object" &&
        "name" in metaLayout
      ) {
        return {
          name: metaLayout.name,
          props: metaLayout.props ?? {},
        };
      }

      return {
        name: metaLayout ?? "default",
        props: {},
      };
    });

    const layoutComponent = computed(() => {
      const { name } = layoutConfig.value;
      if (!name) return null;

      const loader = resolveLoader(name);
      return loader ? defineAsyncComponent(loader) : null;
    });

    return () => {
      const component = layoutComponent.value;

      if (component) {
        return h(component, layoutConfig.value.props, {
          default: () => slots.default?.(),
        });
      }

      return slots.default?.();
    };
  },
});
