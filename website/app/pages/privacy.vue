<script setup lang="ts">
const sections = [
  { number: "01", label: "Information we collect", id: "information" },
  { number: "02", label: "How we use information", id: "use" },
  { number: "03", label: "Cookies and storage", id: "storage" },
  { number: "04", label: "Services and links", id: "services" },
  { number: "05", label: "Retention and choices", id: "choices" },
  { number: "06", label: "Changes and contact", id: "contact" },
] as const;

useHead({
  title: "Privacy Policy",
  meta: [
    {
      name: "description",
      content:
        "How the Runable website collects, uses, and protects information.",
    },
  ],
});

useSeoMeta({
  ogTitle: "Privacy Policy",
  ogDescription:
    "How the Runable website collects, uses, and protects information.",
});
</script>

<template>
  <div class="overflow-hidden">
    <header class="border-b border-border">
      <div
        class="mx-auto grid max-w-7xl lg:min-h-[34rem] lg:grid-cols-[0.72fr_1.28fr]"
      >
        <div
          class="flex flex-col justify-between border-border bg-muted/25 px-6 py-10 sm:px-10 lg:border-r lg:px-12 lg:py-14"
        >
          <div
            class="flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground"
          >
            <span>Legal</span>
            <span>Runable / Privacy</span>
          </div>

          <div class="my-16 max-w-sm lg:my-10">
            <span
              class="mb-6 flex size-12 items-center justify-center bg-accent text-accent-foreground"
            >
              <UIcon name="tabler:shield-lock" class="size-6" />
            </span>
            <p class="text-lg leading-relaxed text-muted-foreground">
              A plain-language account of the limited information used to run
              and improve this website.
            </p>
          </div>

          <p
            class="border-t border-border pt-5 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground"
          >
            Last updated · September 2, 2026
          </p>
        </div>

        <div class="flex items-center px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
          <div class="max-w-4xl">
            <p
              class="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-accent"
            >
              Privacy policy
            </p>
            <h1
              class="font-display text-5xl font-bold leading-[1.04] tracking-tight sm:text-7xl"
            >
              Your privacy should be
              <em class="font-display italic text-accent">understandable.</em>
            </h1>
            <p
              class="mt-9 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
            >
              Runable collects only the information needed to operate,
              understand, and improve runablejs.com. We do not sell personal
              information or use it for targeted advertising.
            </p>
          </div>
        </div>
      </div>
    </header>

    <main class="px-6 py-20 sm:px-10 lg:py-28">
      <div
        class="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-20"
      >
        <aside>
          <nav
            class="border border-border bg-muted/15 p-5 lg:sticky lg:top-24"
            aria-label="Privacy policy sections"
          >
            <p
              class="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              On this page
            </p>
            <a
              v-for="section in sections"
              :key="section.id"
              :href="`#${section.id}`"
              class="group flex items-center gap-3 border-t border-border py-3 text-sm first:border-t-0 first:pt-0 last:pb-0"
            >
              <span class="font-mono text-[10px] text-muted-foreground">
                {{ section.number }}
              </span>
              <span
                class="text-muted-foreground transition-colors group-hover:text-accent"
              >
                {{ section.label }}
              </span>
            </a>
          </nav>
        </aside>

        <article class="min-w-0 max-w-3xl">
          <section id="information" class="scroll-mt-24 border-b pb-14">
            <p class="font-mono text-xs text-accent">01</p>
            <h2 class="mt-3 font-display text-3xl font-semibold tracking-tight">
              Information we collect
            </h2>
            <div class="mt-6 space-y-5 leading-relaxed text-muted-foreground">
              <p>
                When you browse the site, our infrastructure and analytics
                service may process technical information such as the pages you
                visit, referral source, approximate location, browser, device,
                operating system, timestamps, and IP address.
              </p>
              <p>
                Session recordings may capture navigation, clicks, scrolling,
                and interactions with the interface so we can identify broken
                or confusing experiences. Do not submit secrets or personal
                information through examples, searches, or public links.
              </p>
              <p>
                We receive information you choose to provide when you contact
                the project or participate through GitHub, Discord, Bluesky, or
                another community platform.
              </p>
            </div>
          </section>

          <section id="use" class="scroll-mt-24 border-b py-14">
            <p class="font-mono text-xs text-accent">02</p>
            <h2 class="mt-3 font-display text-3xl font-semibold tracking-tight">
              How we use information
            </h2>
            <p class="mt-6 leading-relaxed text-muted-foreground">
              We use this information to deliver the website, keep it secure,
              diagnose failures, understand which documentation is useful, and
              improve Runable. We may also use messages you send to answer your
              request and maintain project records.
            </p>
          </section>

          <section id="storage" class="scroll-mt-24 border-b py-14">
            <p class="font-mono text-xs text-accent">03</p>
            <h2 class="mt-3 font-display text-3xl font-semibold tracking-tight">
              Cookies and local storage
            </h2>
            <div class="mt-6 space-y-5 leading-relaxed text-muted-foreground">
              <p>
                The site may store small values in your browser to remember
                interface preferences, including the documentation sidebar
                state and color mode. These values support site functionality;
                they are not used to build an advertising profile.
              </p>
              <p>
                Your browser lets you remove or block cookies and local storage.
                Some preferences may reset or stop persisting if you do.
              </p>
            </div>
          </section>

          <section id="services" class="scroll-mt-24 border-b py-14">
            <p class="font-mono text-xs text-accent">04</p>
            <h2 class="mt-3 font-display text-3xl font-semibold tracking-tight">
              Services and external links
            </h2>
            <div class="mt-6 space-y-5 leading-relaxed text-muted-foreground">
              <p>
                Runable uses hosting and analytics infrastructure to serve and
                measure the website. Those providers may process technical data
                on our behalf to provide their services and protect their
                systems.
              </p>
              <p>
                Links to services such as GitHub, npm, Discord, Bluesky, and
                StackBlitz take you to websites governed by their own privacy
                policies. Runable does not control how those services process
                your information.
              </p>
            </div>
          </section>

          <section id="choices" class="scroll-mt-24 border-b py-14">
            <p class="font-mono text-xs text-accent">05</p>
            <h2 class="mt-3 font-display text-3xl font-semibold tracking-tight">
              Retention and your choices
            </h2>
            <div class="mt-6 space-y-5 leading-relaxed text-muted-foreground">
              <p>
                We retain information only for as long as it remains useful for
                the purposes described above, or as required to protect the
                project and meet legal obligations. Retention periods can vary
                by data type and service provider.
              </p>
              <p>
                You can limit analytics through browser privacy controls,
                content blockers, or JavaScript settings. You may also ask about
                information connected to a message you sent us. We may need
                enough detail to identify the relevant record and verify the
                request.
              </p>
            </div>
          </section>

          <section id="contact" class="scroll-mt-24 pt-14">
            <p class="font-mono text-xs text-accent">06</p>
            <h2 class="mt-3 font-display text-3xl font-semibold tracking-tight">
              Changes and contact
            </h2>
            <div class="mt-6 space-y-5 leading-relaxed text-muted-foreground">
              <p>
                We may revise this policy when the website or the services it
                uses change. The date at the top of the page shows the latest
                revision.
              </p>
              <p>
                For a privacy question or request, contact the maintainers
                through GitHub Discussions. Avoid posting sensitive information
                in a public thread.
              </p>
            </div>

            <a
              href="https://github.com/runablejs/runable/discussions"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-8 inline-flex min-h-11 items-center gap-2 bg-accent px-4 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
            >
              Contact the maintainers
              <UIcon name="tabler:arrow-up-right" class="size-4" />
            </a>
          </section>
        </article>
      </div>
    </main>
  </div>
</template>
