<script lang="ts" setup>
defineProps<{ url?: string }>();
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 my-5 *:my-0">
    <div
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
    </div>
  </div>
</template>
