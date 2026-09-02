<script setup lang="ts">
import { onMounted, ref } from "vue";

const headingRef = ref<HTMLElement | null>(null);
const groupsRef = ref<HTMLElement | null>(null);
const footerRef = ref<HTMLElement | null>(null);

const { reveal, revealChildren } = useScrollReveal({
  threshold: 0.08,
  rootMargin: "0px 0px -40px 0px",
  y: 16,
});

onMounted(() => {
  reveal(headingRef.value);
  revealChildren(groupsRef.value, "[data-capability-group]", 100);
  reveal(footerRef.value);
});

const groups = [
  {
    ref: "A",
    label: "Structure",
    title: "Conventions that stay out of your way",
    description:
      "Organize the application with familiar files and folders. Runable turns that structure into working code.",
    items: [
      {
        title: "File-system routing",
        description: "Pages become typed routes automatically.",
        icon: "tabler:route",
      },
      {
        title: "Auto-imports",
        description: "Use components and composables without import noise.",
        icon: "tabler:package-import",
      },
      {
        title: "Layouts",
        description: "Share navigation and structure across route groups.",
        icon: "tabler:layout-dashboard",
      },
      {
        title: "Route middleware",
        description: "Protect, redirect, or transform each navigation.",
        icon: "tabler:shield-check",
      },
      {
        title: "Page metadata",
        description: "Keep route behavior next to the page that owns it.",
        icon: "tabler:file-settings",
      },
    ],
  },
  {
    ref: "B",
    label: "Rendering",
    title: "Server output that becomes an interactive Vue app",
    description:
      "Load data once, render the initial response on the server, then continue seamlessly in the browser.",
    items: [
      {
        title: "Async data",
        description: "Fetch before rendering with cache-aware composables.",
        icon: "tabler:database",
      },
      {
        title: "Server-side rendering",
        description: "Return complete HTML from the first request.",
        icon: "tabler:server-cog",
      },
      {
        title: "Hydration",
        description: "Restore state and take over on the client cleanly.",
        icon: "tabler:droplet",
      },
      {
        title: "SEO and head",
        description: "Control titles, metadata, Open Graph, and schema.",
        icon: "tabler:world-search",
      },
      {
        title: "Rendering modes",
        description: "Choose SSR or client rendering for each need.",
        icon: "tabler:adjustments-horizontal",
      },
    ],
  },
  {
    ref: "C",
    label: "Extensibility",
    title: "A foundation that adapts to the project",
    description:
      "Extend the framework without giving up Vue, Vite, TypeScript, or the backend stack your team already uses.",
    items: [
      {
        title: "Modules",
        description: "Package and share reusable Runable features.",
        icon: "tabler:blocks",
      },
      {
        title: "Vue Plugin",
        description: "Connect behavior to the application lifecycle.",
        icon: "tabler:plug-connected",
      },
      {
        title: "Runtime adapters",
        description: "Attach Runable to the HTTP server you choose.",
        icon: "tabler:arrows-exchange",
      },
      {
        title: "Generated types",
        description: "Get TypeScript support from project conventions.",
        icon: "simple-icons:typescript",
      },
      {
        title: "Vue ecosystem",
        description: "Use Vue libraries and Composition API directly.",
        icon: "simple-icons:vuedotjs",
      },
    ],
  },
];

const capabilityCount = groups.reduce(
  (total, group) => total + group.items.length,
  0,
);
</script>

