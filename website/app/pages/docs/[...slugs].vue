<script setup lang="ts">
import { Tree, TreeItem, TreeItemLabel } from "~/components/ui/tree";
// import { LucideFile, LucideFolder, LucideFolderOpen } from "lucide-vue-next";
import MDC from "v-content/components/MDC.js";
import SidebarProvider from "~/components/ui/sidebar/SidebarProvider.vue";
import DocsSidebar from "~/components/DocsSidebar.vue";
import DocsHeader from "~/components/DocsHeader.vue";

const { data: page } = useAsyncData("sdfsf", () => {
  return queryCollection("docs")
    .path("/getting-started/directory-structure")
    .first();
  // $fetch("https://jsonplaceholder.typicode.com/todos/1"),
});

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
  <div class="container-wrapper flex flex-1 flex-col">
    <DocsHeader />
    <SidebarProvider
      v-if="page"
      class="min-h-min flex-1 items-start px-0 [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:[--top-spacing:calc(var(--spacing)*4)] 3xl:fixed:container 3xl:fixed:px-3"
      :style="{ '--sidebar-width': 'calc(var(--spacing) * 72)' }"
    >
      <DocsSidebar />
      <!-- :tree="docData" -->
      <div class="h-full w-full">
        <div
          data-slot="docs"
          class="flex scroll-mt-24 items-stretch pb-8 text-[1.05rem] sm:text-[15px] xl:w-full"
        >
          <div class="flex min-w-0 flex-1 flex-col">
            <div class="h-(--top-spacing) shrink-0" />

            <div
              class="mx-auto flex w-full max-w-3xl min-w-0 flex-1 flex-col gap-6 px-4 py-6 text-foreground md:px-0 lg:py-8 dark:text-foreground"
            >
              <div class="flex flex-col gap-2">
                <div class="flex flex-col gap-2">
                  <div class="flex items-center justify-between md:items-start">
                    <h1
                      class="scroll-m-24 text-3xl font-semibold tracking-tight sm:text-3xl"
                    >
                      {{ page.meta.title }}
                    </h1>
                    <div class="docs-nav flex items-center gap-2">
                      <div class="hidden sm:block">
                        <!-- <DocsCopyPage :page="page" /> -->
                      </div>
                      <!-- <Button
                  v-if="neighbours?.[0]"
                  variant="secondary"
                  size="icon"
                  class="extend-touch-target ml-auto size-8 shadow-none md:size-7"
                  as-child
                >
                  <NuxtLink :to="neighbours[0].path">
                    <IconArrowLeft />
                    <span class="sr-only">Previous</span>
                  </NuxtLink>
                </Button>
                <Button
                  v-if="neighbours?.[1]"
                  variant="secondary"
                  size="icon"
                  class="extend-touch-target size-8 shadow-none md:size-7"
                  as-child
                >
                  <NuxtLink :to="neighbours[1].path">
                    <span class="sr-only">Next</span>
                    <IconArrowRight />
                  </NuxtLink>
                </Button> -->
                    </div>
                  </div>
                  <p
                    v-if="page.meta.description"
                    class="text-[1.05rem] text-muted-foreground sm:text-base sm:text-balance md:max-w-[80%]"
                  >
                    {{ page.meta.description }}
                  </p>
                </div>
                <!-- <div v-if="page.links" class="flex items-center space-x-2 pt-4">
            <Badge v-if="page.links.doc" as-child variant="secondary">
              <NuxtLink :to="page.links.doc" target="_blank" rel="noreferrer">
                Docs <IconArrowUpRight />
              </NuxtLink>
            </Badge>
            <Badge v-if="page.links.api" as-child variant="secondary">
              <NuxtLink :to="page.links.api" target="_blank" rel="noreferrer">
                API Reference <IconArrowUpRight />
              </NuxtLink>
            </Badge>
          </div> -->
              </div>

              <MDC
                :value="page.html"
                class="w-full flex-1 *:data-[slot=alert]:first:mt-0"
              />
            </div>
          </div>

          <div
            class="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[calc(100svh-var(--header-height)-var(--footer-height))] w-72 flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex"
          >
            <div class="h-(--top-spacing) shrink-0" />
            <div v-if="page.toc" class="no-scrollbar overflow-y-auto px-8">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Cum,
              atque fuga voluptatibus corporis molestiae in, alias delectus
              repellat dolores dignissimos obcaecati id officiis illo eum animi?
              Nobis nihil minima aliquam.
              <!-- <DocsTableOfContents :toc="page.body.toc" /> -->
              <div class="h-12" />
            </div>
            <div class="flex flex-1 flex-col gap-12 px-6">
              <!-- <CarbonAds /> -->
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  </div>
  <div class="hidden">
    <div class="flex h-full flex-col gap-2 *:first:grow">
      <div>
        <Tree
          :items="items"
          :getKey="(item) => item.name"
          v-slot="{ flattenItems }"
          :defaultExpanded="['Engineering', 'Frontend', 'Design System']"
          class="relative before:absolute before:inset-0 before:-ms-1 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]"
        >
          <TreeItem
            v-for="item in flattenItems"
            v-bind="item"
            v-slot="{ isExpanded }"
          >
            <TreeItemLabel
              :hasChildren="item.hasChildren"
              class="before:bg-background relative before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10"
            >
              <span class="flex items-center gap-2">
                <template v-if="item.hasChildren">
                  <UIcon
                    v-if="isExpanded"
                    name="tabler:folder-open"
                    class="text-muted-foreground pointer-events-none size-4"
                  />
                  <UIcon
                    v-else
                    name="tabler:folder"
                    class="text-muted-foreground pointer-events-none size-4"
                  />
                </template>
                <UIcon
                  v-else
                  name="tabler:file"
                  class="text-muted-foreground pointer-events-none size-4"
                />
                {{ item.value.name }}
              </span>
            </TreeItemLabel>
          </TreeItem>
        </Tree>
      </div>
    </div>

    <div class="mx-auto py-16 max-w-4xl w-11/12">
      <div class="v-content space-y-3"></div>
    </div>
  </div>
</template>
