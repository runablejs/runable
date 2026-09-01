<script setup lang="ts">
import { onMounted, ref } from "vue";

const headingRef = ref<HTMLElement | null>(null);
const topologyRef = ref<HTMLElement | null>(null);
const footerRef = ref<HTMLElement | null>(null);

const { reveal, revealChildren } = useScrollReveal({
  threshold: 0.08,
  rootMargin: "0px 0px -40px 0px",
  y: 16,
});

onMounted(() => {
  reveal(headingRef.value);
  revealChildren(topologyRef.value, "[data-runtime]", 55);
  reveal(footerRef.value);
});

const runtimeServers = [
  {
    name: "Fastify",
    type: "Node framework",
    icon: "simple-icons:fastify",
    to: "/docs/integrations/fastify",
  },
  {
    name: "NestJS",
    type: "Node framework",
    icon: "simple-icons:nestjs",
    to: "/docs/integrations/nestjs",
  },
  {
    name: "Koa",
    type: "Node framework",
    icon: "simple-icons:koa",
    to: "/docs/integrations/koa",
  },
  {
    name: "Express",
    type: "Node framework",
    icon: "simple-icons:express",
    to: "/docs/integrations/express",
  },
  {
    name: "Hono",
    type: "Web standard",
    icon: "simple-icons:hono",
    to: "/docs/integrations/hono",
  },
  {
    name: "AdonisJS",
    type: "Node framework",
    icon: "simple-icons:adonisjs",
    to: "/docs/integrations/adonisjs",
  },
  {
    name: "Deno",
    type: "JS runtime",
    icon: "simple-icons:deno",
    to: "/docs/integrations/deno",
  },
  {
    name: "Bun",
    type: "JS runtime",
    icon: "simple-icons:bun",
    to: "/docs/integrations/bun",
  },
  {
    name: "Custom",
    type: "Any HTTP server",
    icon: "lucide:code-xml",
    to: "/docs/integrations/custom",
  },
];
</script>

<template>
  <section
    class="relative overflow-hidden border-b border-border bg-background"
    aria-labelledby="runtimes-heading"
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
          04 — Runtimes
        </p>
        <h2
          id="runtimes-heading"
          class="mt-6 font-display text-h2 text-neutral"
        >
          Run on anything.<br />
          <em class="font-display italic text-accent">Deploy anywhere.</em>
        </h2>
        <p class="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Runable meets your server through a small adapter contract. The Vue
          application stays the same while the runtime remains your decision.
        </p>
      </div>

      <div class="mt-16 border border-border bg-background md:mt-24">
        <div ref="topologyRef" class="runtime-topology">
          <div class="runtime-row">
            <RunableLink
              v-for="(runtime, index) in runtimeServers"
              :key="runtime.name"
              :to="runtime.to"
              :aria-label="`Read the ${runtime.name} integration documentation`"
              data-runtime
              class="runtime-node border hover:bg-code sr-hidden"
              :class="runtime.name === 'Custom' && 'runtime-node--custom'"
              style="
                transition:
                  opacity 200ms ease-out,
                  transform 200ms ease-out;
              "
            >
              <span class="runtime-node__index">
                RT.{{ String(index + 6).padStart(2, "0") }}
              </span>
              <span class="runtime-node__icon">
                <UIcon :name="runtime.icon" class="size-5" aria-hidden="true" />
              </span>

              <span class="runtime-node__content">
                <strong>{{ runtime.name }}</strong>
                <small>{{ runtime.type }}</small>
              </span>
            </RunableLink>
          </div>
        </div>

        <div
          ref="footerRef"
          class="sr-hidden flex flex-col gap-5 border-t border-border bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
          style="
            transition:
              opacity 300ms ease-out,
              transform 300ms ease-out;
          "
        >
          <p class="flex items-center gap-3 text-sm text-muted-foreground">
            <span class="hidden h-px w-10 bg-accent sm:block" />
            Use an official adapter or implement the same contract yourself.
          </p>
          <UButton variant="outline" size="lg" as-child class="rounded-none">
            <RunableLink to="/docs/integrations">
              Explore integrations
              <UIcon name="tabler:arrow-right" class="size-4" />
            </RunableLink>
          </UButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.runtime-topology {
  position: relative;
  padding: 2rem 1.25rem;
}

.runtime-row {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.runtime-node {
  position: relative;
  display: grid;
  min-width: 0;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
}

.runtime-node__index {
  position: absolute;
  top: 0.5rem;
  right: 0.6rem;
  font-family: var(--font-mono);
  font-size: 0.55rem;
  color: var(--muted-foreground);
}

.runtime-node__icon {
  display: flex;
  width: 2.5rem;
  height: 2.5rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  color: var(--muted-foreground);
}

.runtime-node__content {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.runtime-node__content strong {
  overflow: hidden;
  font-family: var(--font-display);
  font-size: 0.95rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.runtime-node__content small {
  margin-top: 0.2rem;
  overflow: hidden;
  color: var(--muted-foreground);
  font-family: var(--font-mono);
  font-size: 0.55rem;
  letter-spacing: 0.06em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.runtime-node--custom {
  color: var(--foreground);
}

.runtime-node--custom .runtime-node__icon {
  border-color: var(--accent);
  color: var(--accent-foreground);
  background: var(--accent);
}

.runtime-bus {
  position: relative;
  display: flex;
  min-height: 3.5rem;
  align-items: center;
  justify-content: center;
}

.runtime-bus__label {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.7rem 1rem;
  border: 1px solid var(--accent);
  background: var(--background);
}

.runtime-bus__label p {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.runtime-bus__label span:not(.size-2) {
  display: block;
  margin-top: 0.2rem;
  color: var(--muted-foreground);
  font-family: var(--font-mono);
  font-size: 0.55rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@media (max-width: 63.999rem) {
  .runtime-topology {
    padding: 4.5rem 1rem 1.5rem 4rem;
  }

  .runtime-row {
    display: contents;
  }

  .runtime-node {
    margin-bottom: 0.75rem;
  }

  .runtime-bus {
    position: absolute;
    top: 1rem;
    right: 1rem;
    left: 1rem;
    justify-content: flex-start;
  }
}
</style>
