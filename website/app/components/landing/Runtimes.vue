<script setup lang="ts">
import { ref, onMounted } from "vue";

const gridRef = ref<HTMLElement | null>(null);
const runtimeHeadings = ref<HTMLElement | null>(null);
const runtimeGridRef = ref<HTMLElement | null>(null);

const { reveal, revealChildren } = useScrollReveal({
  threshold: 0.1,
  rootMargin: "0px 0px -40px 0px",
  y: 16,
});

onMounted(() => {
  revealChildren(gridRef.value, "article", 60);
  reveal(runtimeHeadings.value);
  revealChildren(runtimeGridRef.value, "article", 60);
});

const runtimeServers = [
  {
    name: "Fastify",
    icon: "simple-icons:fastify",
    to: "/docs/integrations/fastify",
  },
  {
    name: "NestJS",
    icon: "simple-icons:nestjs",
    to: "/docs/integrations/nestjs",
  },
  {
    name: "Koa",
    icon: "simple-icons:koa",
    to: "/docs/integrations/koa",
  },
  {
    name: "Express",
    icon: "simple-icons:express",
    to: "/docs/integrations/express",
  },
  {
    name: "Hono",
    icon: "simple-icons:hono",
    to: "/docs/integrations/hono",
  },
  // {
  //   name: "Nitro",
  //   icon: "unjs:nitro",
  //   code: "nitro",
  // },
  {
    name: "AdonisJS",
    icon: "simple-icons:adonisjs",
    to: "/docs/integrations/adonisjs",
  },
  {
    name: "Deno",
    icon: "simple-icons:deno",
    to: "/docs/integrations/deno",
  },
  {
    name: "Bun",
    icon: "simple-icons:bun",
    to: "/docs/integrations/bun",
  },
  {
    name: "Custom",
    icon: "lucide:code-xml",
    to: "/docs/integrations/custom",
  },
];
</script>

<template>
  <section
    class="relative w-full transition-colors duration-base ease-smooth"
    aria-labelledby="runtimes-heading"
  >
    <div class="w-full h-px bg-border-default" aria-hidden="true" />

    <div class="mx-auto max-w-7xl px-10 py-32 md:py-40">
      <p class="font-mono text-mono-sm text-tertiary tracking-[0.08em] mb-8">
        04 — Runtimes
      </p>

      <h2
        ref="runtimeHeadings"
        id="runtimes-heading"
        class="font-display text-h2 text-neutral mb-16 md:mb-20 sr-hidden"
        style="
          transition:
            opacity 300ms ease-out,
            transform 300ms ease-out;
        "
      >
        Run on anything.<br class="hidden md:block" />
        Deploy anywhere.
      </h2>

      <div
        ref="runtimeGridRef"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
      >
        <RunableLink
          v-for="(rt, r) in runtimeServers"
          :key="rt.name"
          :to="rt.to"
          :aria-label="`Read the ${rt.name} integration documentation`"
          class="group relative bg-muted/10 dark:bg-muted/20 border border-border rounded-md p-6 flex flex-col items- text- transition-all duration-fast ease-default hover:border-strong hover:-translate-y-px sr-hiddend"
          style="
            transition:
              opacity 200ms ease-out,
              transform 200ms ease-out,
              border-color 150ms ease-out;
          "
        >
          <div
            class="absolute left-0 top-6 w-0.75 h-10 bg-accent dark:bg-accent/30 rounded-r-md transition-transform duration-fast ease-default group-hover:scale-y-110 origin-top"
            aria-hidden="true"
          />

          <p class="font-mono text-mono-sm text-tertiary tracking-wide mb-4">
            RT.{{ (r + 1).toString().padStart(2, "0") }}
          </p>

          <div
            class="mb-4 text-neutral group-hover:text-accent transition-colors duration-fast ease-default"
          >
            <!-- <svg
              v-if="rt.code === 'nitro'"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              class="w-10 h-10 mx-auto"
              fill="currentColor"
            >
              <path
                d="M28.173 5.616C22.438-1.107 12.34-1.907 5.617 3.828s-7.524 15.834-1.789 22.557s15.834 7.523 22.557 1.788s7.523-15.834 1.788-22.557m-7.97 8.398c.616 0 1.01.668.7 1.202l-.089.153l-6.038 9.935a.62.62 0 0 1-.529.297h-.576a.604.604 0 0 1-.585-.755l1.638-6.335a.8.8 0 0 0-.774-1h-2.517a.8.8 0 0 1-.774-1l2.472-9.565a.74.74 0 0 1 .716-.544q.061 0 .107.002h2.535a.8.8 0 0 1 .793.908l-.016.114l-.966 5.653a.8.8 0 0 0 .788.935z"
                clip-rule="evenodd"
              />
            </svg> -->

            <UIcon
              :name="rt.icon"
              class="w-10 h-10 mx-auto"
              aria-hidden="true"
            />
          </div>

          <h3 class="font-display text-h5 text-center">
            {{ rt.name }}
          </h3>
        </RunableLink>
      </div>

      <p class="mt-7 max-w-3xl">
        And any other runtime capable of handling HTTP requests.
      </p>
    </div>

    <!-- <div class="w-full h-px border-t border-default" aria-hidden="true" /> -->
  </section>
</template>
