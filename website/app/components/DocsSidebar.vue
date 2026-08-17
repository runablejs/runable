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

// const props = defineProps<{
//   tree: ContentNavigationItem
// }>()

const TOP_LEVEL_SECTIONS = [
  {
    name: "Why Syora",
    href: "/docs/why-syora",
  },
  {
    name: "Get started",
    href: "/docs/getting-started",
  },
  {
    name: "Guide",
    href: "/docs/guide",
  },
  {
    name: "Intégrations",
    href: "/docs/integrations",
  },
  {
    name: "Cookbook",
    href: "/docs/cookbook",
  },
  {
    name: "Skills",
    href: "/docs/skills",
  },
  {
    name: "MCP Server",
    href: "/docs/mcp",
  },
  {
    name: "API",
    href: "/docs/api",
  },

  {
    name: "Changelog",
    href: "/docs/changelog",
  },
];
const EXCLUDED_SECTIONS = ["installation", "dark mode"];
const EXCLUDED_PAGES = ["/docs/introduction", "/docs/changelog"];

const { path } = toRefs(useRoute());

const filteredSections = computed(() =>
  TOP_LEVEL_SECTIONS.filter(
    (section) => /**showMcpDocs || */ !section.href.includes("/mcp"),
  ),
);

function isActive(href: string) {
  return href === "/docs" ? path.value === href : path.value.startsWith(href);
}

const { nav } = useAppConfig();

interface Item {
  name: string;
  children?: Item[];
}

const items: Item[] = [
  {
    name: "Engineering",
    children: [
      {
        name: "Frontend",
        children: [
          {
            name: "Design System",
            children: [
              { name: "Components" },
              { name: "Tokens" },
              { name: "Guidelines" },
            ],
          },
          { name: "Web Platform" },
        ],
      },
      {
        name: "Backend",
        children: [{ name: "APIs" }, { name: "Infrastructure" }],
      },
      { name: "Platform Team" },
    ],
  },
  {
    name: "Marketing",
    children: [{ name: "Content" }, { name: "SEO" }],
  },
  {
    name: "Operations",
    children: [{ name: "HR" }, { name: "Finance" }],
  },
];
</script>

<template>
  <Sidebar
    class="sticky top-[calc(var(--header-height)+0.6rem)] z-30 hidden h-[calc(100svh-10rem)] overflow-hidden overscroll-none bg-transparent [--sidebar-menu-width:--spacing(56)] lg:flex"
    collapsible="none"
  >
    <SidebarContent
      class="w-(--sidebar-menu-width) scroll-fade scrollbar-none overflow-x-hidden pl-2.5"
    >
      <SidebarGroup class="pt-12">
        <!-- <SidebarGroupLabel class="font-medium text-muted-foreground">
          Sections
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem
              v-for="{ name, href } in filteredSections"
              :key="name"
            >
              <SidebarMenuButton
                as-child
                :is-active="isActive(href)"
                class="relative h-7.5 w-fit rounded-none overflow-visible border border-transparent text-[0.8rem] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md data-[active=true]:border-accent data-[active=true]:bg-accent 3xl:fixed:w-full 3xl:fixed:max-w-48"
              >
                <RouterLink :to="href">
                  <span
                    class="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent"
                  />
                  {{ name }}
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent> -->

        <DocsStructureTree />
      </SidebarGroup>

      <div
        class="from-background via-background/80 to-background/50 sticky -bottom-1 z-10 h-16 shrink-0 bg-linear-to-t blur-xs"
      />
    </SidebarContent>
  </Sidebar>
</template>
