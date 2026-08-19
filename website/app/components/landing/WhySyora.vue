<script setup lang="ts">
import { ref, onMounted } from "vue";

const titleRef = ref<HTMLElement | null>(null);
const leadRef = ref<HTMLElement | null>(null);
const bodyRef = ref<HTMLElement | null>(null);
const optionsRef = ref<HTMLElement | null>(null);
const solutionRef = ref<HTMLElement | null>(null);

const { reveal, revealChildren } = useScrollReveal({
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
  y: 16,
});

onMounted(() => {
  reveal(titleRef.value);
  reveal(leadRef.value);
  revealChildren(bodyRef.value, "p", 0);
  reveal(optionsRef.value);
  reveal(solutionRef.value);
});
</script>

<template>
  <section
    class="relative w-full transition-colors duration-base ease-smooth bg-muted/75 dark:bg-muted/10 border-t border-border"
    aria-labelledby="why-heading"
  >
    <div class="mx-auto max-w-7xl py-15 md:py-30 px-10">
      <div class="mx- max-w-5xl">
        <!-- Numérotation -->

        <p class="font-mono text-mono-sm uppercase tracking-[0.08em] mb-8">
          02 — Why Syora
        </p>

        <!-- Titre -->
        <h2
          id="why-heading"
          ref="titleRef"
          class="font-display text-h2 mb-6 sr-hidden"
          style="
            transition:
              opacity 300ms ease-out,
              transform 300ms ease-out;
          "
        >
          The compromise nobody asked for.
        </h2>

        <!-- Lead -->
        <p
          ref="leadRef"
          class="font-body text-body text- leading-relaxed max-w-prose mb-16 sr-hidden"
          style="
            transition:
              opacity 300ms ease-out,
              transform 300ms ease-out;
          "
        >
          Today, choosing Nuxt means adopting Nitro as your server runtime. For
          most projects, this coupling makes sense. But when you need a
          specialized backend framework, it becomes a real constraint.
        </p>

        <!-- ═══════════════════════════════════════════════════
           CORPS DE TEXTE — Argumentation
           ═══════════════════════════════════════════════════ -->
        <div ref="bodyRef" class="max-w-prose space-y-6">
          <p
            class="font-body text-body text- leading-relaxed sr-hidden"
            style="
              transition:
                opacity 300ms ease-out,
                transform 300ms ease-out;
            "
          >
            Frameworks like Fastify, NestJS, AdonisJS, or Koa offer rich,
            battle-tested ecosystems: advanced dependency injection, modular
            architecture, mature plugin systems, and robust conventions already
            adopted by enterprises. When you need this kind of infrastructure,
            developers are stuck between two unsatisfying options.
          </p>
        </div>

        <!-- ═══════════════════════════════════════════════════
           LES DEUX OPTIONS — Mise en forme visuelle
           ═══════════════════════════════════════════════════ -->
        <div
          ref="optionsRef"
          class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-16 mb-5 sr-hidden"
          style="
            transition:
              opacity 400ms ease-out,
              transform 400ms ease-out;
          "
        >
          <!-- Option 1 : Vue pur -->
          <div
            class="bg-destructive/5 border border-border rounded-md p-8 relative"
          >
            <!-- <div
            class="absolute left-0 top-3 bottom-3 w-0.75 bg-destructive rounded-r-sm"
            aria-hidden="true"
          /> -->
            <p
              class="font-mono text-mono-sm text-destructive uppercase tracking-widest mb-4"
            >
              Option A
            </p>
            <h3 class="font-display text-h3 mb-3">
              Back to Vanilla Vue
            </h3>
            <p class="font-body text-small text- leading-relaxed">
              You choose server freedom, but you give up the exceptional Nuxt
              developer experience: file-system routing, auto-imports,
              useAsyncData, modules, middlewares, and more.
            </p>
          </div>

          <!-- Option 2 : Projets séparés -->
          <div
            class="bg-destructive/5 border border-border rounded-md p-8 relative"
          >
            <!-- <div
            class="absolute left-0 top-3 bottom-3 w-0.75 bg-destructive rounded-r-sm"
            aria-hidden="true"
          /> -->
            <p
              class="font-mono text-mono-sm text-destructive uppercase tracking-widest mb-4"
            >
              Option B
            </p>
            <h3 class="font-display text-h3 mb-3">
              Split Projects (Headless)
            </h3>
            <p class="font-body text-small text- leading-relaxed">
              You build your ideal backend on one side and a Nuxt frontend on
              the other — at the cost of heavy architecture, increased
              deployment complexity, and duplicated logic.
            </p>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════
           LA SOLUTION — Syora
           ═══════════════════════════════════════════════════ -->
        <div
          ref="solutionRef"
          class="relative bg-muted dark:bg-muted/7 border border-muted p-8 md:p-10 rounded-md sr-"
          style="
            transition:
              opacity 400ms ease-out,
              transform 400ms ease-out;
          "
        >
          <div
            aria-hidden="true"
            class="absolute inset-0 opacity-30 dark:opacity-30 dark:filter dark:invert"
            style="
              background-image: url(https://template-nextjs-clean.sanity.build/images/tile-1-black.png);
              background-size: 5px;
            "
          ></div>

          <div
            class="absolute left-0 top-6 h-20 w-0.75 bg-green-500 rounded-r-sm"
            aria-hidden="true"
          />

          <p
            class="font-mono text-mono-sm text-green-600 uppercase tracking-widest mb-4"
          >
            The Third Way
          </p>
          <h3 class="font-display text-h3 mb-4">
            Syora eliminates this compromise.
          </h3>
          <div class="space-y-4 max-w-165.5">
            <p class="font-body text-body text- leading-relaxed">
              Syora brings the
              <strong class="font-medium">
                entire Nuxt developer experience
              </strong>
              directly to Vue.js, while remaining strictly independent of the
              server. You keep file-system routing, layouts, middlewares, async
              hydration, Server-Side Rendering (SSR), and auto-imports.
            </p>
            <p class="font-body text-body text- leading-relaxed">
              The only difference? You are free to run your application on the
              server of your choice. Whether your architecture relies on
              Fastify, NestJS, AdonisJS, Express, Koa, Hono, or any other
              technology capable of handling HTTP requests, Syora integrates
              naturally.
            </p>
            <p class="font-body text-body leading-relaxed font-medium">
              Choose your backend for its intrinsic qualities, without ever
              giving up the development comfort of Nuxt.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
