<script setup lang="ts">
import { ref, onMounted } from "vue";

const metaRef = ref<HTMLElement | null>(null);
const titleRef = ref<HTMLElement | null>(null);
const subtitleRef = ref<HTMLElement | null>(null);
const ctasRef = ref<HTMLElement | null>(null);

onMounted(() => {
  // Stagger d'entrée au mount (pas besoin de scroll, le hero est visible)
  requestAnimationFrame(() => {
    setTimeout(() => metaRef.value?.classList.add("sr-visible"), 0);
    setTimeout(() => titleRef.value?.classList.add("sr-visible"), 100);
    setTimeout(() => subtitleRef.value?.classList.add("sr-visible"), 250);
    setTimeout(() => ctasRef.value?.classList.add("sr-visible"), 400);
  });
});
</script>

<template>
  <section class="relative border-b border-border px-6 py-24 sm:px-10 lg:py-36">
    <div
      aria-hidden="true"
      class="absolute inset-0 opacity-40 dark:opacity-15 dark:invert"
      style="
        background-image: url(https://template-nextjs-clean.sanity.build/images/tile-1-black.png);
        background-size: 5px;
      "
    />
    <div
      aria-hidden="true"
      class="absolute inset-0 bg-linear-to-b from-background/40 via-background/80 to-background"
    />

    <div class="relative mx-auto max-w-6xl">
      <div
        class="mb-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-accent"
      >
        <span class="h-px w-8 bg-accent" />
        Syora
      </div>

      <h1
        ref="titleRef"
        class="max-w-5xl text-5xl font-bold leading-[1.04] tracking-tight sm:text-7xl lg:text-8xl sr-hidden"
        style="
          transition:
            opacity 300ms ease-out,
            transform 300ms ease-out;
        "
      >
        Build the Vue app you want.
        <em class="font-display italic text-accent"
          >Keep the backend you chose.</em
        >
      </h1>

      <p
        ref="subtitleRef"
        style="
          transition:
            opacity 300ms ease-out,
            transform 300ms ease-out;
        "
        class="mt-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl sr-hidden"
      >
        Syora is a Vue framework for teams that want the conventions and
        developer experience of a meta-framework without adopting a specific
        server runtime.
      </p>

      <!-- CTAs -->
      <div
        ref="ctasRef"
        class="mt-12 flex flex-col sm:flex-row items-center gap-4 sr-hidden"
        style="
          transition:
            opacity 200ms ease-out,
            transform 200ms ease-out;
        "
      >
        <UButton variant="default" size="lg" as-child>
          <SyoraLink to="/why-syora"> Why Syora? </SyoraLink>
        </UButton>

        <UButton
          variant="outline"
          size="lg"
          class="hover:text-foreground"
          as-child
        >
          <SyoraLink to="/docs/getting-started/installation">
            Get Started
          </SyoraLink>
        </UButton>
      </div>
    </div>
  </section>
</template>
