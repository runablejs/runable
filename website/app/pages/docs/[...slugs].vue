<script lang="ts" setup>
import { useAsyncState } from "@vueuse/core";

const route = useRoute();

const { data: page } = await useAsyncData("", () =>
  queryCollection("docs")
    .path(route.path.replace(/^\/docs/, ""))
    .first(),
);
console.log(page.value);

// console.log(page.value);
</script>

<template>
  <main class="flex min-h-0 flex-1 flex-col">
    <div class="mx-auto py-16 max-w-3xl">
      {{ page?.html }}
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsum eos
      recusandae enim cupiditate incidunt dolorem impedit? Odio velit labore sit
      deleniti. Eveniet consequatur maxime, repellat quod mollitia eos aliquid
      rerum!
    </div>
  </main>
</template>
