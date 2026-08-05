<script lang="ts" setup>
const { data, refresh } = await useAsyncData("fsdfsdf", () => {
  return queryCollection("docs").path("/docs/get-started").first();
});
</script>

<template>
  <button @click="refresh()">refresh</button>
  <MDC v-if="data" :value="data.html" />

  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Suscipit nemo Lorem,
  Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt ipsa ex
  blanditiis cum veniam, soluta architecto, at aliquid modi obcaecati facere
  quidem consequatur sapiente odit eum? Sapiente aliquam tenetur minima! ss sf
  sf ddf
</template>
