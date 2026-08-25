<script setup lang="ts">
const { github } = useAppConfig();
</script>

<template>
  <slot :href="`https://github.com/${github.repo}`" />
</template>
