import { defineComponent, h } from "vue";
import { RouterLink, type RouterLinkProps } from "vue-router";

export default defineComponent(
  (props: RouterLinkProps, { attrs, slots }) => {
    return () => h(RouterLink, { ...props, ...attrs }, slots);
  },
  {
    name: "RunableLink",
    inheritAttrs: false,
  },
);
