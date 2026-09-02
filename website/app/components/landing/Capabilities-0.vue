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
    class="relative w-full border-b border-border bg-muted/20 dark:bg-muted/5"
  >
    <div class="mx-auto max-w-7xl px-10 py-32 md:py-40">
      <div
        ref="headingRef"
        class="sr-hidden max-w-5xl"
        style="
          transition:
            opacity 300ms ease-out,
            transform 300ms ease-out;
        "
      >
        <p class="mb-8 font-mono text-mono-sm tracking-[0.08em] text-tertiary">
          03 — Capabilities
        </p>
        <h2 id="capabilities-heading" class="font-display text-h2 text-neutral">
          Everything you expect from a Vue meta-framework.<br
            class="hidden md:block"
          />
          <em class="font-display italic text-accent"
            >None of the backend lock-in.</em
          >
        </h2>
        <p class="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Runable connects the repetitive pieces of a modern Vue application so
          you can focus on the product—and still control the server beneath it.
        </p>
      </div>

      <div ref="groupsRef" class="mt-20 space-y-16">
        <div
          v-for="(group, groupIndex) in groups"
          :key="group.ref"
          data-capability-group
          class="sr-hidden"
          style="
            transition:
              opacity 250ms ease-out,
              transform 250ms ease-out;
          "
        >
          <div
            class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <div class="mb-3 flex items-center gap-3">
                <span
                  class="rounded-sm bg-accent px-2 py-1 font-mono text-xs font-bold text-accent-foreground"
                >
                  {{ group.ref }}
                </span>
                <span
                  class="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground"
                >
                  {{ group.label }}
                </span>
              </div>
              <h3 class="font-display text-2xl font-semibold tracking-tight">
                {{ group.title }}
              </h3>
            </div>
            <p
              class="max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-right"
            >
              {{ group.description }}
            </p>
          </div>

          <div class="grid gap-3 lg:grid-cols-[1.05fr_1.95fr]">
            <article
              class="group/featured relative min-h-80 overflow-hidden rounded-md border border-border bg-background p-8 transition-all duration-fast ease-default hover:-translate-y-px hover:border-strong dark:bg-muted/20"
              :class="{ 'lg:order-2': groupIndex % 2 === 1 }"
            >
              <!-- <div
                aria-hidden="true"
                class="absolute inset-0 opacity-[0.045] dark:opacity-[0.08]"
                style="
                  background-image:
                    linear-gradient(
                      to right,
                      currentColor 1px,
                      transparent 1px
                    ),
                    linear-gradient(
                      to bottom,
                      currentColor 1px,
                      transparent 1px
                    );
                  background-size: 32px 32px;
                  mask-image: linear-gradient(
                    to bottom left,
                    black,
                    transparent 75%
                  );
                "
              /> -->
              <div
                aria-hidden="true"
                class="absolute -right-16 -top-16 size-48 rounded-full bg-accent/10 blur-3xl transition-transform duration-500 group-hover/featured:scale-125"
              />
              <span
                aria-hidden="true"
                class="absolute left-0 top-8 h-16 w-1 origin-top rounded-r-md bg-accent transition-transform group-hover/featured:scale-y-110"
              />

              <div class="relative flex h-full flex-col">
                <div class="flex items-start justify-between">
                  <div
                    class="flex size-12 items-center justify-center rounded-md bg-accent text-accent-foreground shadow-lg shadow-accent/20"
                  >
                    <UIcon :name="group.items[0]!.icon" class="size-6" />
                  </div>
                  <span
                    class="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground"
                  >
                    Featured / 0{{ groupIndex + 1 }}
                  </span>
                </div>

                <div class="mt-auto pt-16">
                  <h4
                    class="max-w-sm font-display text-2xl font-semibold leading-tight"
                  >
                    {{ group.items[0]!.title }}
                  </h4>
                  <p
                    class="mt-3 max-w-sm leading-relaxed text-muted-foreground"
                  >
                    {{ group.items[0]!.description }}
                  </p>
                  <div
                    class="mt-7 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                  >
                    <span class="size-1.5 rounded-full bg-accent" />
                    Built into Runable core
                  </div>
                </div>
              </div>
            </article>

            <div class="grid gap-3 sm:grid-cols-2">
              <article
                v-for="(item, itemIndex) in group.items.slice(1)"
                :key="item.title"
                class="group/item relative min-h-42 overflow-hidden rounded-md border border-border bg-background p-6 transition-all duration-fast ease-default hover:-translate-y-px hover:border-strong dark:bg-muted/20"
              >
                <span
                  aria-hidden="true"
                  class="absolute left-0 top-6 h-10 w-0.75 origin-top rounded-r-md bg-accent/60 transition-all group-hover/item:scale-y-110 group-hover/item:bg-accent"
                />
                <div class="flex items-start justify-between gap-4">
                  <div
                    class="flex size-10 items-center justify-center rounded-md bg-accent/10 text-accent transition-colors group-hover/item:bg-accent group-hover/item:text-accent-foreground"
                  >
                    <UIcon :name="item.icon" class="size-5" />
                  </div>
                  <span class="font-mono text-[10px] text-muted-foreground/70">
                    0{{ itemIndex + 2 }}
                  </span>
                </div>
                <h4
                  class="mt-7 font-display text-base font-semibold leading-snug"
                >
                  {{ item.title }}
                </h4>
                <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {{ item.description }}
                </p>
              </article>
            </div>
          </div>
        </div>
      </div>

      <div
        ref="footerRef"
        class="sr-hidden mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
        style="
          transition:
            opacity 300ms ease-out,
            transform 300ms ease-out;
        "
      >
        <p class="font-body text-caption text-muted-foreground">
          {{ capabilityCount }} capabilities. Zero backend lock-in. One
          developer experience.
        </p>
        <UButton variant="outline" size="lg" as-child>
          <RunableLink to="/docs/api">
            Explore every API
            <UIcon name="tabler:arrow-right" class="size-4" />
          </RunableLink>
        </UButton>
      </div>
    </div>
  </section>
</template>
