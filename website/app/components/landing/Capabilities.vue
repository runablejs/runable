<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const titleRef = ref<HTMLElement | null>(null);
const gridRef = ref<HTMLElement | null>(null);
const footerRef = ref<HTMLElement | null>(null);

const { reveal, revealChildren } = useScrollReveal({
  threshold: 0.1,
  rootMargin: "0px 0px -40px 0px",
  y: 16,
});
const localePath = useLocalePath();

onMounted(() => {
  reveal(titleRef.value);
  revealChildren(gridRef.value, "article", 60);
  reveal(footerRef.value);
});

const capabilities = computed(() => [
  {
    ref: "FT.01",
    title: t("landing.capabilities.items.routing.title"),
    description: t("landing.capabilities.items.routing.description"),
  },
  {
    ref: "FT.02",
    title: t("landing.capabilities.items.autoImports.title"),
    description: t("landing.capabilities.items.autoImports.description"),
  },
  {
    ref: "FT.03",
    title: t("landing.capabilities.items.layouts.title"),
    description: t("landing.capabilities.items.layouts.description"),
  },
  {
    ref: "FT.04",
    title: t("landing.capabilities.items.middlewares.title"),
    description: t("landing.capabilities.items.middlewares.description"),
  },
  {
    ref: "FT.05",
    title: t("landing.capabilities.items.dataFetching.title"),
    description: t("landing.capabilities.items.dataFetching.description"),
  },
  {
    ref: "FT.06",
    title: t("landing.capabilities.items.ssr.title"),
    description: t("landing.capabilities.items.ssr.description"),
  },
  {
    ref: "FT.07",
    title: t("landing.capabilities.items.hydration.title"),
    description: t("landing.capabilities.items.hydration.description"),
  },
  {
    ref: "FT.08",
    title: t("landing.capabilities.items.modules.title"),
    description: t("landing.capabilities.items.modules.description"),
  },
  {
    ref: "FT.09",
    title: t("landing.capabilities.items.plugins.title"),
    description: t("landing.capabilities.items.plugins.description"),
  },
  {
    ref: "FT.10",
    title: t("landing.capabilities.items.metadata.title"),
    description: t("landing.capabilities.items.metadata.description"),
  },
  {
    ref: "FT.11",
    title: t("landing.capabilities.items.runtimePresets.title"),
    description: t("landing.capabilities.items.runtimePresets.description"),
  },
  {
    ref: "FT.12",
    title: t("landing.capabilities.items.backendIndependent.title"),
    description: t("landing.capabilities.items.backendIndependent.description"),
  },
  {
    ref: "FT.13",
    title: t("landing.capabilities.items.vue.title"),
    description: t("landing.capabilities.items.vue.description"),
  },
  {
    ref: "FT.14",
    title: t("landing.capabilities.items.typescript.title"),
    description: t("landing.capabilities.items.typescript.description"),
  },
  {
    ref: "FT.15",
    title: t("landing.capabilities.items.seo.title"),
    description: t("landing.capabilities.items.seo.description"),
  },
]);
</script>

<template>
  <section
    class="relative w-full transition-colors duration-base ease-smooth"
    aria-labelledby="capabilities-heading"
  >
    <div class="w-full h-px bg-border-default" aria-hidden="true" />

    <div class="mx-auto max-w-7xl px-10 py-32 md:py-40">
      <p class="font-mono text-mono-sm text-tertiary tracking-[0.08em] mb-8">
        {{ t("landing.capabilities.eyebrow") }}
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
        {{ t("landing.capabilities.title.first")
        }}<br class="hidden md:block" />
        {{ t("landing.capabilities.title.second") }}
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
            {{
              t("landing.capabilities.summary", { count: capabilities.length })
            }}
          </p>

          <SyoraLink
            :to="localePath('/docs/getting-started/installation')"
            class="inline-flex items-center gap-2 font-mono text-mono transition-colors duration-instant ease-default bg-accent text-accent-foreground px-2"
          >
            <span>{{ t("landing.capabilities.readDocumentation") }}</span>
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
          </SyoraLink>
        </div>
      </div>
    </div>

    <div class="w-full h-px border-t border-default" aria-hidden="true" />
  </section>
</template>
