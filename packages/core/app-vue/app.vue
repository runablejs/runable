<script lang="ts" setup>
import { app } from ":app-vue";
import Layout from "./layout.vue";
</script>

<template>
  <template v-if="app">
    <app />
  </template>
  <template v-else>
    <Layout>
      <RouterView />
    </Layout>
  </template>
</template>
