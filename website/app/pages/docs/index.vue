<script lang="ts" setup>
import MDC from "v-content/components/MDC.js";

const { data: page } = useAsyncData("sdfsf", () => {
  return queryCollection("docs")
    .path("/getting-started/directory-structure")
    .first();
  // $fetch("https://jsonplaceholder.typicode.com/todos/1"),
});
</script>

<template>
  <template v-if="page">
    <div class="mx-auto py-16 max-w-4xl w-11/12">
      <div class="v-content space-y-3">
        <MDC :value="page.html" />
      </div>
    </div>
  </template>
</template>
