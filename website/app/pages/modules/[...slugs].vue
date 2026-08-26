<script setup lang="ts">
import MDC from "v-content/components/MDC.js";
import { useClipboard } from "@vueuse/core";
import ModulePeople from "~/components/ModulePeople.vue";
import { Skeleton } from "~/components/ui/skeleton";
import { toArray } from "~/utils/to-array";

const route = useRoute();
const copied = ref(false);
const { copy } = useClipboard();

const slugs = computed(() => {
  const params = route.params as { slugs: string | string[] };
  return toArray(params.slugs)
    .flatMap((slug) => slug.split("/"))
    .filter(Boolean);
});

const path = computed(() => `/${slugs.value.join("/")}`);

const { data: module, pending } = await useAsyncData(
  `module:${path.value}`,
  () => queryCollection("modules").path(path.value).first(),
);

const packageName = computed(() => {
  const value = module.value?.meta.package;
  return typeof value === "string" ? value : module.value?.meta.title;
});

const isOfficial = computed(
  () => packageName.value?.startsWith("@runablejs/") ?? false,
);

const installCommand = computed(() => {
  const configuredCommand = module.value?.meta.install;
  return typeof configuredCommand === "string"
    ? configuredCommand
    : `pnpm add -D ${packageName.value}`;
});

const resourceLinks = computed(() => {
  if (!module.value) return [];

  return [
    {
      label: "Documentation",
      href: module.value.meta.documentation,
      icon: "tabler:book-2",
    },
    {
      label: "View on npm",
      href: module.value.meta.npm,
      icon: "simple-icons:npm",
    },
    {
      label: "Learn more",
      href: module.value.meta.learnMore,
      icon: "tabler:external-link",
    },
  ].filter(
    (resource): resource is { label: string; href: string; icon: string } =>
      typeof resource.href === "string" && resource.href.length > 0,
  );
});

async function copyInstallCommand() {
  await copy(installCommand.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2_000);
}

useHead(() => ({
  title: module.value?.meta.title,
  meta: [
    {
      name: "description",
      content: module.value?.meta.description,
    },
  ],
}));
</script>

<template>
  <div v-if="pending" class="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10">
    <Skeleton class="h-4 w-28" />
    <Skeleton class="mt-12 h-12 w-3/5" />
    <Skeleton class="mt-5 h-5 w-4/5" />
    <Skeleton class="mt-10 h-20 w-full" />
    <Skeleton class="mt-10 h-64 w-full" />
  </div>

  <div v-else-if="module" class="w-full overflow-hidden">
    <section class="border-b border-border px-6 py-14 sm:px-10 lg:py-20">
      <div class="mx-auto max-w-6xl">
        <RunableLink
          to="/modules"
          class="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
        >
          <UIcon name="tabler:arrow-left" class="size-4" />
          All modules
        </RunableLink>

        <div class="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-end">
          <div>
            <div class="flex flex-wrap items-center gap-3">
              <span
                class="flex size-12 items-center justify-center rounded-md border border-border bg-muted/30"
              >
                <UIcon
                  :name="String(module.meta.icon ?? 'tabler:blocks')"
                  class="size-7 text-accent"
                />
              </span>
            </div>

            <h1 class="mt-2 text-4xl font-bold tracking-tight sm:text-3xl">
              {{ module.meta.title }}
            </h1>
            <div v-if="isOfficial" class="mt-2">
              <span
                class="rounded border px-3 py-1 font-mono text-[10px] uppercase tracking-wider"
                :class="
                  isOfficial
                    ? 'border-accent/30 bg-accent/10 text-accent'
                    : 'border-border text-muted-foreground'
                "
              >
                {{ isOfficial ? "Official module" : "Community module" }}
              </span>
            </div>
            <p
              class="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground"
            >
              {{ module.meta.description }}
            </p>
          </div>

          <div class="rounded-md border border-border bg-muted/15 p-5">
            <p
              class="font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              Install with pnpm
            </p>
            <button
              type="button"
              class="mt-3 flex w-full items-center justify-between gap-4 rounded-md bg-code px-4 py-3 text-left font-mono text-sm text-foreground"
              @click="copyInstallCommand"
            >
              <span class="min-w-0 truncate">{{ installCommand }}</span>
              <UIcon
                :name="copied ? 'tabler:check' : 'tabler:copy'"
                class="size-4 shrink-0"
              />
            </button>

            <div
              v-if="module.meta.repository"
              class="mt-4 border-t border-border pt-4"
            >
              <a
                :href="String(module.meta.repository)"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-between text-sm text-muted-foreground transition-colors hover:text-accent"
              >
                Source code
                <UIcon name="tabler:arrow-up-right" class="size-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="px-6 py-14 sm:px-10 lg:py-20">
      <div
        class="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_14rem]"
      >
        <article class="v-content min-w-0 max-w-3xl space-y-3">
          <MDC :value="module.html" />
        </article>

        <aside class="order-first lg:order-last">
          <dl class="space-y-5 border-l border-border pl-5 text-sm">
            <div>
              <dt
                class="font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                Category
              </dt>
              <dd class="mt-1 font-medium">
                {{ module.meta.category ?? "Module" }}
              </dd>
            </div>
            <div v-if="module.meta.compatibility">
              <dt
                class="font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                Compatibility
              </dt>
              <dd class="mt-1 font-medium">{{ module.meta.compatibility }}</dd>
            </div>
            <div>
              <dt
                class="font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                Maintainer
              </dt>
              <dd class="mt-1 font-medium">
                {{ module.meta.maintainer ?? "Community" }}
              </dd>
            </div>
          </dl>

          <div class="mt-8 border-l border-border pl-5">
            <ModulePeople
              :author="module.meta.author"
              :contributors="module.meta.contributors"
            />
          </div>

          <div
            v-if="resourceLinks.length"
            class="mt-8 border-l border-border pl-5"
          >
            <p
              class="font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              Resources
            </p>

            <div class="mt-3 space-y-1">
              <a
                v-for="resource in resourceLinks"
                :key="resource.label"
                :href="resource.href"
                target="_blank"
                rel="noopener noreferrer"
                class="group flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-accent"
              >
                <UIcon :name="resource.icon" class="size-4 shrink-0" />
                <span>{{ resource.label }}</span>
                <UIcon
                  name="tabler:arrow-up-right"
                  class="ml-auto size-3.5 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </section>
  </div>

  <div
    v-else
    class="mx-auto flex min-h-[60svh] w-full max-w-3xl flex-col items-center justify-center px-6 text-center"
  >
    <p class="font-mono text-xs uppercase tracking-wider text-accent">
      404 · Module not found
    </p>
    <h1 class="mt-4 font-display text-4xl font-bold">
      This module is not in the registry.
    </h1>
    <RunableLink to="/modules" class="mt-7 text-accent hover:underline"
      >Browse all modules</RunableLink
    >
  </div>
</template>
