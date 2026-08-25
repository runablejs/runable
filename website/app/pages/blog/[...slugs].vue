<script setup lang="ts">
import BlogPage from "~/components/BlogPage.vue";
import { toArray } from "~/utils/to-array";

const route = useRoute();

const slugs = computed(() => {
  const params = route.params as { slugs: string | string[] };
  const slugs = toArray(params.slugs);

  return slugs
    .map((slug) => slug.split("/"))
    .flat()
    .filter(Boolean);
});

const path = computed(() => {
  return `/${slugs.value.join("/")}`
    .replace(/\.md$/, "")
    .replace(/\/$/, "")
    .replace(/\/index$/, "");
});

const { data: page, pending } = await useAsyncData(
  `blog:${slugs.value.join("/")}`,
  () => queryCollection("blog").path(path.value).first(),
);
</script>

<template>
  <BlogPage :page :pending />
</template>
