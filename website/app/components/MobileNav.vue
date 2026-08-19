<script setup lang="ts">
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "~/components/ui/drawer";
import Logo from "./navbar-components/Logo.vue";
import ModeSwitcher from "./ModeSwitcher.vue";
import GithubLink from "./GithubLink.vue";

const props = defineProps<{
  nav: { to: string; label: string; icon: string }[];
}>();

const router = useRouter();
const open = ref(false);

function handleNavigate(path: string) {
  router.push(path);
  open.value = false;
}
</script>

<template>
  <Drawer swipe-direction="up" v-model:open="open">
    <DrawerTrigger as-child>
      <UButton variant="ghost" size="icon" class="rounded-none md:hidden">
        <UIcon name="tabler:menu" class="size-5" />
      </UButton>
    </DrawerTrigger>

    <DrawerContent class="rounded-b-none! h-full mb-0! max-h-full!">
      <DrawerHeader class="p-0!">
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

            <div class="flex flex-1 items-center justify-end gap-">
              <ClientOnly>
                <ModeSwitcher class="rounded-none" />
              </ClientOnly>

              <GithubLink class="rounded-none" />

              <DrawerClose as-child>
                <UButton variant="ghost" size="icon" class="rounded-none">
                  <UIcon name="tabler:x" class="size-5" />
                </UButton>
              </DrawerClose>
            </div>
          </div>
        </header>
      </DrawerHeader>

      <div class="scrollbar-none overflow-y-auto px-4 py-6 flex flex-col gap-2">
        <DrawerClose as-child>
          <SyoraLink
            v-for="(item, index) in nav"
            :key="index"
            class="text- font-medium hover:bg-accent px-2 w-max flex items-center gap-3"
            :to="item.to"
            @click="handleNavigate(item.to)"
          >
            <UIcon :name="item.icon" class="size-4" />
            {{ item.label }}
          </SyoraLink>
        </DrawerClose>
      </div>
    </DrawerContent>
  </Drawer>
</template>
