<script setup lang="ts">
import DocsStructureTree from "./DocsStructureTree.vue";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

const props = defineProps<{ blockCode: string }>();

const { nav } = useAppConfig();
const router = useRouter();

const isStructure = computed(() => {
  return props.blockCode === "structure";
});

const trees = computed(() => {
  return nav.find((block) => block.code === props.blockCode)?.children ?? [];
});

function isActive(href: string) {
  const path = router.currentRoute.value.path.replace(/\/+$/, "");

  return path === href || path.startsWith(`${href}/`);
}
</script>

<template>
  <Sidebar
    variant="sidebar"
    class="bg-background overflow-hidden overscroll-none border-r-0! --- sticky top-(--header-height) h-[calc(100svh-var(--header-height))]!"
  >
    <!-- class="sticky top-[calc(var(--header-height)+0.6rem)] z-30 hidden h-[calc(100svh-10rem)] overflow-hidden overscroll-none bg-transparent [--sidebar-menu-width:--spacing(56)] lg:flex" -->
    <!-- collapsible="none"
    variant="floating" -->

    <SidebarContent
      class="w-(--sidebar-menu-width) scroll-fade scrollbar-none overflow-x-hidden pl-2.5 pt-12 bg-background"
    >
      <SidebarGroup class="md:hidden">
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                v-for="{ name, href, icon } in nav"
                :key="name"
                :is-active="isActive(href)"
                as-child
                class="relative h-6 px-1 w-fit rounded-none overflow-visible border border-transparent text-[1rem] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md data-[active=true]:border-accent data-[active=true]:bg-accent 3xl:fixed:w-full 3xl:fixed:max-w-48"
              >
                <!-- :is-active="isActive(item.href)" -->
                <RunableLink :to="href">
                  <span
                    class="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent"
                  />
                  <UIcon :name="icon" />
                  {{ name }}
                </RunableLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup v-if="isStructure">
        <SidebarGroupContent>
          <SidebarMenu>
            <DocsStructureTree />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <template v-else>
        <template v-for="tree in trees" :key="tree.code">
          <SidebarGroup v-if="tree.children?.length">
            <SidebarGroupLabel class="font-medium text-muted-foreground px-2">
              {{ tree.name }}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem v-for="(item, i) in tree.children" :key="i">
                  <SidebarMenuButton
                    :is-active="isActive(item.href)"
                    as-child
                    class="relative h-6 px-2 w-fit rounded-none overflow-visible border border-transparent text-[0.8rem] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md hover:bg-border hover:text-foreground data-[active=true]:border-l-accent data-[active=true]:text-accent data-[active=true]:bg-accent/5 3xl:fixed:w-full 3xl:fixed:max-w-48"
                  >
                    <!-- :is-active="isActive(item.href)" -->
                    <RunableLink :to="item.href">
                      <span
                        class="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent"
                      />
                      <UIcon :name="item.icon" />
                      {{ item.name }}
                    </RunableLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarMenu v-else>
            <SidebarMenuItem>
              <SidebarMenuButton
                :is-active="isActive(tree.href)"
                as-child
                class="relative h-6 px-2 w-fit rounded-none overflow-visible border border-transparent text-[0.8rem] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md hover:bg-border hover:text-foreground data-[active=true]:border-l-accent data-[active=true]:text-accent data-[active=true]:bg-accent/5 3xl:fixed:w-full 3xl:fixed:max-w-48"
              >
                <!-- :is-active="isActive(item.href)" -->
                <RunableLink :to="tree.href">
                  <span
                    class="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent"
                  />
                  <UIcon :name="tree.icon" />
                  {{ tree.name }}
                </RunableLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </template>
      </template>

      <div
        class="from-background via-background/80 to-background/50 sticky -bottom-1 z-10 h-16 shrink-0 bg-linear-to-t blur-xs"
      />
    </SidebarContent>
  </Sidebar>
</template>
