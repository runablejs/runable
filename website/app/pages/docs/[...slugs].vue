<script setup lang="ts">
import MDC from "v-content/components/MDC.js";
import DocsToc from "~/components/DocsToc.vue";
import { Skeleton } from "~/components/ui/skeleton";
import { SITE_URL } from "~/lib/site-config.js";
import { toArray } from "~/utils/to-array";

const route = useRoute();
const { nav } = useAppConfig();

interface DocumentationNavItem {
  name: string;
  href: string;
  description?: string;
  icon?: string;
  children?: readonly DocumentationNavItem[];
}

function flattenNavigation(
  items: readonly DocumentationNavItem[],
): DocumentationNavItem[] {
  return items.flatMap((item) => [
    item,
    ...flattenNavigation(item.children ?? []),
  ]);
}

function normalizeDocumentationHref(href: string) {
  let decodedHref = href;

  try {
    decodedHref = decodeURIComponent(href);
  } catch {
    // Keep the original href when it contains malformed escape sequences.
  }

  return decodedHref.replace(/\.md$/, "").replace(/\/+$/, "") || "/docs";
}

const documentationPages = computed(() => {
  const pagesByHref = new Map<string, DocumentationNavItem>();

  for (const item of flattenNavigation(nav)) {
    const href = normalizeDocumentationHref(item.href);
    if (!href.startsWith("/docs/")) continue;

    // Some groups point to their first child. Keeping the last occurrence
    // preserves the page label while retaining its original position.
    pagesByHref.set(href, { ...item, href });
  }

  return [...pagesByHref.values()];
});

const currentNavigationIndex = computed(() => {
  const currentHref = normalizeDocumentationHref(route.path);
  return documentationPages.value.findIndex(
    (item: DocumentationNavItem) => item.href === currentHref,
  );
});

const previousPage = computed(() => {
  if (currentNavigationIndex.value <= 0) return;
  return documentationPages.value[currentNavigationIndex.value - 1];
});

const nextPage = computed(() => {
  const currentIndex = currentNavigationIndex.value;
  if (currentIndex < 0) return;
  return documentationPages.value[currentIndex + 1];
});

const slugs = computed(() => {
  const params = route.params as { slugs: string | string[] };
  const slugs = toArray(params.slugs);

  return slugs
    .map((slug) => slug.split("/"))
    .flat()
    .filter(Boolean);
});

const path = computed(() => {
  return `/${slugs.value.join("/")}`
    .replace(/\.md$/, "")
    .replace(/\/$/, "")
    .replace(/\/index$/, "");
});

const documentationIndexSections = new Set([
  "api",
  "guide",
  "integrations",
  "mcp",
  "structure",
]);

