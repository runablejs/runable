<script setup lang="ts">
const { data: health } = await useFetch<{ status: string }>("/api/health");
</script>

<template>
  <main>
    <p class="eyebrow">Runable starter</p>
    <h1>Your application is ready.</h1>
    <p>Frontend and server are connected.</p>
    <p class="health">API status: {{ health?.status ?? "loading" }}</p>
  </main>
</template>

<style scoped>
:global(*) { box-sizing: border-box; }
:global(body) { margin: 0; background: #0d1117; color: #f0f6fc; font-family: Inter, system-ui, sans-serif; }
main { min-height: 100vh; display: grid; place-content: center; padding: 2rem; text-align: center; }
.eyebrow { color: #58a6ff; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
h1 { margin: .25rem 0; font-size: clamp(2.5rem, 7vw, 5rem); }
.health { color: #3fb950; }
</style>

