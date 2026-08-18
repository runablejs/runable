<script setup lang="ts">
const { github } = useAppConfig();
</script>

<template>
  <UButton as-child size="sm" variant="ghost" class="h-8 shadow-none">
    <a
      :href="`https://github.com/${github.repo}`"
      target="_blank"
      rel="noreferrer"
    >
      <UIcon name="simple-icons:github" />
    </a>
  </UButton>
</template>