<template>
  <section
    aria-labelledby="capabilities-heading"
    class="relative overflow-hidden border-b border-border bg-background"
  >
    <div
      aria-hidden="true"
      class="absolute inset-x-0 top-0 h-[34rem] opacity-40 dark:opacity-20"
      style="
        background-image:
          linear-gradient(to right, var(--border) 1px, transparent 1px),
          linear-gradient(to bottom, var(--border) 1px, transparent 1px);
        background-size: 64px 64px;
        mask-image: linear-gradient(to bottom, black, transparent 90%);
      "
    />

    <div class="relative mx-auto max-w-7xl px-6 py-24 sm:px-10 md:py-36">
      <div
        ref="headingRef"
        class="sr-hidden grid gap-12 lg:grid-cols-3 lg:items-end"
        style="
          transition:
            opacity 300ms ease-out,
            transform 300ms ease-out;
        "
      >
        <div class="lg:col-span-2">
          <p
            class="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground"
          >
            03 — Capabilities
          </p>
          <h2
            id="capabilities-heading"
            class="mt-6 max-w-4xl font-display text-h2 text-neutral"
          >
            One framework layer.<br />
            <em class="font-display italic text-accent"
              >Everything connected.</em
            >
          </h2>
          <p
            class="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground"
          >
            Runable connects project structure, server rendering, and the Vue
            ecosystem into one coherent development model—without taking over
            your backend.
          </p>
        </div>
      </div>

      <div
        class="mt-16 border border-border bg-background/95 shadow-2xl shadow-foreground/3 md:mt-24"
      >
        <div
          class="flex min-h-12 items-center justify-between gap-4 border-b border-border px-4 sm:px-5"
        >
          <div class="flex items-center gap-2" aria-hidden="true">
            <span class="size-2 rounded-full bg-accent" />
            <span class="size-2 rounded-full bg-border" />
            <span class="size-2 rounded-full bg-border" />
          </div>
          <p
            class="truncate font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            Runable application layer
          </p>
          <div
            class="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:flex"
          >
            <span class="size-1.5 rounded-full bg-accent" />
            Runtime connected
          </div>
        </div>

        <div ref="groupsRef">
          <article
            v-for="group in groups"
            :key="group.ref"
            data-capability-group
            class="capability-group sr-hidden grid border-b border-border last:border-b-0"
            style="
              transition:
                opacity 250ms ease-out,
                transform 250ms ease-out;
            "
          >
            <header class="relative overflow-hidden p-6 sm:p-8 lg:p-9">
              <span
                aria-hidden="true"
                class="absolute -right-2 -top-7 font-display text-[9rem] font-bold leading-none text-muted/40 dark:text-muted/20"
                >{{ group.ref }}</span
              >

              <div class="relative flex h-full flex-col">
                <div class="flex items-center gap-3">
                  <span
                    class="flex size-7 items-center justify-center bg-accent font-mono text-xs font-bold text-accent-foreground"
                  >
                    {{ group.ref }}
                  </span>
                  <span
                    class="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    {{ group.label }}
                  </span>
                </div>
                <h3
                  class="mt-8 max-w-sm font-display text-2xl font-semibold leading-tight tracking-tight"
                >
                  {{ group.title }}
                </h3>
                <p
                  class="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground lg:mt-auto lg:pt-12"
                >
                  {{ group.description }}
                </p>
              </div>
            </header>

            <div
              class="grid border-t border-border sm:grid-cols-2 lg:grid-cols-5 lg:border-l lg:border-t-0"
            >
              <div
                v-for="(item, itemIndex) in group.items"
                :key="item.title"
                class="group/item relative flex min-h-48 flex-col border-b border-border p-5 transition-colors last:border-b-0 sm:odd:border-r lg:min-h-72 lg:border-b-0 lg:border-r lg:last:border-r-0 lg:odd:border-r"
              >
                <div class="flex items-start justify-between gap-3">
                  <span
                    class="flex size-10 items-center justify-center border border-border bg-background text-muted-foreground transition-colors"
                    :class="
                      itemIndex === 0 &&
                      'border-accent bg-accent text-accent-foreground'
                    "
                  >
                    <UIcon :name="item.icon" class="size-5" />
                  </span>
                  <span class="font-mono text-[10px] text-muted-foreground">
                    {{ group.ref }}.{{ String(itemIndex + 1).padStart(2, "0") }}
                  </span>
                </div>

                <div class="mt-auto pt-10">
                  <h4 class="font-display text-base font-semibold leading-snug">
                    {{ item.title }}
                  </h4>
                  <p class="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {{ item.description }}
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div
          ref="footerRef"
          class="sr-hidden flex flex-col gap-5 border-t border-border bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
          style="
            transition:
              opacity 300ms ease-out,
              transform 300ms ease-out;
          "
        >
          <p class="flex items-center gap-3 text-sm text-muted-foreground">
            <span class="hidden h-px w-10 bg-accent sm:block" />
            Productive Vue conventions above. Your runtime underneath.
          </p>
          <UButton variant="outline" size="lg" as-child class="rounded-none">
            <RunableLink to="/docs/api">
              Explore every API
              <UIcon name="tabler:arrow-right" class="size-4" />
            </RunableLink>
          </UButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@media (min-width: 64rem) {
  .capability-group {
    grid-template-columns: minmax(15rem, 1fr) 3fr;
  }
}
</style>
