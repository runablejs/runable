<script setup lang="ts">
const releases = [
  {
    version: "1.0.0-alpha.3",
    date: "August 19, 2026",
    title: "A more reliable foundation",
    description:
      "This release focuses on predictable builds, safer extension APIs, and cleaner generated types across minimal and advanced applications.",
    current: true,
    groups: [
      {
        type: "Fixed",
        tone: "success",
        items: [
          "Fixed tsconfig.app.json generation and project type resolution.",
          "Fixed production build mode selection for minimal applications.",
          "Removed duplicate auto-imports generated during prepare.",
          "Fixed empty middleware declarations and runtime collection inference.",
        ],
      },
      {
        type: "Improved",
        tone: "accent",
        items: [
          "Plugin dependencies are now validated across enforce groups.",
          "Asynchronous plugin setup functions are awaited before startup continues.",
          "Circular module dependencies now produce an explicit configuration error.",
          "Compiled modules preserve the types of their configuration options.",
        ],
      },
    ],
  },
  {
    version: "Development update",
    date: "August 18, 2026",
    title: "Core APIs and documentation expanded",
    description:
      "The framework surface and its documentation grew together, making the first application easier to understand and configure.",
    current: false,
    groups: [
      {
        type: "Added",
        tone: "accent",
        items: [
          "Expanded documentation for project structure and configuration.",
          "Added reusable documentation components and code presentation tools.",
          "Documented installation, quick start, and server integrations in English and French.",
        ],
      },
      {
        type: "Improved",
        tone: "neutral",
        items: [
          "Improved application error handling and content rendering.",
          "Refined auto-import resolution and declaration generation.",
        ],
      },
    ],
  },
  {
    version: "Project milestone",
    date: "August 13, 2026",
    title: "The Runable CLI takes shape",
    description:
      "The command-line workflow gained the foundations needed to create projects and grow them without editing framework internals.",
    current: false,
    groups: [
      {
        type: "Added",
        tone: "accent",
        items: [
          "Added commands for creating and managing Runable projects.",
          "Added workflows for modules and starter templates.",
          "Added changesets and the initial package publication workflow.",
          "Published the initial README and project license configuration.",
        ],
      },
    ],
  },
];

function toneClass(tone: string) {
  if (tone === "success")
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  if (tone === "accent") return "bg-accent/10 text-accent";
  return "bg-muted text-muted-foreground";
}

useHead({
  title: "Changelog",
  meta: [
    {
      name: "description",
      content:
        "New features, improvements, fixes, and the decisions shaping the framework.",
    },
  ],
});
</script>

<template>
  <div class="overflow-hidden">
    <section
      class="relative border-b border-border px-6 py-20 sm:px-10 lg:py-28"
    >
      <div
        aria-hidden="true"
        class="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
        style="
          background-image:
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: linear-gradient(to bottom, black, transparent 90%);
        "
      />

      <div
        class="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end"
      >
        <div>
          <div
            class="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-accent"
          >
            <span class="h-px w-8 bg-accent" />
            Changelog
          </div>
          <h1
            class="max-w-4xl font-display text-5xl font-bold leading-[1.04] tracking-tight sm:text-7xl"
          >
            What changed in
            <em class="font-display italic text-accent">Runable.</em>
          </h1>
          <p
            class="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground"
          >
            New features, improvements, fixes, and the decisions shaping the
            framework.
          </p>
        </div>

        <div
          class="rounded-md border border-border bg-background p-6 shadow-sm dark:bg-muted/20"
        >
          <div class="flex items-start justify-between gap-5">
            <div>
              <p
                class="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
              >
                Current release
              </p>
              <p class="mt-2 font-display text-2xl font-semibold">
                v1.0.0-alpha.3
              </p>
            </div>
            <span class="relative mt-1 flex size-2">
              <span
                class="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60"
              />
              <span
                class="relative inline-flex size-2 rounded-full bg-accent"
              />
            </span>
          </div>
          <div
            class="mt-6 flex items-center justify-between border-t border-border pt-5"
          >
            <span class="font-mono text-xs text-muted-foreground"
              >Alpha channel</span
            >
            <a
              href="https://github.com/runablejs/runable/releases"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-sm transition-colors hover:text-accent"
            >
              GitHub releases
              <UIcon name="tabler:arrow-up-right" class="size-4" />
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="px-6 py-20 sm:px-10 lg:py-28">
      <div class="mx-auto max-w-6xl">
        <div
          v-for="(release, releaseIndex) in releases"
          :key="`${release.version}-${release.date}`"
          class="relative grid gap-8 pb-20 last:pb-0 md:grid-cols-[180px_1fr] md:gap-14"
        >
          <div class="relative">
            <div class="md:sticky md:top-24">
              <p class="font-mono text-xs text-muted-foreground">
                {{ release.date }}
              </p>
              <p class="mt-2 font-mono text-sm font-semibold text-foreground">
                {{ release.version }}
              </p>
              <span
                v-if="release.current"
                class="mt-3 inline-flex rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-accent-foreground"
              >
                Latest
              </span>
            </div>

            <div
              v-if="releaseIndex < releases.length - 1"
              aria-hidden="true"
              class="absolute bottom-0 left-1 top-24 hidden border-l border-dashed border-border md:block"
            />
          </div>

          <article
            class="overflow-hidden rounded-md border border-border bg-background dark:bg-muted/10"
          >
            <header class="border-b border-border p-7 sm:p-9">
              <h2 class="font-display text-3xl font-semibold tracking-tight">
                {{ release.title }}
              </h2>
              <p class="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
                {{ release.description }}
              </p>
            </header>

            <div class="divide-y divide-border">
              <section
                v-for="group in release.groups"
                :key="group.type"
                class="grid gap-5 p-7 sm:grid-cols-[110px_1fr] sm:p-9"
              >
                <div>
                  <span
                    class="inline-flex rounded-sm px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest"
                    :class="toneClass(group.tone)"
                  >
                    {{ group.type }}
                  </span>
                </div>
                <ul class="space-y-4">
                  <li
                    v-for="item in group.items"
                    :key="item"
                    class="flex gap-3 leading-relaxed text-muted-foreground"
                  >
                    <UIcon
                      name="tabler:arrow-right"
                      class="mt-1.5 size-3.5 shrink-0 text-accent"
                    />
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </section>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="border-t border-border bg-muted/20 px-6 py-20 sm:px-10">
      <div
        class="mx-auto flex max-w-6xl flex-col gap-7 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p
            class="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground"
          >
            Follow the work
          </p>
          <h2 class="mt-3 font-display text-2xl font-semibold sm:text-3xl">
            See what is being built next.
          </h2>
        </div>
        <UButton variant="outline" size="lg" as-child>
          <a
            href="https://github.com/runablejs/runable"
            target="_blank"
            rel="noopener noreferrer"
          >
            <UIcon name="simple-icons:github" class="size-4" />
            View the repository
          </a>
        </UButton>
      </div>
    </section>
  </div>
</template>
