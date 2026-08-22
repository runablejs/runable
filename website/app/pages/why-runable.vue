<script setup lang="ts">
const choices = [
  {
    label: "Option A",
    title: "Assemble Vue yourself",
    description:
      "Keep complete server control, then select and connect routing, SSR, data loading, middleware, layouts, and application conventions yourself.",
  },
  {
    label: "Option B",
    title: "Split the application",
    description:
      "Run a separate meta-framework frontend and backend, then accept two projects, two deployments, and a larger integration surface.",
  },
];

const goodFit = [
  "You already have a backend that your team trusts.",
  "Your server framework provides architecture or plugins you need.",
  "You want SSR and framework conventions without a prescribed runtime.",
  "You want the frontend and backend to remain one coherent application.",
];

useHead({
  title: "Why Runable",
  meta: [
    {
      name: "description",
      content:
        "Runable gives Vue applications the structure of a meta-framework while leaving HTTP, APIs, and infrastructure in your hands.",
    },
  ],
});

useSeoMeta({
  ogTitle: "Why Runable",
  ogDescription:
    "Runable gives Vue applications the structure of a meta-framework while leaving HTTP, APIs, and infrastructure in your hands.",
});
</script>

<template>
  <div class="overflow-hidden">
    <section class="relative border-b border-border">
      <div
        class="mx-auto grid min-h-[calc(100svh-var(--header-height))] max-w-7xl lg:grid-cols-[1.05fr_0.95fr]"
      >
        <div
          class="flex flex-col justify-between px-6 py-16 sm:px-10 lg:border-r lg:border-border lg:px-14 lg:py-20"
        >
          <div
            class="flex items-center justify-between font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            <span>Why Runable</span>
            <span>Manifesto / 01</span>
          </div>

          <div class="my-20 lg:my-12">
            <p
              class="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-accent"
            >
              One framework. Your runtime.
            </p>
            <h1
              class="max-w-3xl text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl"
            >
              Your Vue framework should not choose
              <span class="text-accent">your backend.</span>
            </h1>
            <p
              class="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground"
            >
              Runable gives Vue applications the structure of a meta-framework
              while leaving HTTP, APIs, and infrastructure in your hands.
            </p>
          </div>

          <div
            class="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border pt-6 font-mono text-xs text-muted-foreground"
          >
            <span>Vue 3</span>
            <span>SSR</span>
            <span>File routing</span>
            <span>Any HTTP server</span>
          </div>
        </div>

        <div
          class="relative flex min-h-130 items-center justify-center overflow-hidden bg-muted/35 px-6 py-16 sm:px-12 lg:min-h-0"
        >
          <div
            aria-hidden="true"
            class="absolute inset-y-0 left-1/2 border-l border-dashed border-border"
          />
          <div
            aria-hidden="true"
            class="absolute inset-x-0 top-1/2 border-t border-dashed border-border"
          />

          <div class="relative w-full max-w-md">
            <p
              class="mb-5 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              Request flow
            </p>

            <div class="border border-border bg-background p-5 shadow-sm">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p
                    class="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                  >
                    Your server
                  </p>
                  <p class="mt-1 text-lg font-semibold">
                    Fastify · Hono · Express
                  </p>
                </div>
                <UIcon
                  name="tabler:server"
                  class="size-7 text-muted-foreground"
                />
              </div>
            </div>

            <div
              class="mx-auto flex h-14 w-px items-center justify-center bg-border"
            >
              <UIcon
                name="tabler:arrow-down"
                class="size-5 shrink-0 bg-muted text-accent"
              />
            </div>

            <div
              class="relative border border-accent bg-accent p-6 text-accent-foreground shadow-xl shadow-accent/10"
            >
              <span
                class="absolute -right-2 -top-2 size-4 border border-accent bg-background"
              />
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p
                    class="font-mono text-[10px] uppercase tracking-widest opacity-70"
                  >
                    Application layer
                  </p>
                  <p class="mt-1 text-2xl font-bold">Runable</p>
                </div>
                <UIcon name="tabler:arrows-split-2" class="size-8" />
              </div>
              <div
                class="mt-6 grid grid-cols-3 gap-px bg-accent-foreground/20 text-center font-mono text-[10px] uppercase tracking-wide"
              >
                <span class="bg-accent py-2">Route</span>
                <span class="bg-accent py-2">Render</span>
                <span class="bg-accent py-2">Hydrate</span>
              </div>
            </div>

            <div
              class="mx-auto flex h-14 w-px items-center justify-center bg-border"
            >
              <UIcon
                name="tabler:arrow-down"
                class="size-5 shrink-0 bg-muted text-accent"
              />
            </div>

            <div class="border border-border bg-background p-5 shadow-sm">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p
                    class="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                  >
                    Interface
                  </p>
                  <p class="mt-1 text-lg font-semibold">Vue application</p>
                </div>
                <UIcon
                  name="simple-icons:vuedotjs"
                  class="size-7 text-accent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="border-b border-border px-6 py-20 sm:px-10 lg:py-28">
      <div class="mx-auto max-w-6xl">
        <div class="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
          <div>
            <p
              class="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              The problem
            </p>
            <h2 class="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              A productive frontend often comes with an architectural decision
              attached.
            </h2>
          </div>
          <div class="space-y-6 text-lg leading-relaxed text-muted-foreground">
            <p>
              Vue is deliberately flexible. As a project grows, teams add page
              routing, layouts, middleware, server rendering, hydration, data
              loading, plugins, and their own folder conventions.
            </p>
            <p class="text-foreground">
              Meta-frameworks solve that integration work brilliantly. The
              trade-off is that their server layer becomes part of your
              architecture—even when Fastify, NestJS, AdonisJS, Express, Hono,
              or an internal platform is the better backend.
            </p>
          </div>
        </div>

        <div class="mt-16 grid gap-3 md:grid-cols-2">
          <article
            v-for="choice in choices"
            :key="choice.label"
            class="border border-border bg-destructive/5 p-8"
          >
            <p
              class="font-mono text-xs uppercase tracking-widest text-destructive"
            >
              {{ choice.label }}
            </p>
            <h3 class="mt-4 text-2xl font-semibold">{{ choice.title }}</h3>
            <p class="mt-3 leading-relaxed text-muted-foreground">
              {{ choice.description }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <section class="border-b border-border px-6 py-20 sm:px-10 lg:py-28">
      <div class="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:gap-24">
        <div>
          <p class="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            The third way
          </p>
          <h2 class="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
            Runable separates Vue conventions from the HTTP runtime.
          </h2>
          <p class="mt-6 text-lg leading-relaxed text-muted-foreground">
            Your backend keeps ownership of HTTP, APIs, authentication, and
            business logic. A small adapter forwards interface requests to
            Runable, which renders the Vue application.
          </p>
        </div>

        <div class="border border-border bg-muted/30 p-7 sm:p-10">
          <div class="space-y-6 font-mono text-sm">
            <div class="flex items-center gap-4">
              <span
                class="flex size-9 items-center justify-center bg-accent text-accent-foreground"
                >01</span
              ><span>HTTP request reaches your backend</span>
            </div>
            <div class="ml-4 h-8 border-l border-dashed border-border" />
            <div class="flex items-center gap-4">
              <span
                class="flex size-9 items-center justify-center bg-accent text-accent-foreground"
                >02</span
              ><span>API routes stay under backend control</span>
            </div>
            <div class="ml-4 h-8 border-l border-dashed border-border" />
            <div class="flex items-center gap-4">
              <span
                class="flex size-9 items-center justify-center bg-accent text-accent-foreground"
                >03</span
              ><span>Runable renders the Vue interface</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="px-6 py-20 sm:px-10 lg:py-28">
      <div
        class="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1fr_0.8fr] lg:items-start lg:gap-24"
      >
        <div>
          <p
            class="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            When Runable fits
          </p>
          <h2 class="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
            Choose Runable when your backend is a deliberate choice, not an
            implementation detail.
          </h2>
          <ul class="mt-10 border-t border-border">
            <li
              v-for="item in goodFit"
              :key="item"
              class="flex gap-4 border-b border-border py-5"
            >
              <UIcon
                name="tabler:circle-check-filled"
                class="mt-0.5 size-5 shrink-0 text-accent"
              />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>

        <aside class="border border-border p-8">
          <p
            class="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            Start building
          </p>
          <h3 class="mt-4 text-2xl font-semibold">
            Keep your server. Add Runable.
          </h3>
          <p class="mt-4 leading-relaxed text-muted-foreground">
            Install the framework, choose the adapter for your runtime, and
            create your first Vue page.
          </p>
          <div class="mt-8 flex flex-col gap-3">
            <UButton size="lg" as-child>
              <RunableLink to="/docs/getting-started/installation">
                Get started
                <UIcon name="tabler:arrow-right" class="size-4" />
              </RunableLink>
            </UButton>
            <UButton variant="outline" size="lg" as-child>
              <RunableLink to="/about">About the project</RunableLink>
            </UButton>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>
