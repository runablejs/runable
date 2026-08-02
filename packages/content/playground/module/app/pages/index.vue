<script lang="ts" setup>
// import MDC from "../../../../app/components/MDC.vue";

const { data } = await useAsyncData("fsdfsdf", () =>
  $fetch("http://localhost:5173/api/content/docs/documentation/get-started"),
);
</script>

<template>
  <MDC v-if="data" :value="data.html" />
</template>
