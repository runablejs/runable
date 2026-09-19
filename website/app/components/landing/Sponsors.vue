<script setup lang="ts">
import { onMounted, ref } from "vue";

const sectionRef = ref<HTMLElement | null>(null);

const { reveal, revealChildren } = useScrollReveal({
  threshold: 0.08,
  rootMargin: "0px 0px -40px 0px",
  y: 16,
});

const sponsors = [
  {
    name: "Render",
    href: "https://render.com",
    icon: "simple-icons:render",
  },
] as const;

onMounted(() => {
  reveal(sectionRef.value);
  revealChildren(sectionRef.value, "[data-sponsor]", 80);
});
</script>

<template>
  <section
    ref="sectionRef"
    aria-labelledby="sponsors-heading"
    class="sr-hidden border-y border-border bg-background"
    style="
      transition:
        opacity 300ms ease-out,
        transform 300ms ease-out;
    "
  >
    <div class="mx-auto max-w-7xl px-6 py-20 sm:px-10 md:py-28">
      <p
        class="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground"
      >
        05 — Sponsors
      </p>
      <h2 id="sponsors-heading" class="mt-6 font-display text-h2 text-neutral">
        Back an independent<br />
        <em class="font-display italic text-accent">Vue ecosystem.</em>
      </h2>
      <p class="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
        Sponsorship turns community support into focused engineering time for
        the framework, its integrations, and the documentation around them.
      </p>

      <div
        class="mt-16 grid overflow-hidden border-l border-t border-border sm:grid-cols-2 lg:grid-cols-4"
      >
        <a
          v-for="sponsor in sponsors"
          :key="sponsor.name"
          data-sponsor
          :href="sponsor.href"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="`${sponsor.name} website`"
          class="sr-hidden group flex min-h-40 items-center justify-center gap-4 border-b border-r border-border bg-background px-8 transition-colors hover:bg-muted/30"
        >
          <UIcon
            :name="sponsor.icon"
            class="size-8 text-foreground transition-colors group-hover:text-accent"
          />
          <span class="font-display text-2xl font-semibold">
            {{ sponsor.name }}
          </span>
        </a>

        <a
          data-sponsor
          href="https://github.com/sponsors/domutala"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Become a Runable sponsor"
          title="Become a sponsor"
          class="sr-hidden group flex min-h-40 items-center justify-center border-b border-r border-border bg-background transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <UIcon
            name="tabler:plus"
            class="size-9 transition-transform group-hover:rotate-90"
          />
          <span class="sr-only">Become a sponsor</span>
        </a>
      </div>
    </div>
  </section>
</template>
