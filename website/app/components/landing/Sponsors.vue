<script setup lang="ts">
import { onMounted, ref } from "vue";

const headingRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
const licenseRef = ref<HTMLElement | null>(null);

const { reveal, revealChildren } = useScrollReveal({
  threshold: 0.08,
  rootMargin: "0px 0px -40px 0px",
  y: 16,
});

onMounted(() => {
  reveal(headingRef.value);
  revealChildren(contentRef.value, "[data-reveal]", 80);
  reveal(licenseRef.value);
});

const investments = [
  {
    ref: "01",
    title: "Core development",
    description: "More time for framework APIs, stability, and performance.",
    icon: "tabler:code",
  },
  {
    ref: "02",
    title: "Documentation",
    description:
      "Clear guides, examples, and migration paths for every runtime.",
    icon: "tabler:book-2",
  },
  {
    ref: "03",
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
    class="relative overflow-hidden bg-background"
  >
    <div class="mx-auto max-w-7xl px-6 py-24 sm:px-10 md:py-36">
      <div
        ref="headingRef"
        class="sr-hidden max-w-4xl"
        style="
          transition:
            opacity 300ms ease-out,
            transform 300ms ease-out;
        "
      >
        <p
          class="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground"
        >
          05 — Sponsors
        </p>
        <h2
          id="sponsors-heading"
          class="mt-6 font-display text-h2 text-neutral"
        >
          Back an independent<br />
          <em class="font-display italic text-accent">Vue ecosystem.</em>
        </h2>
        <p class="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Sponsorship turns community support into focused engineering time for
          the framework, its integrations, and the documentation around them.
        </p>
      </div>

      <div
        ref="contentRef"
        class="mt-16 grid border border-border md:mt-24 lg:grid-cols-5"
      >
        <div
          data-reveal
          class="sr-hidden relative flex min-h-152 flex-col overflow-hidden bg-neutral p-6 text-inverse sm:p-10 lg:col-span-3 lg:p-12"
        >
          <div class="relative flex items-start justify-between gap-6">
            <span
              class="flex size-12 items-center justify-center bg-accent text-accent-foreground"
            >
              <UIcon name="tabler:heart-handshake" class="size-6" />
            </span>
            <span
              class="border border-inverse/20 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-inverse/60"
            >
              Founding round · Open
            </span>
          </div>

          <div class="relative mt-20 max-w-2xl lg:mt-auto">
            <p
              class="font-mono text-[10px] uppercase tracking-[0.2em] text-inverse/50"
            >
              A project worth using is a project worth sustaining
            </p>
            <h3
              class="mt-5 max-w-xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-5xl"
            >
              Put your name behind backend freedom.
            </h3>
            <p class="mt-6 max-w-xl text-base leading-relaxed text-inverse/65">
              Become one of Runable's first sponsors. Your support funds public
              work and gives the project more room to grow without compromising
              its runtime-independent direction.
            </p>

            <a
              href="https://github.com/sponsors/domutala"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-8 inline-flex min-h-12 items-center gap-3 bg-accent px-5 font-medium text-accent-foreground"
            >
              <UIcon name="simple-icons:githubsponsors" class="size-4" />
              Become a sponsor
              <UIcon name="tabler:arrow-up-right" class="size-4" />
            </a>
          </div>
        </div>

        <div class="lg:col-span-2 lg:border-l lg:border-border">
          <div
            data-reveal
            class="sr-hidden flex min-h-24 items-center justify-between border-b border-border px-6 sm:px-8"
          >
            <div>
              <p
                class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
              >
                Impact ledger
              </p>
              <p class="mt-2 font-display text-lg font-semibold">
                Where support goes
              </p>
            </div>
            <span
              class="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
            >
              <span class="size-1.5 rounded-full bg-accent" /> Public work
            </span>
          </div>

          <article
            v-for="investment in investments"
            :key="investment.title"
            data-reveal
            class="sr-hidden flex min-h-44 flex-col border-b border-border p-6 last:border-b-0 sm:p-8 lg:min-h-43"
          >
            <div class="flex items-start justify-between gap-5">
              <span
                class="flex size-10 items-center justify-center border border-border text-muted-foreground"
              >
                <UIcon :name="investment.icon" class="size-5" />
              </span>
              <span class="font-mono text-[10px] text-muted-foreground">
                IMP.{{ investment.ref }}
              </span>
            </div>
            <div class="mt-auto pt-8">
              <h3 class="font-display text-lg font-semibold">
                {{ investment.title }}
              </h3>
              <p
                class="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground"
              >
                {{ investment.description }}
              </p>
            </div>
          </article>
        </div>
      </div>

      <div
        ref="licenseRef"
        class="sr-hidden mt-6 flex flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
        style="
          transition:
            opacity 300ms ease-out,
            transform 300ms ease-out;
        "
      >
        <span>Runable remains open source for everyone.</span>
        <span>MIT licensed · Community supported</span>
      </div>
    </div>
  </section>
</template>
