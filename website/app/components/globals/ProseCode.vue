<script lang="ts" setup>
defineProps<{
  block?: boolean;
}>();
</script>

<template>
  <code class="rounded-sm px-1 py-0.5 text-sm font-mono bg-input">
    <slot />
  </code>
</template>
