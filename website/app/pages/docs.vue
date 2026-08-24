<script setup lang="ts">
import SidebarProvider from "~/components/ui/sidebar/SidebarProvider.vue";
import SidebarInset from "~/components/ui/sidebar/SidebarInset.vue";
import DocsSidebar from "~/components/DocsSidebar.vue";

import DocsHeader from "~/components/DocsHeader.vue";
import { toArray } from "~/utils/to-array";

const route = useRouter().currentRoute;

watch(
  () => route.value,
  () => {
    if (route.value.name === "docs") {
      navigateTo({
        name: "docs-slugs",
        params: { slugs: ["getting-started", "installation"].join("/") },
        replace: true,
      });
    }
  },
  { immediate: true },
);

const slugs = computed(() => {
  const params = route.value.params as { slugs: string | string[] };
  const slugs = toArray(params.slugs);

  return slugs
    .map((slug) => slug.split("/"))
    .flat()
    .filter(Boolean);
});

const blockCode = computed(() => {
  return slugs.value[0];
});
</script>

<template>
  <!-- <div class="container-wrapper flex flex-1 flex-col"> -->

  <!-- class="min-h-min flex-1 items-start px-0 [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:[--top-spacing:--spacing(4)] 3xl:fixed:container 3xl:fixed:px-3"
    :style="{ '--sidebar-width': 'calc(var(--spacing) * 72)' }" -->
  <SidebarProvider class="flex flex-col">
    <DocsHeader />

    <div class="flex flex-1">
      <DocsSidebar :block-code />

      <SidebarInset class="">
        <div class="h-full w-full">
          <RunablePage :key="$route.path" />
        </div>
      </SidebarInset>
    </div>
  </SidebarProvider>
  <!-- </div> -->
</template>
