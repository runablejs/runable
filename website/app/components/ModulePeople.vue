<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

type Person = {
  slug: string;
  name: string;
  role?: string;
  avatar?: string;
  links?: Record<string, string>;
};

const props = defineProps<{
  author?: unknown;
  contributors?: unknown;
}>();

const author = shallowRef<Person>();
const contributors = shallowRef<Person[]>([]);
let requestId = 0;

function normalizeSlugs(value: unknown): string[] {
  const values = Array.isArray(value) ? value : [value];

  return [...new Set(values)]
    .filter((slug): slug is string => typeof slug === "string")
    .map((slug) => slug.trim().replace(/^\/+|\/+$/g, ""))
    .filter(Boolean);
}

async function resolvePeople(slugs: string[]) {
  const entries = await Promise.all(
    slugs.map(async (slug) => {
      const entry = await queryCollection("authors").path(`/${slug}`).first();
      return entry ? ({ slug, ...entry.data } as Person) : undefined;
    }),
  );

  return entries.filter((person): person is Person => person !== undefined);
}

function initials(name: string) {
  return name
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
  () => [props.author, props.contributors],
  async ([authorValue, contributorsValue]) => {
    const currentRequest = ++requestId;
    const authorSlug = normalizeSlugs(authorValue)[0];
    const contributorSlugs = normalizeSlugs(contributorsValue).filter(
      (slug) => slug !== authorSlug,
    );
    const [resolvedAuthor, resolvedContributors] = await Promise.all([
      authorSlug ? resolvePeople([authorSlug]) : Promise.resolve([]),
      resolvePeople(contributorSlugs),
    ]);

    if (currentRequest !== requestId) return;
    author.value = resolvedAuthor[0];
    contributors.value = resolvedContributors;
  },
  { immediate: true },
);
</script>

<template>
  <div v-if="author || contributors.length" class="space-y-7">
    <div v-if="author">
      <p
        class="font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
      >
        Author
      </p>

      <div class="mt-3 flex items-center gap-3">
        <Avatar class="size-10 border border-border">
          <AvatarImage v-if="author.avatar" :src="author.avatar" :alt="author.name" />
          <AvatarFallback class="text-xs">{{ initials(author.name) }}</AvatarFallback>
        </Avatar>

        <div class="min-w-0 flex-1">
          <p class="truncate font-medium">{{ author.name }}</p>
          <p v-if="author.role" class="truncate text-xs text-muted-foreground">
            {{ author.role }}
          </p>
        </div>

        <div v-if="author.links" class="flex shrink-0 items-center">
          <a
            v-for="(href, network) in author.links"
            :key="network"
            :href="href"
            target="_blank"
            rel="noopener noreferrer"
            class="flex size-7 items-center justify-center text-muted-foreground transition-colors hover:text-accent"
            :aria-label="`${author.name} on ${network}`"
          >
            <UIcon :name="socialIcons[network] ?? 'tabler:external-link'" class="size-4" />
          </a>
        </div>
      </div>
    </div>

    <div v-if="contributors.length">
      <p
        class="font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
      >
        Contributors
      </p>

      <div class="mt-3 space-y-3">
        <div
          v-for="person in contributors"
          :key="person.slug"
          class="flex items-center gap-3"
        >
          <Avatar class="size-9 border border-border">
            <AvatarImage
              v-if="person.avatar"
              :src="person.avatar"
              :alt="person.name"
            />
            <AvatarFallback class="text-[10px]">{{ initials(person.name) }}</AvatarFallback>
          </Avatar>

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{{ person.name }}</p>
            <p v-if="person.role" class="truncate text-xs text-muted-foreground">
              {{ person.role }}
            </p>
          </div>

          <div v-if="person.links" class="flex shrink-0 items-center">
            <a
              v-for="(href, network) in person.links"
              :key="network"
              :href="href"
              target="_blank"
              rel="noopener noreferrer"
              class="flex size-7 items-center justify-center text-muted-foreground transition-colors hover:text-accent"
              :aria-label="`${person.name} on ${network}`"
            >
              <UIcon
                :name="socialIcons[network] ?? 'tabler:external-link'"
                class="size-4"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
