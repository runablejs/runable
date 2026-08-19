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
    class="relative isolate flex min-h-[calc(100svh-var(--header-height))] w-full overflow-hidden border-b border-border"
  >
    <div aria-hidden="true" class="absolute inset-0 -z-20 bg-background" />

    <div
      aria-hidden="true"
      class="absolute inset-0 -z-10 opacity-10"
      style="
        background-image:
          linear-gradient(to right, currentColor 1px, transparent 1px),
          linear-gradient(to bottom, currentColor 1px, transparent 1px);
        background-size: 64px 64px;
        mask-image: linear-gradient(to bottom, black, transparent 90%);
      "
    />
    <div
      aria-hidden="true"
      class="absolute -right-40 top-12 -z-10 size-160 rounded-full bg-accent/10 blur-3xl"
    />

    <div
      class="mx-auto grid w-full max-w-7xl flex-1 items-center gap-16 px-6 py-16 sm:px-10 lg:grid-cols-[1.12fr_0.88fr] lg:px-12 lg:py-20"
    >
      <div>
        <div
          ref="metaRef"
          class="sr-hidden mb-5 px-3 py-1 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] bg-accent text-accent-foreground w-max"
          style="
            transition:
              opacity 250ms ease-out,
              transform 250ms ease-out;
          "
        >
          <span>Vue framework · Runtime agnostic</span>
        </div>

        <h1
          id="hero-heading"
          ref="titleRef"
          class="sr-hidden max-w-4xl font-display text-5xl font-bold leading-[1.02] tracking-[-0.045em] sm:text-6xl xl:text-7xl"
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
          class="sr-hidden mt-8 max-w-2xl border-accent font-body text-lg leading-relaxed text-muted-foreground"
          style="
            transition:
              opacity 300ms ease-out,
              transform 300ms ease-out;
          "
        >
          Syora is a Vue framework for teams that want the conventions and
          developer experience of a meta-framework without adopting a specific
          server runtime.
        </p>

        <div
          ref="ctasRef"
          class="sr-hidden mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
          style="
            transition:
              opacity 250ms ease-out,
              transform 250ms ease-out;
          "
        >
          <UButton variant="default" size="lg" as-child>
            <SyoraLink to="/why-syora">
              Why Syora?
              <UIcon name="tabler:arrow-right" class="size-4" />
            </SyoraLink>
          </UButton>

          <UButton variant="outline" size="lg" as-child>
            <SyoraLink to="/docs/getting-started/installation">
              Get Started
            </SyoraLink>
          </UButton>
        </div>
      </div>

      <div class="relative hidden lg:block">
        <div
          aria-hidden="true"
          class="absolute -inset-6 border border-dashed border-border"
        />
        <div
          aria-hidden="true"
          class="absolute -left-6 -top-6 size-3 bg-accent"
        />
        <div
          aria-hidden="true"
          class="absolute -bottom-6 -right-6 size-3 bg-accent"
        />

        <div
          class="relative overflow-hidden border border-border bg-background shadow-2xl shadow-black/10 dark:shadow-black/40"
        >
          <div
            class="flex h-11 items-center justify-between border-b border-border bg-muted/60 px-4"
          >
            <div class="flex gap-1.5" aria-hidden="true">
              <span class="size-2.5 rounded-full bg-muted-foreground/25" />
              <span class="size-2.5 rounded-full bg-muted-foreground/25" />
              <span class="size-2.5 rounded-full bg-accent" />
            </div>
            <span
              class="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
              >server.ts</span
            >
          </div>

          <pre
            class="overflow-x-auto p-6 font-mono text-[13px] leading-7"
          ><code><span class="text-muted-foreground">import</span> Express <span class="text-muted-foreground">from</span> <span class="text-accent">"express"</span>;
<span class="text-muted-foreground">import</span> { express } <span class="text-muted-foreground">from</span>
  <span class="text-accent">"@syora/core/adapters/express"</span>;

<span class="text-muted-foreground">const</span> server = Express();

server.get(<span class="text-accent">"/api/health"</span>, apiHealth);
server.use(express());

server.listen(<span class="text-accent">3000</span>);</code></pre>

          <div class="grid grid-cols-3 border-t border-border bg-muted/30">
            <div class="border-r border-border p-4">
              <p
                class="font-mono text-[9px] uppercase tracking-widest text-muted-foreground"
              >
                Frontend
              </p>
              <p class="mt-1 text-sm font-medium">Vue 3</p>
            </div>
            <div class="border-r border-border p-4">
              <p
                class="font-mono text-[9px] uppercase tracking-widest text-muted-foreground"
              >
                Rendering
              </p>
              <p class="mt-1 text-sm font-medium">SSR + CSR</p>
            </div>
            <div class="p-4">
              <p
                class="font-mono text-[9px] uppercase tracking-widest text-muted-foreground"
              >
                Backend
              </p>
              <p class="mt-1 text-sm font-medium text-accent">Your choice</p>
            </div>
          </div>
        </div>

        <div
          class="absolute -bottom-10 -left-12 flex items-center gap-3 border border-border bg-background px-4 py-3 shadow-lg"
        >
          <span class="relative flex size-2">
            <span
              class="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60"
            />
            <span class="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          <span class="font-mono text-xs">Ready on any runtime</span>
        </div>
      </div>
    </div>

    <div
      class="absolute bottom-0 right-0 hidden h-1 w-1/3 bg-accent sm:block"
      aria-hidden="true"
    />
  </section>
</template>
