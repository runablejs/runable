<script setup lang="ts">
const { github } = useAppConfig();
</script>

<template>
  <UGithubLink v-slot="{ href }">
    <UButton as-child size="sm" variant="ghost" class="h-8 shadow-none">
      <a :href target="_blank" rel="noreferrer">
        <UIcon name="simple-icons:github" />
      </a>
    </UButton>
  </UGithubLink>
</template>
