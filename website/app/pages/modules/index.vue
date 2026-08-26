<script setup lang="ts">
import type { ResolvedPageEntry } from "v-content";
import { Skeleton } from "~/components/ui/skeleton";

type ModuleFilter = "all" | "official" | "community";

const search = ref("");
const filter = ref<ModuleFilter>("all");

const { data: modules, pending } = await useAsyncData("modules:index", () =>
  queryCollection("modules").all(),
);

function packageName(module: ResolvedPageEntry) {
  return typeof module.meta.package === "string"
    ? module.meta.package
    : module.meta.title;
}

function isOfficial(module: ResolvedPageEntry) {
  return packageName(module)?.startsWith("@runablejs/") ?? false;
}

const filteredModules = computed(() => {
  const term = search.value.trim().toLocaleLowerCase();

  return (modules.value ?? []).filter((module) => {
    if (filter.value === "official" && !isOfficial(module)) return false;
    if (filter.value === "community" && isOfficial(module)) return false;
    if (!term) return true;

    const tags = Array.isArray(module.meta.tags)
      ? module.meta.tags.join(" ")
      : "";
    const content = [
      module.meta.title,
      module.meta.package,
      module.meta.description,
      module.meta.category,
      tags,
    ]
      .filter((value): value is string => typeof value === "string")
      .join(" ")
      .toLocaleLowerCase();

    return content.includes(term);
  });
});

const filters: { value: ModuleFilter; label: string }[] = [
  { value: "all", label: "All modules" },
  { value: "official", label: "Official" },
  { value: "community", label: "Community" },
];

useHead({
  title: "Modules",
  meta: [
    {
      name: "description",
      content:
        "Discover official and community modules that extend Runable applications.",
    },
  ],
});

useSeoMeta({
  ogTitle: "Runable Modules",
  ogDescription:
    "Discover official and community modules that extend Runable applications.",
});
</script>

<template>
  <div class="w-full overflow-hidden">
    <section class="border-b border-border px-6 py-16 sm:px-10 lg:py-24">
      <div class="mx-auto max-w-6xl">
        <div
          class="mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-accent"
        >
          <span class="h-px w-8 bg-accent" />
          Ecosystem
        </div>

        <div class="grid gap-8 lg:grid-cols-[1fr_0.65fr] lg:items-end">
          <div>
            <h1
              class="max-w-3xl font-display text-5xl font-bold leading-[1.04] tracking-tight sm:text-7xl"
            >
              Extend Runable with
              <em class="font-display italic text-accent">modules.</em>
            </h1>
            <p
              class="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground"
            >
              Find official integrations maintained by the Runable team and
              modules shared by the community.
            </p>
          </div>

          <div
            class="border-l-2 border-accent pl-6 text-sm text-muted-foreground"
          >
            Modules can register components, composables, plugins, middleware,
            styles, and configuration in one reusable package.
          </div>
        </div>
      </div>
    </section>

    <section class="px-6 py-12 sm:px-10 lg:py-16">
      <div class="mx-auto max-w-6xl">
        <div class="flex flex-col gap-4 pb-6 md:flex-row md:items-center">
          <label class="relative block min-w-0 flex-1">
            <span class="sr-only">Search modules</span>
            <UIcon
              name="tabler:search"
              class="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              v-model="search"
              type="search"
              placeholder="Search by name, package, category, or feature…"
              class="h-12 w-full rounded-md border border-border bg-background pl-12 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
            />
          </label>

          <div class="flex flex-wrap gap-2" aria-label="Filter modules">
            <button
              v-for="item in filters"
              :key="item.value"
              type="button"
              class="h-10 rounded-md border px-4 text-sm font-medium transition-colors"
              :class="
                filter === item.value
                  ? 'border-accent bg-accent text-accent-foreground'
                  : 'border-border text-muted-foreground hover:border-accent hover:text-foreground'
              "
              @click="filter = item.value"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <div
          class="mt-6 flex items-center justify-between font-mono text-xs uppercase tracking-wider text-muted-foreground"
        >
          <span>
            {{ filteredModules.length }} module{{
              filteredModules.length === 1 ? "" : "s"
            }}
          </span>
          <span v-if="search">Results for “{{ search }}”</span>
        </div>

        <div
          v-if="pending"
          class="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          aria-busy="true"
        >
          <article
            v-for="index in 6"
            :key="index"
            class="space-y-5 rounded-md border border-border p-6"
          >
            <div class="flex items-center justify-between">
              <Skeleton class="size-11 rounded-md" />
              <Skeleton class="h-5 w-16" />
            </div>
            <Skeleton class="h-5 w-3/4" />
            <div class="space-y-2">
              <Skeleton class="h-4 w-full" />
              <Skeleton class="h-4 w-5/6" />
              <Skeleton class="h-4 w-2/3" />
            </div>
          </article>
        </div>

        <div
          v-else-if="filteredModules.length"
          class="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          <RunableLink
            v-for="module in filteredModules"
            :key="module.path"
            :to="`/modules${module.path}`"
            class="group relative flex min-h-64 flex-col overflow-hidden rounded-md border border-border bg-background p-6 transition-colors dark:bg-muted/10"
          >
            <span
              class="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform group-hover:scale-x-100"
            />

            <div class="flex items-start justify-between gap-4">
              <span
                class="flex size-11 items-center justify-center rounded-md border border-border bg-muted/30"
              >
                <UIcon
                  :name="String(module.meta.icon ?? 'tabler:blocks')"
                  class="size-6 text-accent"
                />
              </span>

              <span
                v-if="isOfficial(module)"
                class="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-1.5 py-1 font-mono text-[10px] uppercase tracking-wider text-accent"
              >
                <UIcon name="tabler:rosette-discount-check" class="size-3.5" />
                Official
              </span>
              <span
                v-else
                class="rounded-full border border-border px-1.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                Community
              </span>
            </div>

            <div class="mt-7">
              <h2 class="mt-2 text-xl font-semibold">
                {{ module.meta.title }}
              </h2>
              <p
                class="my-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground"
              >
                {{ module.meta.description }}
              </p>
            </div>

            <div
              class="mt-auto flex items-center justify-between border-t border-border pt-5 text-sm"
            >
              <UBadge variant="outline">
                {{ module.meta.category ?? "Module" }}
              </UBadge>

              <span class="flex items-center gap-1 font-medium text-accent">
                View module
                <UIcon
                  name="tabler:arrow-right"
                  class="size-4 transition-transform group-hover:translate-x-1"
                />
              </span>
            </div>
          </RunableLink>
        </div>

        <div
          v-else
          class="mt-8 flex min-h-64 flex-col items-center justify-center rounded-md border border-dashed border-border px-6 text-center"
        >
          <UIcon
            name="tabler:search-off"
            class="size-8 text-muted-foreground"
          />
          <h2 class="mt-4 font-display text-xl font-semibold">
            No modules found
          </h2>
          <p class="mt-2 max-w-sm text-sm text-muted-foreground">
            Try another search or switch to a different module category.
          </p>
          <button
            type="button"
            class="mt-5 text-sm font-medium text-accent hover:underline"
            @click="
              search = '';
              filter = 'all';
            "
          >
            Clear filters
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
