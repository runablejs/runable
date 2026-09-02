<script setup lang="ts">
import SiteHeader from "../components/SiteHeader.vue";
import SiteFooter from "../components/SiteFooter.vue";
import { SITE_URL } from "../lib/site-config";

const ogImage = `${SITE_URL}/images/og-image.png`;

useSeoMeta({
  ogTitle: "All the Vue conventions. Your server runtime.",
  ogDescription:
    "Build complete Vue applications with file-system routing, SSR, data fetching, modules, and generated types—on the backend runtime that fits your project.",
  ogImage,
  ogImageAlt: "Runable — All the Vue conventions. Your server runtime.",
  ogImageWidth: 851,
  ogImageHeight: 315,
  ogImageType: "image/png",
  twitterCard: "summary_large_image",
  twitterImage: ogImage,
  twitterImageAlt: "Runable — All the Vue conventions. Your server runtime.",
});
</script>

<template>
  <div
    data-slot="layout"
    class="group/layout relative z-10 flex min-h-svh flex-col bg-background has-data-[slot=designer]:h-svh has-data-[slot=designer]:overflow-hidden"
  >
    <SiteHeader />
    <main class="flex min-h-0 flex-1 flex-col">
      <slot />
    </main>

    <SiteFooter />
  </div>
</template>
