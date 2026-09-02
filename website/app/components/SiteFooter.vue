<script setup lang="ts">
import Logo from "./navbar-components/Logo.vue";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Why Runable", to: "/why-runable" },
      { label: "Documentation", to: "/docs" },
      { label: "Installation", to: "/docs/getting-started/installation" },
      { label: "Integrations", to: "/docs/integrations" },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "About", to: "/about" },
      { label: "Blog", to: "/blog" },
      { label: "Changelog", to: "/changelog" },
      { label: "Sponsor", href: "https://github.com/sponsors/domutala" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "GitHub", href: "https://github.com/runablejs/runable" },
      { label: "Issues", href: "https://github.com/runablejs/runable/issues" },
      {
        label: "Discussions",
        href: "https://github.com/runablejs/runable/discussions",
      },
      {
        label: "Bluesky",
        href: "https://bsky.app/profile/runablejs.bsky.social",
      },
    ],
  },
];

const year = new Date().getFullYear();
</script>

<template>
  <footer class="border-t border-border bg-muted/20 dark:bg-muted/5">
    <div class="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
      <div class="grid gap-14 py-16 lg:grid-cols-[1.2fr_1.8fr] lg:py-20">
        <div class="max-w-md">
          <RunableLink to="/" class="inline-flex items-center gap-3">
            <span
              class="flex size-8 items-center justify-center bg-foreground text-background"
            >
              <div class="size-8/12">
                <Logo />
              </div>
            </span>
            <span class="font-display text-2xl font-semibold">Runable</span>
          </RunableLink>

          <p class="mt-6 text-base leading-relaxed text-muted-foreground">
            The Vue framework that brings productive conventions to any backend.
          </p>

          <div class="mt-8 flex items-center gap-2">
            <a
              href="https://github.com/runablejs/runable"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Runable on GitHub"
              class="flex size-8 items-center justify-center border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <UIcon name="simple-icons:github" class="size-4" />
            </a>

            <a
              href="https://bsky.app/profile/runablejs.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Runable on Bluesky"
              class="flex size-8 items-center justify-center border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <UIcon name="simple-icons:bluesky" class="size-4" />
            </a>
            <a
              href="https://x.com/runablejs"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sponsor Runable"
              class="flex size-8 items-center justify-center border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <UIcon name="simple-icons:x" class="size-4" />
            </a>
            <a
              href="https://linkedin.com/company/runablejs"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sponsor Runable"
              class="flex size-8 items-center justify-center border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <UIcon name="simple-icons:linkedin" class="size-4" />
            </a>

            <a
              href="https://discord.gg/34DJfyQUu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sponsor Runable"
              class="flex size-8 items-center justify-center border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <UIcon name="simple-icons:discord" class="size-4" />
            </a>
          </div>
        </div>

        <nav
          class="grid grid-cols-2 gap-10 sm:grid-cols-3"
          aria-label="Footer navigation"
        >
          <div v-for="group in footerLinks" :key="group.title">
            <h2
              class="font-mono text-xs uppercase tracking-[0.18em] text-foreground"
            >
              {{ group.title }}
            </h2>
            <ul class="mt-5 space-y-3">
              <li v-for="link in group.links" :key="link.label">
                <a
                  v-if="link.href"
                  :href="link.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-accent"
                >
                  {{ link.label }}
                  <UIcon
                    name="tabler:arrow-up-right"
                    class="size-3 opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </a>
                <RunableLink
                  v-else
                  :to="link.to!"
                  class="text-sm text-muted-foreground transition-colors hover:text-accent"
                >
                  {{ link.label }}
                </RunableLink>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div
        class="flex flex-col gap-4 border-t border-border py-6 font-mono text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
      >
        <p>© {{ year }} Runable. Released under the MIT License.</p>
        <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span class="inline-flex items-center gap-2">
            <span class="size-1.5 rounded-full bg-accent" />
            Open source
          </span>
          <span>Built with Vue and Runable</span>
        </div>
      </div>
    </div>
  </footer>
</template>
