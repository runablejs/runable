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
  <section
    aria-labelledby="hero-heading"
    class="relative w-full min-h-screen flex flex-col transition-colors duration-base ease-smooth"
  >
    <div
      aria-hidden="true"
      class="absolute inset-0 opacity-55 dark:opacity-30 dark:filter dark:invert"
      style="
        background-image: url(https://template-nextjs-clean.sanity.build/images/tile-1-black.png);
        background-size: 5px;
      "
    ></div>
    <div
      aria-hidden="true"
      class="bg-linear-to-b from-background w-full h-full absolute top-0"
    ></div>
    <!-- Contenu central -->
    <div class="flex-1 flex flex-col items-center justify-center px-10">
      <div class="max-w-4xl mx-auto text-center">
        <!-- Titre -->
        <h1
          id="hero-heading"
          ref="titleRef"
          class="font-display text-hero text- leading-tight tracking-tight sr-hidden"
          style="
            transition:
              opacity 300ms ease-out,
              transform 300ms ease-out;
          "
        >
          The Vue framework that brings the
          <em class="font-display italic text-accent font-bold">Nuxt</em>
          developer experience to
          <em class="font-display italic text-accent font-bold">any</em>
          backend.
        </h1>

        <!-- Sous-titre -->
        <p
          ref="subtitleRef"
          class="font-body text- leading-relaxed mt-8 max-w-2xl mx-auto sr-hidden"
          style="
            transition:
              opacity 300ms ease-out,
              transform 300ms ease-out;
          "
        >
          File-system routing, auto-imports, layouts, SSR, and more — without
          imposing a specific server runtime. Run on Fastify, Express, Hono,
          Deno, or any HTTP server you choose.
        </p>

        <!-- CTAs -->
        <div
          ref="ctasRef"
          class="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sr-hidden"
          style="
            transition:
              opacity 200ms ease-out,
              transform 200ms ease-out;
          "
        >
          <UButton variant="default" size="lg"> Why Syora ? </UButton>
          <UButton variant="secondary" size="lg"> Get Started </UButton>
        </div>
      </div>
    </div>

    <!-- Séparateur -->
    <!-- <div class="w-full px-page-sm md:px-page-md lg:px-page pb-0">
      <div class="w-full border-b border-default" aria-hidden="true" />
    </div> -->
  </section>
</template>
