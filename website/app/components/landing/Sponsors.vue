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
  revealChildren(contentRef.value, "[data-reveal]", 70);
});

const investments = [
  {
    ref: "01",
    title: "A stronger core",
    description: "More time for stable APIs, performance, and maintenance.",
    icon: "tabler:code-dots",
  },
  {
    ref: "02",
    title: "Useful documentation",
    description: "Practical guides and examples developers can trust.",
    icon: "tabler:book-2",
  },
  {
    ref: "03",
    title: "A broader ecosystem",
    description: "Official adapters, modules, AI tooling, and integrations.",
    icon: "tabler:circles-relation",
  },
];
</script>

<template>
  <section
    aria-labelledby="sponsors-heading"
    class="relative overflow-hidden border-y border-border bg-muted/15"
  >
    <div aria-hidden="true" class="absolute inset-y-0 left-1/2 hidden border-l border-dashed border-border lg:block" />

    <div class="relative mx-auto max-w-7xl px-6 py-24 sm:px-10 md:py-32 lg:py-40">
      <div
        ref="headingRef"
        class="sr-hidden grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20"
        style="transition: opacity 300ms ease-out, transform 300ms ease-out"
      >
        <div class="flex items-start justify-between gap-6 lg:block">
          <p class="font-mono text-mono-sm tracking-[0.08em] text-tertiary">05 — Sponsors</p>
          <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-accent lg:mt-5 lg:block">Open collective effort</span>
        </div>
        <div>
          <h2 id="sponsors-heading" class="max-w-4xl font-display text-h2 text-neutral">
            Open source needs more than
            <em class="font-display italic text-accent">good intentions.</em>
          </h2>
          <p class="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Runable is built in public and available to everyone. Sponsorship turns community support into focused time for the framework, its documentation, and its ecosystem.
          </p>
        </div>
      </div>

      <div ref="contentRef" class="mt-16 grid border-l border-t border-border lg:grid-cols-[1.15fr_0.85fr]">
        <div data-reveal class="sr-hidden border-b border-r border-border bg-background">
          <div class="flex items-center justify-between border-b border-border px-6 py-4 sm:px-8">
            <div class="flex items-center gap-3">
              <span class="size-2 bg-accent" />
              <p class="font-mono text-xs uppercase tracking-[0.18em]">Founding sponsor wall</p>
            </div>
            <span class="font-mono text-[10px] text-muted-foreground">EST. 2026</span>
          </div>

          <div class="relative flex min-h-96 flex-col justify-between overflow-hidden p-7 sm:p-10">
            <div aria-hidden="true" class="absolute inset-0 opacity-[0.045] dark:opacity-[0.08]" style="background-image: linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px); background-size: 32px 32px" />
            <div aria-hidden="true" class="absolute right-0 top-0 size-28 border-b border-l border-border" />

            <div class="relative flex items-start justify-between gap-8">
              <div class="flex size-14 items-center justify-center border border-accent bg-accent text-accent-foreground">
                <UIcon name="tabler:heart-handshake" class="size-7" />
              </div>
              <span class="border border-border bg-background px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">First partners wanted</span>
            </div>

            <div class="relative mt-20 max-w-xl">
              <p class="font-mono text-xs uppercase tracking-[0.2em] text-accent">This space is intentionally open</p>
              <h3 class="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Be among the people who made Runable sustainable.</h3>
              <p class="mt-5 max-w-lg leading-relaxed text-muted-foreground">Founding sponsors will be recognized here as the first organizations and individuals to invest in backend freedom for Vue developers.</p>
            </div>

            <div class="relative mt-12 grid grid-cols-3 gap-px bg-border border border-border">
              <div v-for="slot in 3" :key="slot" class="flex min-h-20 items-center justify-center bg-background p-4">
                <span class="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/55">Reserved / 0{{ slot }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid">
          <article
            v-for="investment in investments"
            :key="investment.ref"
            data-reveal
            class="sr-hidden group border-b border-r border-border bg-background p-6 transition-colors hover:bg-accent/5 sm:p-7"
          >
            <div class="grid grid-cols-[auto_1fr_auto] items-start gap-5">
              <span class="flex size-10 items-center justify-center border border-border text-accent transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground">
                <UIcon :name="investment.icon" class="size-5" />
              </span>
              <div>
                <h3 class="font-display text-lg font-semibold">{{ investment.title }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ investment.description }}</p>
              </div>
              <span class="font-mono text-[10px] text-muted-foreground">{{ investment.ref }}</span>
            </div>
          </article>

          <div data-reveal class="sr-hidden flex flex-col justify-between border-b border-r border-accent bg-accent p-7 text-accent-foreground sm:p-8">
            <div class="flex items-center justify-between gap-5">
              <p class="font-mono text-[10px] uppercase tracking-[0.2em] opacity-65">Sponsor Runable</p>
              <UIcon name="simple-icons:githubsponsors" class="size-5" />
            </div>
            <div class="mt-12">
              <p class="max-w-sm text-xl font-semibold leading-snug">Support the work, not a paywall.</p>
              <p class="mt-3 max-w-sm text-sm leading-relaxed opacity-75">Runable stays open source and MIT licensed. Sponsorship funds the time needed to keep it moving.</p>
              <UButton variant="secondary" size="lg" as-child class="mt-7 rounded-none">
                <a href="https://github.com/sponsors/domutala" target="_blank" rel="noopener noreferrer">
                  Become a sponsor
                  <UIcon name="tabler:arrow-up-right" class="size-4" />
                </a>
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 flex flex-col gap-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>Transparent · Independent · MIT licensed</span>
        <span>Every contribution compounds</span>
      </div>
    </div>
  </section>
</template>
