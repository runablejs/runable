<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "~/lib/utils";
import { useSidebar } from "./ui/sidebar/utils.ts";
import Logo from "./navbar-components/Logo.vue";
import ModeSwitcher from "./ModeSwitcher.vue";
import DocsSearch from "./DocsSearch.vue";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const header = ref<HTMLDivElement | null>(null);
const showExtra = ref(false);
const router = useRouter();
const { nav } = useAppConfig();
const { toggleSidebar } = useSidebar();

const active = computed(() => {
  const path = router.currentRoute.value.path.replace(/\/+$/, "");

  return nav.find((item) => {
    const blockPath = `/docs/${item.code}`;
    return path === blockPath || path.startsWith(`${blockPath}/`);
  })?.name;
});

function onScroll() {
  if (!header.value) return;

  showExtra.value = header.value.getBoundingClientRect().top <= 0;
}

onMounted(() => {
  onScroll();
  window.addEventListener("scroll", onScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <div
    ref="header"
    class="px-4 md:px-6 border-b bg-background sticky top-0 z-100 h-(--header-height) w-full overflow-x-auto overflow-y-hidden scrollbar-none"
  >
    <!-- <div
      aria-hidden="true"
      class="absolute inset-0 opacity-10 dark:opacity-30 dark:filter dark:invert"
      style="
        background-image: url(https://template-nextjs-clean.sanity.build/images/tile-1-black.png);
        background-size: 5px;
      "
    ></div> -->

    <div class="flex h-full items-center gap-1 relative">
      <RouterLink
        v-if="showExtra"
        to="/"
        class="flex items-center gap-2 h-full overflow-hidden"
      >
        <div
          class="flex items-center bg-accent text-accent-foreground h-full px-1 aspect-square"
        >
          <Logo class="size-7 h-9/12" />
        </div>
      </RouterLink>

      <UButton
        data-sidebar="trigger"
        data-slot="sidebar-trigger"
        variant="ghost"
        size="icon"
        class="rounded-none md:hidden"
        @click="toggleSidebar"
      >
        <UIcon name="tabler:list-tree" class="rotate-180 size-5" />
        <span class="sr-only">Toggle Sidebar</span>
      </UButton>

      <!-- Middle area -->
      <nav
        class="h-full max-md:hidden flex items-center gap-2"
        :class="cn('items-center gap-0', props.class)"
      >
        <RunableLink
          v-for="{ name, href, icon } in nav"
          :key="name"
          :class="{
            'bg-border': active === name,
            'border-b-transparent text-muted-foreground': active !== name,
          }"
          variant="ghost"
          :to="href"
          class="px-1.5 hover:text-primary hover:bg-border h-full justify-center rounded-none font-medium text-sm flex items-center gap-2 whitespace-nowrap"
        >
          <UIcon :name="icon" class="size-4" />
          {{ name }}
        </RunableLink>
      </nav>

      <!-- Right side -->
      <div class="ml-auto flex flex-1 items-center justify-end gap-1 h-full">
        <ClientOnly>
          <DocsSearch />
        </ClientOnly>

        <template v-if="showExtra">
          <ClientOnly>
            <ModeSwitcher class="rounded-none" />
          </ClientOnly>

          <UGithubLink v-slot="{ href }">
            <UButton
              as-child
              size="sm"
              variant="ghost"
              class="h-full rounded-none"
            >
              <a :href target="_blank" rel="noreferrer">
                <UIcon name="simple-icons:github" />
              </a>
            </UButton>
          </UGithubLink>
        </template>
      </div>
    </div>
  </div>
</template>
