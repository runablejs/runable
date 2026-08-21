<script setup lang="ts">
import { toArray } from "@/utils/to-array.js";
import BlogPage from "~/components/BlogPage.vue";

const route = useRoute();

const slugs = computed(() => {
  const params = route.params as { slugs: string | string[] };
  const slugs = toArray(params.slugs);

  return slugs
    .map((slug) => slug.split("/"))
    .flat()
    .filter(Boolean);
});

const contentPath = computed(() => {
  return `/${slugs.value.join("/")}`.replace(/\.md$/, "");
});

const { data: page, pending } = useAsyncData(
  `blog:${slugs.value.join("/")}`,
  () => queryCollection("blog").path(contentPath.value).first(),
);
</script>

<template>
  <BlogPage :page :pending />
</template>
