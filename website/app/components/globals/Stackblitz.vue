<script lang="ts" setup>
defineProps<{ url?: string }>();
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 my-5 *:my-0">
    <a
      :href="url"
      target="_blank"
      rel="noopener noreferrer"
      class="group my-6 block overflow-hidden border border-border bg-background text-foreground no-underline transition-colors hover:border-accent focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      aria-label="Open this example on StackBlitz"
    >
      <div
        class="flex h-10 items-center justify-between gap-4 border-b border-border bg-muted/20 px-3 sm:px-4"
      >
        <div class="flex min-w-0 items-center gap-3">
          <div class="flex items-center gap-1.5" aria-hidden="true">
            <span class="size-1.5 rounded-full bg-accent" />
            <span class="size-1.5 rounded-full bg-border" />
            <span class="size-1.5 rounded-full bg-border" />
          </div>

          <UIcon
            name="simple-icons:stackblitz"
            class="size-5"
            aria-hidden="true"
          />

          <span
            class="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
          >
            stackblitz
          </span>
        </div>

        <div class="flex shrink-0 items-center gap-2 text-muted-foreground">
          <UIcon
            name="tabler:arrow-up-right"
            class="size-4 transition-colors group-hover:text-accent"
            aria-hidden="true"
          />
        </div>
      </div>

      <div class="p-5">
        <h3 class="font-display text-2xl font-semibold tracking-tight">
          Run it before you install it.
        </h3>
        <p class="mt- max-w-lg text-sm leading-relaxed text-muted-foreground">
          Open a ready-to-use Runable project with a code editor, terminal, and
          live preview directly in your browser.
        </p>
      </div>
    </a>

    <!-- <div
      class="group relative block my-5 p-4 sm:p-6 border border-default rounded-md bg-default transition-colors hover:bg-info/10 hover:border-info outline-info/25 has-[&gt;a:focus-visible]:outline-3 has-[&gt;a:focus-visible]:border-info"
    >
      <a
        :href="url"
        rel="noopener noreferrer"
        target="_blank"
        aria-label="Open on StackBlitz"
        class="focus:outline-none"
        ><span class="absolute inset-0" aria-hidden="true"></span
      ></a>

      <UIcon
        name="simple-icons:stackblitz"
        class="size-6 mb-2 block text-info"
      />

      <UIcon
        name="tabler:arrow-up-right"
        class="size-4 align-top absolute inset-e-2 top-2 text-dimmed pointer-events-none transition-colors group-hover:text-info"
      />

      <p class="text-highlighted font-semibold mt-3">Open on StackBlitz</p>
      <div
        class="text-[15px] text-muted-foreground *:first:mt-0 *:last:mb-0 *:my-1 mt-1"
      >
        <p class="my-5 leading-7 text-pretty">
          Online playground with code editor and terminal access.
        </p>
      </div>
    </div> -->
  </div>
</template>
