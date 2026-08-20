<script setup lang="ts">
import { cn } from "~/lib/utils.ts";
import GithubLink from "./GithubLink.vue";
import ModeSwitcher from "./ModeSwitcher.vue";
import Logo from "./navbar-components/Logo.vue";
import MobileNav from "./MobileNav.vue";

// Navigation links array to be used in both desktop and mobile menus
const navigationLinks = [
  {
    label: "Why Syora?",
    to: "/why-syora",
    icon: "tabler:sparkles",
  },
  {
    label: "Docs",
    to: "/docs",
    icon: "tabler:book-2",
  },
  {
    label: "Blog",
    to: "/blog",
    icon: "tabler:article",
  },
  {
    label: "About",
    to: "/about",
    icon: "tabler:info-circle",
  },
  {
    label: "Changelog",
    to: "/changelog",
    icon: "tabler:history",
  },
];

const router = useRouter();

const active = computed(() => {
  const path = router.currentRoute.value.path.replace(/\/+$/, "");

  return navigationLinks.find((item) => {
    return path === item.to || path.startsWith(`${item.to}/`);
  })?.to;
});
</script>

<template>
  <header
    class="px-4 md:px-6 backdrop-blur-sm bg-background sticky top-0 z-50 h-(--header-height) border-b"
  >
    <div class="flex h-full items-center justify-between gap-4">
      <!-- Left side -->
      <div class="flex flex-1 items-center gap-2 h-full">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2 h-full">
          <div
            class="flex items-center bg-accent text-accent-foreground h-full px-1 aspect-square"
          >
            <Logo class="size-7 h-9/12" />
          </div>
          <span class="font- text-lg">Syora</span>
        </RouterLink>
      </div>

      <!-- Middle area -->
      <nav
        class="h-full flex max-md:hidden items-center gap-2"
        :class="cn('items-center gap-0')"
      >
        <SyoraLink
          v-for="{ to, label, icon } in navigationLinks"
          :key="to"
          :class="{
            'text-accent': active === to,
            'border-b-transparent text-muted-foreground': active !== to,
          }"
          variant="ghost"
          :to="to"
          class="px-1.5 hover:bg-accent hover:text-accent-foreground h-full justify-center rounded-none font-medium text-sm flex items-center gap-2 whitespace-nowrap"
        >
          <UIcon :name="icon" class="size-4" />
          {{ label }}
        </SyoraLink>
      </nav>

      <!-- <NavigationMenu class="max-lg:hidden h-full hidden">
        <NavigationMenuList class="gap-2 h-full bg-amber-600 my-0">
          <NavigationMenuItem
            v-for="(link, index) in navigationLinks"
            :key="index"
            as-child
            class="h-full"
          >
            <RouterLink
              v-bind="link"
              class="h-full whitespace-nowrap rounded-none bg-red-400"
            >
              {{ link.label }}
            </RouterLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu> -->

      <!-- Right side -->
      <div class="flex flex-1 items-center justify-end gap-">
        <ClientOnly>
          <ModeSwitcher class="rounded-none" />
        </ClientOnly>

        <GithubLink class="rounded-none" />

        <MobileNav :nav="navigationLinks" />
      </div>
    </div>
  </header>
</template>
