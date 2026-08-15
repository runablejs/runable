<script setup lang="ts">
import SiteHeader from "../components/SiteHeader.vue";

// useSeoMeta({
//   title: siteConfig.name,
//   titleTemplate: `%s - ${siteConfig.name}`,
//   description: siteConfig.description,
// })

// defineOgImage('Custom')
</script>

<template>
  <div
    data-slot="layout"
    class="group/layout relative z-10 flex min-h-svh flex-col bg-background has-data-[slot=designer]:h-svh has-data-[slot=designer]:overflow-hidden"
  >
    <SiteHeader />

    <slot />

    <!-- <SiteFooter /> -->
  </div>
</template>
