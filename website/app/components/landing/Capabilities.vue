<script setup lang="ts">
import { ref, onMounted } from "vue";

const titleRef = ref<HTMLElement | null>(null);
const gridRef = ref<HTMLElement | null>(null);
const footerRef = ref<HTMLElement | null>(null);

const { reveal, revealChildren } = useScrollReveal({
  threshold: 0.1,
  rootMargin: "0px 0px -40px 0px",
  y: 16,
});

onMounted(() => {
  reveal(titleRef.value);
  revealChildren(gridRef.value, "article", 60);
  reveal(footerRef.value);
});

const capabilities = [
  {
    ref: "FT.01",
    title: "File-system based routing",
    description:
      "Automatic route discovery based on your file structure. No configuration required.",
  },
  {
    ref: "FT.02",
    title: "Auto-imports",
    description:
      "Components and composables imported automatically without explicit declarations.",
  },
  {
    ref: "FT.03",
    title: "Layouts",
    description:
      "Define page layouts that wrap your routes with shared structure and navigation.",
  },
  {
    ref: "FT.04",
    title: "Route middlewares",
    description:
      "Protect, redirect, or transform navigation with per-route or global middlewares.",
  },
  {
    ref: "FT.05",
    title: "Asynchronous data fetching",
    description:
      "Fetch data before rendering with built-in async hooks and suspense handling.",
  },
  {
    ref: "FT.06",
    title: "Server-Side Rendering",
    description:
      "Full SSR support out of the box. Render on the server, hydrate on the client.",
  },
  {
    ref: "FT.07",
    title: "Hydration",
    description:
      "Seamless client-side takeover of server-rendered markup with Vue hydration.",
  },
  {
    ref: "FT.08",
    title: "Module system",
    description:
      "Extend Syora with modules. Install, configure, and compose functionality.",
  },
  {
    ref: "FT.09",
    title: "Plugin system",
    description:
      "Hook into every stage of the application lifecycle with a powerful plugin API.",
  },
  {
    ref: "FT.10",
    title: "Page metadata",
    description:
      "Manage titles, descriptions, Open Graph, and SEO metadata per route.",
  },
  {
    ref: "FT.11",
    title: "Runtime Presets",
    description:
      "Pre-configured setups for common server environments and deployment targets.",
  },
  {
    ref: "FT.12",
    title: "No backend dependency",
    description:
      "Run on Fastify, Express, Hono, Deno, Bun, Node HTTP, or any custom server.",
  },
  {
    ref: "FT.13",
    title: "Powered by Vue",
    description:
      "Built on Vue reactivity, composition API, and the entire Vue ecosystem.",
  },
  {
    ref: "FT.14",
    title: "Type-safe with TypeScript",
    description:
      "Write type-safe applications with generated types, full TypeScript support, and automatic configuration.",
  },
  {
    ref: "FT.15",
    title: "SEO and Metadata",
    description:
      "Build SEO-friendly applications with full control over page metadata and search engine optimization.",
  },
];
</script>

<template>
  <section
    class="relative w-full transition-colors duration-base ease-smooth"
    aria-labelledby="capabilities-heading"
  >
    <div class="w-full h-px bg-border-default" aria-hidden="true" />

    <div class="mx-auto max-w-7xl px-10 py-32 md:py-40">
      <p class="font-mono text-mono-sm text-tertiary tracking-[0.08em] mb-8">
        04 — Capabilities
      </p>

      <h2
        id="capabilities-heading"
        ref="titleRef"
        class="font-display text-h2 text-neutral mb-16 md:mb-20 sr-hidden"
        style="
          transition:
            opacity 300ms ease-out,
            transform 300ms ease-out;
        "
      >
        Everything you expect from Nuxt.<br class="hidden md:block" />
        None of the lock-in.
      </h2>

      <div
        ref="gridRef"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        <article
          v-for="cap in capabilities"
          :key="cap.ref"
          class="group relative bg- dark:bg-muted/20 border border-border rounded-md p-8 transition-all duration-fast ease-default hover:border-strong hover:-translate-y-px sr-"
          style="
            transition:
              opacity 200ms ease-out,
              transform 200ms ease-out,
              border-color 150ms ease-out;
          "
        >
          <div
            class="absolute left-0 top-8 w-0.75 h-10 bg-accent dark:bg-border rounded-r-md transition-transform duration-fast ease-default group-hover:scale-y-110 origin-top"
            aria-hidden="true"
          />
          <p class="font-mono text-mono-sm text-tertiary tracking-wide mb-4">
            {{ cap.ref }}
          </p>
          <h3 class="font-display text-h3 text-neutral mb-3">
            {{ cap.title }}
          </h3>
          <p class="font-body text-small text- leading-relaxed">
            {{ cap.description }}
          </p>
        </article>
      </div>

      <div
        ref="footerRef"
        class="mt-16 md:mt-20 pt-8 border-t border-default sr-hidden"
        style="
          transition:
            opacity 300ms ease-out,
            transform 300ms ease-out;
        "
      >
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <p class="font-body text-caption">
            {{ capabilities.length }} capabilities. Zero backend lock-in. One
            developer experience.
          </p>
          <a
            href="#docs"
            class="inline-flex items-center gap-2 font-mono text-mono transition-colors duration-instant ease-default"
          >
            <span>Read the documentation</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>

    <div class="w-full h-px border-t border-default" aria-hidden="true" />
  </section>
</template>
