<script setup lang="ts">
import MDC from "v-content/components/MDC.js";
import { Skeleton } from "./ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

import type { ResolvedPageEntry } from "v-content";
import BlogAuthors from "./BlogAuthors.vue";

const props = defineProps<{
  page?: ResolvedPageEntry | null;
  pending: boolean;
}>();

watch(
  () => props.page,
  () => {
    // useHead({
    //   title: props.page?.meta.title,
    //   meta: [{ name: "description", content: props.page?.meta.description }],
    // });
  },
  { immediate: true },
);
</script>

<template>
  <div
    v-if="pending"
    data-slot="blog-skeleton"
    class="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 lg:py-16"
    aria-busy="true"
    aria-live="polite"
  >
    <span class="sr-only">Loading article</span>

    <div class="space-y-3">
      <Skeleton class="h-10 w-3/5 sm:w-2/5" />
      <Skeleton class="h-5 w-4/5" />
    </div>

    <div class="space-y-8 pt-2">
      <div class="space-y-3">
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-11/12" />
        <Skeleton class="h-4 w-4/5" />
      </div>
      <Skeleton class="h-44 w-full" />
      <div class="space-y-3">
        <Skeleton class="h-7 w-2/5" />
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-5/6" />
      </div>
    </div>
  </div>

  <article
    v-else-if="page"
    data-slot="blog"
    class="mx-auto w-full max-w-4xl flex flex-1 flex-col gap-8 px-4 py-10 text-[1.05rem] text-foreground sm:text-[15px] lg:py-16"
  >
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink as-child>
            <RunableLink to="/blog"> Blog </RunableLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>
            {{ page.meta.title }}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <header class="flex flex-col gap-3">
      <h1
        v-if="page.meta.title"
        class="scroll-m-24 text-3xl font-semibold tracking-tight sm:text-4xl"
      >
        {{ page.meta.title }}
      </h1>
      <p
        v-if="page.meta.description"
        class="text-[1.05rem] text-muted-foreground sm:text-base sm:text-balance"
      >
        {{ page.meta.description }}
      </p>

      <BlogAuthors :page />
    </header>

    <div class="v-content space-y-3">
      <MDC :value="page.html" />
    </div>
  </article>
</template>
