<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import type { ResolvedPageEntry } from "v-content";

type Author = {
  name: string;
  role?: string;
  bio?: string;
  avatar?: string;
  links?: Record<string, string>;
};

const props = defineProps<{
  page: ResolvedPageEntry;
  split?: boolean;
}>();

const authors = shallowRef<Author[]>([]);
let authorRequest = 0;

function getAuthorInitials(author: Author) {
  return author.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const socialIcons: Record<string, string> = {
  github: "simple-icons:github",
  bluesky: "simple-icons:bluesky",
};

watch(
  () => [props.page?.meta.author, props.page?.meta.authors],
  async (value) => {
    const request = ++authorRequest;
    authors.value = [];

    const [author, pageAuthors] = value;
    const values = Array.isArray(pageAuthors)
      ? pageAuthors
      : typeof pageAuthors === "string"
        ? [pageAuthors]
        : typeof author === "string"
          ? [author]
          : [];

    const slugs = [...new Set(values)]
      .filter((slug): slug is string => typeof slug === "string")
      .map((slug) => slug.trim().replace(/^\/+|\/+$/g, ""))
      .filter(Boolean);

    const entries = await Promise.all(
      slugs.map((slug) => queryCollection("authors").path(`/${slug}`).first()),
    );

    if (request === authorRequest) {
      authors.value = entries
        .filter((entry) => entry !== undefined)
        .map((entry) => entry.data as Author);
    }
  },
  { immediate: true },
);
</script>

<template>
  <template v-if="authors.length">
    <div v-if="split" class="flex flex-row flex-wrap items-center gap-12">
      <div
        class="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2"
      >
        <Avatar v-for="author in authors" :key="author.name">
          <AvatarImage
            v-if="author.avatar"
            :src="author.avatar"
            :alt="author.name"
          />
          <AvatarFallback>
            {{ getAuthorInitials(author) }}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>

    <div v-else class="mt-3 flex flex-wrap gap-3">
      <div v-for="author in authors" :key="author.name">
        <div class="flex items-center gap-3">
          <Avatar class="size-9 border">
            <AvatarImage
              v-if="author.avatar"
              :src="author.avatar"
              :alt="author.name"
            />
            <AvatarFallback class="text-xs font-semibold">
              {{ getAuthorInitials(author) }}
            </AvatarFallback>
          </Avatar>

          <div class="min-w-0 leading-none">
            <p class="truncate font-medium text-foreground">
              {{ author.name }}
            </p>
            <p
              v-if="author.role"
              class="truncate text-sm text-muted-foreground"
            >
              {{ author.role }}
            </p>
          </div>
        </div>

        <div v-if="author.links" class="ml-11 flex items-center mt-1 gap-0.5">
          <a
            v-for="(href, network) in author.links"
            :key="network"
            :href="href"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex size-6 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            :aria-label="`${author.name} on ${network}`"
          >
            <UIcon
              :name="socialIcons[network] ?? 'tabler:external-link'"
              class="size-4"
            />
          </a>
        </div>
      </div>
    </div>
  </template>
</template>
