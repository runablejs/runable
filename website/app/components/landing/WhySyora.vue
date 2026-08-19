<script setup lang="ts">
import { onMounted, ref } from "vue";

const sectionRef = ref<HTMLElement | null>(null);
const { revealChildren } = useScrollReveal({
  threshold: 0.12,
  rootMargin: "0px 0px -60px 0px",
  y: 18,
});

onMounted(() => {
  revealChildren(sectionRef.value, "[data-reveal]", 90);
});
</script>

<template>
  <section
    ref="sectionRef"
    aria-labelledby="why-heading"
    class="border-y border-border px-6 py-20 sm:px-10 lg:py-28"
  >
    <div
      class="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24"
    >
      <div data-reveal class="sr-hidden">
        <p
          class="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
        >
          02 — Why Syora
        </p>
        <h2
          id="why-heading"
          class="mt-4 text-3xl font-bold tracking-tight sm:text-4xl"
        >
          Framework comfort should not create server lock-in.
        </h2>
      </div>

      <div class="space-y-6 text-lg leading-relaxed text-muted-foreground">
        <p data-reveal class="sr-hidden">
          Vue gives developers a flexible foundation. Meta-frameworks make that
          foundation faster to use, but they often arrive with a server stack
          already chosen for you. That works until your project needs Fastify,
          NestJS, AdonisJS, Express, Hono, or an existing backend.
        </p>
        <p data-reveal class="sr-hidden text-foreground">
          Syora separates the application experience from the HTTP runtime. You
          get conventions for the Vue side and connect them to your server
          through a small adapter.
        </p>
        <p data-reveal class="sr-hidden">
          The result is one application, one routing model, and one familiar
          workflow—without splitting the frontend and backend simply to keep
          control of your infrastructure.
        </p>

        <div data-reveal class="sr-hidden pt-3">
          <UButton variant="outline" size="lg" as-child>
            <SyoraLink to="/why-syora">
              Read why Syora exists
              <UIcon name="tabler:arrow-right" class="size-4" />
            </SyoraLink>
          </UButton>
        </div>
      </div>
    </div>
  </section>
</template>
