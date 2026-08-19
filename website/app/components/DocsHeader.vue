<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "~/lib/utils";
import { useSidebar } from "./ui/sidebar/utils.ts";

// const props = defineProps<{
//   tree: ContentNavigationItem
// }>()

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const { nav } = useAppConfig();
const { toggleSidebar } = useSidebar();
const router = useRouter();

const active = computed(() => {
  const path = router.currentRoute.value.path.replace(/\/+$/, "");

  return nav.find((item) => {
    const blockPath = `/docs/${item.code}`;
    return path === blockPath || path.startsWith(`${blockPath}/`);
  })?.name;
});
</script>

<template>
  <div
    class="px-4 md:px-6 border-y bg-background sticky top-0 z-100 h-(--header-height) w-full overflow-x-auto overflow-y-hidden scrollbar-none"
  >
    <div
      aria-hidden="true"
      class="absolute inset-0 opacity-10 dark:opacity-30 dark:filter dark:invert"
      style="
        background-image: url(https://template-nextjs-clean.sanity.build/images/tile-1-black.png);
        background-size: 5px;
      "
    ></div>

    <div class="flex h-full items-center justify-between gap-4 relative">
      <div class="md:hidden h-full">
        <UButton
          data-sidebar="trigger"
          data-slot="sidebar-trigger"
          variant="ghost"
          size="icon"
          class="rounded-none"
          @click="toggleSidebar"
        >
          <UIcon name="tabler:list-tree" />
          <span class="sr-only">Toggle Sidebar</span>
        </UButton>
      </div>

      <!-- Middle area -->
      <nav
        class="h-full hidden lg:flex items-center gap-2"
        :class="cn('items-center gap-0', props.class)"
      >
        <SyoraLink
          v-for="{ name, href, icon } in nav"
          :key="name"
          :class="{
            'border-b-primary': active === name,
            'border-b-transparent text-muted-foreground': active !== name,
          }"
          variant="ghost"
          :to="href"
          class="px-1.5 hover:text-primary hover:border-b-primary h-full justify-center rounded-none border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap"
        >
          <UIcon :name="icon" class="size-4" />
          {{ name }}
        </SyoraLink>
      </nav>
    </div>
  </div>
</template>
