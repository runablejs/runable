<script setup lang="ts">
import type { ResolvedPageEntry } from "v-content";
import BlogAuthors from "~/components/BlogAuthors.vue";
import { Skeleton } from "~/components/ui/skeleton";

function getArticleDate(article: ResolvedPageEntry) {
  const value = article.meta.date ?? article.meta.publishedAt;
  if (typeof value !== "string" && !(value instanceof Date)) return;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatArticleDate(article: ResolvedPageEntry) {
  const date = getArticleDate(article);
  if (!date) return;

  return new Intl.DateTimeFormat("en", {
    dateStyle: "long",
  }).format(date);
}

const { data: articles, pending } = useAsyncData("blog:index", () =>
  queryCollection("blog").all(),
);
</script>

<template>
  <div class="mx-auto w-full max-w-7xl px-10 py-20">
    <div class="max-w-lg mb-15">
      <h1
        data-slot="title"
        class="text-4xl text-pretty tracking-tight font-bold text-highlighted sm:text-4xl"
      >
        The Syora Blog
      </h1>
      <div
        data-slot="description"
        class="mt-6 text-pretty text-muted-foreground text-xl"
      >
        Product updates, technical deep dives, and practical notes from the
        people building Syora.
      </div>
    </div>

    <div
      v-if="pending"
      class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-live="polite"
    >
      <span class="sr-only">Loading articles</span>

      <article
        v-for="index in 6"
        :key="index"
        class="overflow-hidden rounded-md border border-border dark:bg-muted/20"
      >
        <Skeleton class="aspect-video w-full rounded-none" />

        <div class="space-y-4 p-7">
          <Skeleton class="h-3 w-24" />

          <div class="space-y-2">
            <Skeleton class="h-6 w-3/4" />
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-5/6" />
          </div>

          <div class="flex -space-x-2 pt-1">
            <Skeleton class="size-8 rounded-full ring-2 ring-background" />
            <Skeleton class="size-8 rounded-full ring-2 ring-background" />
          </div>
        </div>
      </article>
    </div>

    <div
      v-else-if="articles?.length"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
    >
      <SyoraLink
        v-for="article in articles"
        :key="article.path"
        :to="`/blog${article.path}`"
      >
        <article
          class="group relative dark:bg-muted/20 border border-border rounded-md overflow-hidden"
          style="
            transition:
              opacity 200ms ease-out,
              transform 200ms ease-out,
              border-color 150ms ease-out;
          "
        >
          <div
            v-if="article.meta.cover"
            class="relative overflow-hidden aspect-video w-full pointer-events-none"
          >
            <img
              width="437"
              height="246"
              data-nuxt-img=""
              :alt="article.meta.title"
              :src="article.meta.cover"
              data-slot="image"
              class="object-cover object-top w-full h-full transform transition-transform duration-200 group-hover/blog-post:scale-110"
            />
          </div>
          <div class="relative p-7">
            <div
              class="absolute left-0 top-8 w-0.75 h-10 bg-accent dark:bg-accent rounded-r-md transition-transform duration-fast ease-default group-hover:scale-y-110 origin-top"
              aria-hidden="true"
            />
            {{ formatArticleDate(article) }}
            <h3 class="font-display text-h4 text-neutral mb-">
              {{ article.meta.title ?? article.path }}
            </h3>

            <p
              v-if="article.meta.description"
              class="font-body text-small text- leading-relaxed mt-1"
            >
              {{ article.meta.description }}
            </p>

            <div class="mt-5">
              <BlogAuthors :page="article" split />
            </div>
          </div>
        </article>
      </SyoraLink>
    </div>

    <p v-else class="border-y py-6 text-sm text-muted-foreground">
      No articles published yet.
    </p>
  </div>
</template>
