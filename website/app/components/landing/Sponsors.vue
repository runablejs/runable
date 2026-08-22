<script setup lang="ts">
import { onMounted, ref } from "vue";

const headingRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);

const { reveal, revealChildren } = useScrollReveal({
  threshold: 0.1,
  rootMargin: "0px 0px -40px 0px",
  y: 16,
});

onMounted(() => {
  reveal(headingRef.value);
  revealChildren(contentRef.value, "[data-reveal]", 80);
});

const investments = [
  {
    title: "Core development",
    description: "More time for framework APIs, stability, and performance.",
    icon: "tabler:code",
  },
  {
    title: "Documentation",
    description:
      "Clear guides, examples, and migration paths for every runtime.",
    icon: "tabler:book-2",
  },
  {
    title: "Ecosystem",
    description:
      "Official modules, adapters, integrations, and developer tools.",
    icon: "tabler:circles-relation",
  },
];
</script>

<template>
  <section
    aria-labelledby="sponsors-heading"
    class="relative overflow-hidden border-y border-border"
  >
    <div
      aria-hidden="true"
      class="absolute inset-0 opacity-[0.035] dark:opacity-[0.07]"
      style="
        background-image:
          linear-gradient(to right, currentColor 1px, transparent 1px),
          linear-gradient(to bottom, currentColor 1px, transparent 1px);
        background-size: 48px 48px;
        mask-image: linear-gradient(
          to right,
          transparent,
          black 30%,
          black 70%,
          transparent
        );
      "
    />

    <div class="relative mx-auto max-w-7xl px-10 py-32 md:py-40">
      <div
        ref="headingRef"
        class="sr-hidden grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20"
        style="
          transition:
            opacity 300ms ease-out,
            transform 300ms ease-out;
        "
      >
        <div>
          <p class="font-mono text-mono-sm tracking-[0.08em] text-tertiary">
            05 — Sponsors
          </p>
        </div>
        <div>
          <h2
            id="sponsors-heading"
            class="max-w-4xl font-display text-h2 text-neutral"
          >
            Help build an independent
            <em class="font-display italic text-accent">Vue ecosystem.</em>
          </h2>
          <p
            class="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground"
          >
            Sponsorship gives Runable the time and resources to improve the
            core, maintain integrations, and produce documentation developers
            can rely on.
          </p>
        </div>
      </div>

      <div ref="contentRef" class="mt-20 grid gap-3 lg:grid-cols-[1.3fr_0.7fr]">
        <div
          data-reveal
          class="sr-hidden relative overflow-hidden rounded-md border border-border bg-background p-8 sm:p-10"
        >
          <div
            aria-hidden="true"
            class="absolute -right-24 -top-24 size-72 rounded-full bg-accent/10 blur-3xl"
          />
          <div class="relative flex h-full flex-col">
            <div class="flex items-start justify-between gap-6">
              <span
                class="flex size-12 items-center justify-center rounded-md bg-accent text-accent-foreground"
              >
                <UIcon name="tabler:heart-handshake" class="size-6" />
              </span>
              <span
                class="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
              >
                Founding sponsors
              </span>
            </div>

            <div class="mt-20 max-w-xl">
              <h3
                class="font-display text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                Put your name behind backend freedom.
              </h3>
              <p class="mt-5 text-lg leading-relaxed text-muted-foreground">
                Become one of Runable's first sponsors. Your support will be
                recognized here and directly fund the project's development.
              </p>
              <UButton size="lg" as-child class="mt-8">
                <a
                  href="https://github.com/sponsors/domutala"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <UIcon name="simple-icons:githubsponsors" class="size-4" />
                  Become a sponsor
                  <UIcon name="tabler:arrow-up-right" class="size-4" />
                </a>
              </UButton>
            </div>
          </div>
        </div>

        <div class="grid gap-3">
          <article
            v-for="investment in investments"
            :key="investment.title"
            data-reveal
            class="sr-hidden group rounded-md border border-border bg-background p-6 transition-all hover:-translate-y-px hover:border-strong"
          >
            <div class="flex items-start gap-4">
              <span
                class="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground"
              >
                <UIcon :name="investment.icon" class="size-5" />
              </span>
              <div>
                <h3 class="font-display text-lg font-semibold">
                  {{ investment.title }}
                </h3>
                <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {{ investment.description }}
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>

      <p class="mt-7 text-center font-mono text-xs text-muted-foreground">
        Runable remains open source and MIT licensed for everyone.
      </p>
    </div>
  </section>
</template>
