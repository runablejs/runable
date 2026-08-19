<script setup lang="ts">
const values = [
  {
    number: "01",
    title: "Clarity over magic",
    description:
      "Conventions should save time without making the application impossible to understand. Generated code stays inspectable and the Vue model remains visible.",
    icon: "tabler:eye",
  },
  {
    number: "02",
    title: "Interoperability first",
    description:
      "Syora should fit into an existing stack. It builds on open interfaces and works with the tools teams have already chosen.",
    icon: "tabler:arrows-join-2",
  },
  {
    number: "03",
    title: "Useful defaults",
    description:
      "The common path should be fast and coherent. Advanced applications must still be able to replace, extend, or configure each layer.",
    icon: "tabler:adjustments",
  },
  {
    number: "04",
    title: "Built in public",
    description:
      "Decisions, experiments, and shortcomings belong in the open. Feedback from real projects is part of how the framework gets better.",
    icon: "tabler:world",
  },
];
</script>

<template>
  <div class="overflow-hidden">
    <section class="border-b border-border">
      <div
        class="mx-auto grid min-h-[72svh] max-w-7xl lg:grid-cols-[0.72fr_1.28fr]"
      >
        <div
          class="flex flex-col justify-between border-border bg-muted/25 px-6 py-10 sm:px-10 lg:border-r lg:px-12 lg:py-14"
        >
          <div
            class="flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground"
          >
            <span>About</span>
            <span>Syora / Project</span>
          </div>

          <div class="my-20 max-w-sm lg:my-12">
            <span
              class="mb-6 flex size-12 items-center justify-center rounded-md bg-accent text-accent-foreground"
            >
              <UIcon name="tabler:braces" class="size-6" />
            </span>
            <p class="text-xl leading-relaxed text-muted-foreground">
              An independent open-source project exploring how productive Vue
              conventions can work with any backend.
            </p>
          </div>

          <a
            href="https://github.com/syorajs/syora"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-between border-t border-border pt-5 font-mono text-xs uppercase tracking-[0.14em] transition-colors hover:text-accent"
          >
            Open source · MIT
            <UIcon name="simple-icons:github" class="size-4" />
          </a>
        </div>

        <div class="flex items-center px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
          <div class="max-w-4xl">
            <p
              class="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-accent"
            >
              A framework and a point of view
            </p>
            <h1
              class="font-display text-5xl font-bold leading-[1.04] tracking-tight sm:text-7xl"
            >
              Good developer experience should expand
              <em class="font-display italic text-accent">your choices.</em>
            </h1>
            <p
              class="mt-9 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
            >
              Syora is built around a simple belief: frontend productivity and
              backend freedom can belong in the same application.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="border-b border-border px-6 py-24 sm:px-10 lg:py-32">
      <div
        class="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.55fr_1.45fr] lg:gap-24"
      >
        <div>
          <p
            class="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            The origin
          </p>
          <p class="mt-4 font-mono text-xs text-muted-foreground">01 / 03</p>
        </div>

        <div>
          <h2
            class="max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl"
          >
            Syora started with a practical frustration, not a plan to create
            another framework.
          </h2>
          <div
            class="mt-10 grid gap-8 text-lg leading-relaxed text-muted-foreground md:grid-cols-2"
          >
            <p>
              Vue made interface development enjoyable. Backend frameworks made
              complex server applications maintainable. Bringing both into one
              project still meant giving up the conventions of a modern Vue
              meta-framework or accepting a server runtime chosen elsewhere.
            </p>
            <p>
              Syora began as an attempt to remove that trade-off. The project
              now focuses on a small application layer that connects Vue, Vite,
              routing, rendering, and data loading to the server already in
              place.
            </p>
          </div>

          <blockquote
            class="mt-12 border-l-2 border-accent py-2 pl-7 font-display text-2xl leading-relaxed sm:text-3xl"
          >
            “The backend should be a deliberate architectural choice—not a side
            effect of the frontend tooling.”
          </blockquote>
        </div>
      </div>
    </section>

    <section
      class="border-b border-border bg-muted/20 px-6 py-24 sm:px-10 lg:py-32"
    >
      <div class="mx-auto max-w-6xl">
        <div class="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <p
              class="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              How we build
            </p>
            <p class="mt-4 font-mono text-xs text-muted-foreground">02 / 03</p>
          </div>
          <h2
            class="font-display text-3xl font-bold tracking-tight sm:text-5xl"
          >
            Four principles guide the work.
          </h2>
        </div>

        <div class="mt-14 grid gap-3 md:grid-cols-2">
          <article
            v-for="value in values"
            :key="value.number"
            class="group relative overflow-hidden rounded-md border border-border bg-background p-7 transition-all hover:-translate-y-px hover:border-strong sm:p-9 dark:bg-muted/20"
          >
            <span
              aria-hidden="true"
              class="absolute left-0 top-8 h-12 w-0.75 rounded-r-md bg-accent"
            />
            <div class="flex items-center justify-between">
              <span class="font-mono text-xs text-muted-foreground">{{
                value.number
              }}</span>
              <span
                class="flex size-10 items-center justify-center rounded-md bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground"
              >
                <UIcon :name="value.icon" class="size-5" />
              </span>
            </div>
            <h3 class="mt-10 font-display text-2xl font-semibold">
              {{ value.title }}
            </h3>
            <p class="mt-3 max-w-md leading-relaxed text-muted-foreground">
              {{ value.description }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <section class="border-b border-border px-6 py-24 sm:px-10 lg:py-32">
      <div
        class="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.55fr_1.45fr] lg:gap-24"
      >
        <div>
          <p
            class="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            Maintainer
          </p>
          <p class="mt-4 font-mono text-xs text-muted-foreground">03 / 03</p>
        </div>

        <div class="grid gap-10 sm:grid-cols-[180px_1fr] sm:items-start">
          <div class="relative">
            <div
              aria-hidden="true"
              class="absolute -inset-3 rounded-md border border-dashed border-border"
            />
            <img
              src="/images/authors/domutala.webp"
              alt="Mamadou Talla DIA"
              class="relative aspect-square w-full rounded-full object-cover"
            />
            <span
              aria-hidden="true"
              class="absolute -bottom-3 -right-3 size-6 rounded-sm bg-accent"
            />
          </div>

          <div>
            <p
              class="font-mono text-xs uppercase tracking-[0.18em] text-accent"
            >
              Creator and maintainer
            </p>
            <h2
              class="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Mamadou Talla DIA
            </h2>
            <p
              class="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
            >
              Mamadou created Syora and leads its technical direction. The work
              is developed openly with the Syora community, contributors, and
              developers testing the framework in their own stacks.
            </p>
            <div class="mt-8 flex flex-wrap gap-3">
              <UButton variant="outline" as-child>
                <a
                  href="https://github.com/domutala"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <UIcon name="simple-icons:github" class="size-4" />
                  GitHub
                </a>
              </UButton>
              <UButton variant="outline" as-child>
                <a
                  href="https://bsky.app/profile/domutala.bsky.social"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <UIcon name="simple-icons:bluesky" class="size-4" />
                  Bluesky
                </a>
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="px-6 py-24 sm:px-10 lg:py-32">
      <div
        class="mx-auto max-w-6xl overflow-hidden rounded-md bg-accent text-accent-foreground"
      >
        <div class="grid lg:grid-cols-[1.35fr_0.65fr]">
          <div class="p-8 sm:p-12 lg:p-16">
            <p class="font-mono text-xs uppercase tracking-[0.2em] opacity-70">
              Join the project
            </p>
            <h2
              class="mt-5 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl"
            >
              Syora grows through code, questions, experiments, and honest
              feedback.
            </h2>
            <p class="mt-6 max-w-2xl text-lg leading-relaxed opacity-80">
              Try it, report what feels rough, propose an API, improve the docs,
              or contribute a runtime adapter. Every useful contribution moves
              the project forward.
            </p>
          </div>

          <div
            class="flex flex-col justify-end border-t border-accent-foreground/20 p-8 lg:border-l lg:border-t-0 lg:p-10"
          >
            <UButton variant="secondary" size="lg" as-child>
              <a
                href="https://github.com/syorajs/syora"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contribute on GitHub
                <UIcon name="tabler:arrow-up-right" class="size-4" />
              </a>
            </UButton>
            <UButton
              variant="ghost"
              size="lg"
              as-child
              class="mt-3 hover:bg-accent-foreground/10 hover:text-accent-foreground"
            >
              <SyoraLink to="/docs/getting-started/installation">
                Build with Syora
              </SyoraLink>
            </UButton>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
