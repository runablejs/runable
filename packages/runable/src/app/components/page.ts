import { defineComponent, h } from "vue";
import { RouterView, type RouterViewProps } from "vue-router";

export default defineComponent(
  (props: RouterViewProps, { attrs, slots }) => {
    return () => h(RouterView, { ...props, ...attrs }, slots);
  },
  {
    name: "RunablePage",
    inheritAttrs: false,
  },
);
