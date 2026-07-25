<!-- Layout.vue -->
<script setup lang="ts">
import { computed, defineAsyncComponent, type Component } from "vue";
import { useRoute } from "vue-router";
import { layouts } from ":layouts";

// const layoutModules = import.meta.glob<{ default: Component }>(
//   "../layouts/*.vue",
// );

function resolveLoader(name: string) {
  return layouts[name];
  //   const entry = Object.entries(layoutModules).find(([path]) =>
  //     path.endsWith(`/${name}.vue`),
  //   );
  //   return entry?.[1];
}

const route = useRoute();

const layoutConfig = computed(() => {
  const metaLayout = route.meta.layout as
    | string
    | false
    | { name: string; props?: Record<string, unknown> };

  if (metaLayout === false) return { name: null, props: {} };

  if (metaLayout && typeof metaLayout === "object" && "name" in metaLayout) {
    return {
      name: metaLayout.name as string,
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

  const loader = resolveLoader(layoutConfig.value.name);
  return loader ? defineAsyncComponent(loader) : null;
});
</script>

<template>
  <component
    :is="layoutComponent"
    v-if="layoutComponent"
    v-bind="layoutConfig.props"
  >
    <slot />
  </component>
  <slot v-else />
</template>
