<script setup lang="ts">
import { cn } from "~/lib/utils.ts";
import ModeSwitcher from "./ModeSwitcher.vue";
import Logo from "./navbar-components/Logo.vue";
import MobileNav from "./MobileNav.vue";
import runablePackage from "../../../packages/runable/package.json";

const runableVersion = runablePackage.version;

// Navigation links array to be used in both desktop and mobile menus
const navigationLinks = [
  {
    label: "Why Runable?",
    to: "/why-runable",
    icon: "tabler:sparkles",
  },
  {
    label: "Docs",
    to: "/docs",
    icon: "tabler:book-2",
  },
  {
    label: "Modules",
    to: "/modules",
    icon: "tabler:blocks",
  },
  {
    label: "Work with AI",
    to: "/work-with-ai",
    icon: "tabler:robot",
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
        <!-- <RouterLink
          to="/"
          class="flex items-center gap-2 h-full hover:bg-accent hover:text-accent-foreground pr-3"
        >
          <div
            class="flex items-center bg-accent text-accent-foreground h-full px-1 aspect-square"
          >
            <Logo class="size-7 h-9/12" />
          </div>
          <span class="font-bold text-lg">Runable</span>
        </RouterLink> -->

        <RouterLink
          to="/"
          class="group flex items-center gap-2 h-full hover:bg-accent hover:text-accent-foreground pr-3"
        >
          <Logo class="size-7 h-9/12" />
          <span class="font-bold text-lg">Runable</span>
          <span
            class="font-mono text-[10px] leading-none text-muted-foreground group-hover:text-accent-foreground/70"
          >
            v{{ runableVersion }}
          </span>
        </RouterLink>
      </div>

      <!-- Middle area -->
      <nav
        class="h-full flex max-md:hidden items-center gap-2"
        :class="cn('items-center gap-0')"
      >
        <RunableLink
          v-for="{ to, label, icon } in navigationLinks"
          :key="to"
          :class="{
            'text-accent': active === to,
            'border-b-transparent text-muted-foreground': active !== to,
          }"
          variant="ghost"
          :to="to"
          class="px-2 hover:bg-accent hover:text-accent-foreground h-full justify-center rounded-none font-medium text-sm flex items-center gap-2 whitespace-nowrap"
        >
          <UIcon :name="icon" class="size-4" />
          {{ label }}
        </RunableLink>
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
      <div class="flex flex-1 items-center justify-end gap- h-full">
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

        <MobileNav :nav="navigationLinks" />
      </div>
    </div>
  </header>
</template>
