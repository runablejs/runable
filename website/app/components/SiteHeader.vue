<script setup lang="ts">
import GithubLink from "./GithubLink.vue";
import ModeSwitcher from "./ModeSwitcher.vue";
import Logo from "./navbar-components/Logo.vue";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

// Navigation links array to be used in both desktop and mobile menus
const navigationLinks = [
  {
    label: "Why Syora ?",
    to: "/docs/why-syora",
    activeMatch: "^/(why-syora|vs-nuxt|concepts)",
  },
  {
    label: "Getting Started",
    to: "/docs/getting-started/installation",
    activeMatch: "^/getting-started/",
  },
  { label: "Guide", to: "/docs/guide/routing", activeMatch: "^/guide/" },
  {
    label: "Integrations",
    to: "/docs/integrations/",
    activeMatch: "^/integrations/",
  },
  {
    label: "Cookbook",
    to: "/docs/cookbook/authentication",
    activeMatch: "^/cookbook/",
  },
  { label: "API", to: "/docs/api/composables", activeMatch: "^/api/" },
];
</script>

<template>
  <header
    class="px-4 md:px-6 backdrop-blur-sm bg-red sticky top-0 z-50 h-(--header-height)"
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
      <NavigationMenu class="max-lg:hidden">
        <NavigationMenuList class="gap-2">
          <NavigationMenuItem
            v-for="(link, index) in navigationLinks"
            :key="index"
          >
            <RouterLink
              v-bind="link"
              class="py-1.5 whitespace-nowrap rounded-none"
            >
              {{ link.label }}
            </RouterLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <!-- Right side -->
      <div class="flex flex-1 items-center justify-end gap-">
        <div class="relative hidden">
          <Input
            class="peer h-8 ps-8 pe-2"
            placeholder="Search..."
            type="search"
          />
          <div
            class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-2 peer-disabled:opacity-50"
          >
            <!-- <LucideSearch :size="16" /> -->
          </div>
        </div>

        <ClientOnly>
          <ModeSwitcher class="rounded-none" />
        </ClientOnly>
        <GithubLink class="rounded-none" />
      </div>

      <!-- Mobile menu trigger -->
      <Popover>
        <PopoverTrigger as-child>
          <Button
            class="group size-8 lg:hidden rounded-none"
            variant="ghost"
            size="icon"
            c
          >
            <svg
              class="pointer-events-none"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 12L20 12"
                class="origin-center -translate-y-1.75 transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315"
              />
              <path
                d="M4 12H20"
                class="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
              />
              <path
                d="M4 12H20"
                class="origin-center translate-y-1.75 transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"
              />
            </svg>
          </Button>
        </PopoverTrigger>

        <PopoverContent align="start" class="w-36 p-1 lg:hidden">
          <NavigationMenu class="max-w-none *:w-full">
            <NavigationMenuList class="flex-col items-start gap-0 md:gap-2">
              <NavigationMenuItem
                v-for="(link, index) in navigationLinks"
                :key="index"
                class="w-full"
              >
                <NavigationMenuLink
                  v-bind="link"
                  class="flex-row items-center gap-2 py-1.5"
                >
                  <!-- <component
                    :is="link.icon"
                    :size="16"
                    class="text-muted-foreground/80"
                    aria-hidden="true"
                  /> -->
                  <span>{{ link.label }}</span>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </PopoverContent>
      </Popover>
    </div>
  </header>
</template>