const documentationSourcePath = computed(() => {
  const relativePath = path.value.replace(/^\//, "");
  const isSectionIndex =
    slugs.value.length === 1 && documentationIndexSections.has(relativePath);

  return `website/content/docs/en/${relativePath}${isSectionIndex ? "/index" : ""}.md`;
});

const editOnGitHubUrl = computed(() => {
  return `https://github.com/runablejs/runable/edit/dev/${documentationSourcePath.value}`;
});

function queryPage() {
  switch (slugs.value[0]) {
    case "getting-started":
      return queryCollection("gettingStarted").path(path.value).first();
    case "structure":
      return queryCollection("structure").path(path.value).first();
    case "guide":
      return queryCollection("guide").path(path.value).first();
    case "mcp":
      return queryCollection("mcp").path(path.value).first();
    case "integrations":
      return queryCollection("integrations").path(path.value).first();
    case "api":
      return queryCollection("api").path(path.value).first();
    default:
      return Promise.resolve(undefined);
  }
}

const { data: page, status } = await useAsyncData(
  `docs:${path.value}`,
  queryPage,
);

const reportIssueUrl = computed(() => {
  const title = encodeURIComponent(
    `[Docs] ${page.value?.meta.title ?? path.value}`,
  );
  const body = encodeURIComponent(
    `Documentation page: ${SITE_URL}/docs${path.value}\n\nDescribe the issue you found:`,
  );

  return `https://github.com/runablejs/runable/issues/new?title=${title}&body=${body}`;
});

useHead({
  title: page.value?.meta.title,
  meta: [{ name: "description", content: page.value?.meta.description }],
  link: page.value
    ? [
        {
          rel: "alternate",
          type: "text/markdown",
          href: `${SITE_URL}/docs/${path.value}`,
        },
      ]
    : [],
});

useSeoMeta({
  ogTitle: page.value?.meta.title,
  ogDescription: page.value?.meta.description,
});
</script>

<template>
  <div
    v-if="status === 'pending'"
    data-slot="docs-skeleton"
    class="flex w-full min-w-0 max-w-full scroll-mt-24 items-stretch overflow-x-clip pb-8"
    aria-busy="true"
    aria-live="polite"
  >
    <span class="sr-only">Loading documentation</span>

    <div class="flex min-w-0 flex-1 flex-col">
      <div class="h-(--top-spacing) shrink-0" />

      <div
        class="mx-auto flex w-full max-w-3xl min-w-0 flex-1 flex-col gap-6 overflow-hidden px-4 py-6 lg:py-8"
      >
        <div class="flex flex-col gap-3">
          <Skeleton class="h-9 w-3/5 sm:w-2/5" />
          <Skeleton class="h-5 w-4/5" />
        </div>

        <div class="space-y-8 pt-4">
          <div class="space-y-3">
            <Skeleton class="h-7 w-2/5" />
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-11/12" />
            <Skeleton class="h-4 w-4/5" />
          </div>

          <Skeleton class="h-36 w-full" />

          <div class="space-y-3">
            <Skeleton class="h-7 w-1/3" />
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-5/6" />
            <Skeleton class="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>

    <aside
      class="sticky top-[calc(var(--header-height)+1px)] ml-auto hidden h-[calc(100svh-var(--header-height)-var(--footer-height))] w-72 flex-col gap-4 overflow-hidden pb-8 xl:flex"
      aria-hidden="true"
    >
      <div class="h-(--top-spacing) shrink-0" />
      <div class="space-y-4 px-6">
        <Skeleton class="h-5 w-28" />
        <Skeleton class="h-3 w-36" />
        <Skeleton class="h-3 w-44" />
        <Skeleton class="h-3 w-32" />
        <Skeleton class="h-3 w-40" />
      </div>
    </aside>
  </div>

  <div
    v-else-if="page"
    data-slot="docs"
    class="flex w-full min-w-0 max-w-full scroll-mt-24 items-stretch overflow-x-clip pb-8 text-[1.05rem] sm:text-[15px]"
  >
    <div class="flex min-w-0 flex-1 flex-col">
      <div class="h-(--top-spacing) shrink-0" />

      <div
        class="mx-auto flex w-full max-w-3xl min-w-0 flex-1 flex-col gap-6 overflow-hidden px-4 py-6 text-foreground lg:py-8 dark:text-foreground"
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

        <div class="v-content min-w-0 max-w-full space-y-3">
          <MDC :value="page.html" />
        </div>

        <div
          class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
        >
          <a
            :href="reportIssueUrl"
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center gap-2 transition-colors hover:text-accent"
          >
            <UIcon name="tabler:bug" class="size-5" aria-hidden="true" />
            Report an issue
          </a>

          <a
            :href="editOnGitHubUrl"
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center gap-2 transition-colors hover:text-accent"
          >
            <UIcon name="tabler:pencil" class="size-5" aria-hidden="true" />
            Edit this page
          </a>
        </div>

        <nav
          v-if="previousPage || nextPage"
          aria-label="Documentation pagination"
          class="mt-8 grid grid-cols-1 gap-3 pt-6 sm:grid-cols-2"
        >
          <RunableLink
            v-if="previousPage"
            :to="previousPage.href"
            class="group flex min-w-0 flex-col gap-1 rounded-md border border-border bg-muted/10 p-4 transition-colors hover:bg-muted/30"
            :aria-label="`Previous page: ${previousPage.name}`"
          >
            <span
              class="flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wide text-muted-foreground aspect-square rounded-full border size-8 transition-transform group-hover:-translate-x-0.5 mb-3"
            >
              <UIcon
                name="tabler:arrow-left"
                class="size-4"
                aria-hidden="true"
              />
            </span>

            <span class="truncate font-medium text-foreground">
              {{ previousPage.name }}
            </span>

            <p
              v-if="previousPage.description"
              class="line-clamp-3 font-medium text-muted-foreground"
            >
              {{ previousPage.description }}
            </p>
          </RunableLink>

          <RunableLink
            v-if="nextPage"
            :to="nextPage.href"
            class="group flex min-w-0 flex-col items-end text-right gap-1 rounded-md border border-border bg-muted/10 p-4 transition-colors hover:bg-muted/30"
            :aria-label="`Next page: ${nextPage.name}`"
          >
            <span
              class="flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wide text-muted-foreground aspect-square rounded-full border size-8 transition-transform group-hover:translate-x-0.5 mb-3"
            >
              <UIcon
                name="tabler:arrow-right"
                class="size-4"
                aria-hidden="true"
              />
            </span>

            <span class="truncate font-medium text-foreground">
              {{ nextPage.name }}
            </span>

            <p
              v-if="nextPage.description"
              class="line-clamp-3 font-medium text-muted-foreground"
            >
              {{ nextPage.description }}
            </p>
          </RunableLink>
        </nav>
        <!-- <MDC
          :value="page.html"
          class="w-full flex-1 *:data-[slot=alert]:first:mt-0"
        /> -->
      </div>
    </div>

    <div
      class="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden w-72 h-[calc(100svh-var(--header-height)-var(--footer-height))] flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex"
    >
      <div class="h-(--top-spacing) shrink-0" />
      <div class="no-scrollbar overflow-y-auto px-6">
        <DocsToc v-if="page.toc" :page />
        <div class="h-12" />
      </div>
      <div class="flex flex-1 flex-col gap-12 px-6">
        <!-- <CarbonAds /> -->
      </div>
    </div>
  </div>
</template>
