<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

interface ContentSearchResult {
  collection: string;
  path: string;
  meta: {
    title: string;
    description?: string;
  };
  score: number;
  excerpt: string;
}

interface ExcerptPart {
  highlighted: boolean;
  text: string;
}

const searchCollections = [
  "gettingStarted",
  "structure",
  "guide",
  "mcp",
  "integrations",
  "api",
  "blog",
] as const;

const collectionLabels: Record<string, string> = {
  gettingStarted: "Getting Started",
  structure: "Structure",
  guide: "Guide",
  mcp: "MCP",
  integrations: "Integrations",
  api: "API",
  blog: "Blog",
};

const open = ref(false);
const query = ref("");
const results = ref<ContentSearchResult[]>([]);
const loading = ref(false);
const error = ref(false);
const input = ref<HTMLInputElement | null>(null);
const resultsList = ref<HTMLElement | null>(null);
const activeIndex = ref(-1);
const router = useRouter();

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let requestId = 0;

function resultPath(result: ContentSearchResult) {
  const prefix = result.collection === "blog" ? "/blog" : "/docs";
  return `${prefix}${result.path}`;
}

function excerptParts(excerpt: string): ExcerptPart[] {
  return excerpt
    .split(/(<mark>.*?<\/mark>)/gi)
    .filter(Boolean)
    .map((part) => {
      const highlighted = /^<mark>.*<\/mark>$/i.test(part);

      return {
        highlighted,
        text: highlighted ? part.replace(/^<mark>|<\/mark>$/gi, "") : part,
      };
    });
}

function setActiveIndex(index: number) {
  if (results.value.length === 0) {
    activeIndex.value = -1;
    return;
  }

  activeIndex.value = (index + results.value.length) % results.value.length;

  nextTick(() => {
    resultsList.value
      ?.querySelector<HTMLElement>(`[data-search-index="${activeIndex.value}"]`)
      ?.scrollIntoView({ block: "nearest" });
  });
}

function selectResult(result: ContentSearchResult) {
  open.value = false;
  void router.push(resultPath(result));
}

function onSearchKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    setActiveIndex(activeIndex.value + 1);
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    setActiveIndex(activeIndex.value - 1);
    return;
  }

  if (event.key === "Enter" && activeIndex.value >= 0) {
    const result = results.value[activeIndex.value];
    if (!result) return;

    event.preventDefault();
    selectResult(result);
  }
}

async function search(value: string) {
  const currentRequest = ++requestId;
  loading.value = true;
  error.value = false;

  try {
    const response = await queryCollections(searchCollections)
      .limit(20)
      .search(value);

    if (currentRequest === requestId) {
      results.value = response as ContentSearchResult[];
      activeIndex.value = response.length > 0 ? 0 : -1;
    }
  } catch {
    if (currentRequest === requestId) {
      results.value = [];
      activeIndex.value = -1;
      error.value = true;
    }
  } finally {
    if (currentRequest === requestId) loading.value = false;
  }
}

function onKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    open.value = !open.value;
  }
}

watch(query, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer);

  const normalizedQuery = value.trim();
  if (normalizedQuery.length < 2) {
    requestId++;
    results.value = [];
    activeIndex.value = -1;
    loading.value = false;
    error.value = false;
    return;
  }

  debounceTimer = setTimeout(() => search(normalizedQuery), 180);
});

watch(open, async (isOpen) => {
  if (!isOpen) return;
  await nextTick();
  input.value?.focus();
});

onMounted(() => window.addEventListener("keydown", onKeydown));

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  if (debounceTimer) clearTimeout(debounceTimer);
});
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <button
        type="button"
        class="flex h-9 w-9 items-center gap-2 cursor-pointer border border-border bg-transparent px-2.5 text-sm text-muted-foreground transition-colors hover:border-accent hover:bg-muted md:w-40"
        aria-label="Search documentation and blog"
      >
        <UIcon name="tabler:search" class="size-4 shrink-0" />
        <span class="hidden truncate md:inline">Search</span>

        <UKbdGroup class="ml-auto">
          <UKbd>Ctrl</UKbd>
          <UKbd>k</UKbd>
        </UKbdGroup>
      </button>
    </DialogTrigger>

    <DialogContent
      class="top-[12vh] max-h-[76vh] max-w-2xl translate-y-0 gap-0 overflow-hidden scrollbar-none p-0"
      :show-close-button="false"
    >
      <DialogHeader class="sr-only">
        <DialogTitle>Search Runable</DialogTitle>
        <DialogDescription>
          Search the Runable documentation and blog.
        </DialogDescription>
      </DialogHeader>

      <div
        class="flex items-center gap-3 border-b border-border px-4 sticky top-0 z-10 bg-background h-10"
      >
        <UIcon
          name="tabler:search"
          class="size-5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          ref="input"
          v-model="query"
          type="search"
          role="combobox"
          aria-autocomplete="list"
          :aria-expanded="results.length > 0"
          aria-controls="content-search-results"
          :aria-activedescendant="
            activeIndex >= 0
              ? `content-search-result-${activeIndex}`
              : undefined
          "
          placeholder="Search documentation and blog..."
          autocomplete="off"
          class="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          @keydown="onSearchKeydown"
        />
        <span
          v-if="loading"
          class="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"
          aria-label="Searching"
        />
        <Ukbd
          v-else
          class="border border-border px-1.5 py-1 font-mono text-[10px] text-muted-foreground"
        >
          ESC
        </Ukbd>
      </div>

      <div class="min-h-40 p-2 overflow-auto scrollbar-none max-h-120">
        <div
          v-if="query.trim().length < 2"
          class="flex min-h-36 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground"
        >
          <UIcon name="tabler:file-search" class="size-7" aria-hidden="true" />
          Enter at least two characters to search.
        </div>

        <div
          v-else-if="error"
          class="flex min-h-36 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground"
        >
          <UIcon name="tabler:alert-circle" class="size-7" aria-hidden="true" />
          Search is temporarily unavailable.
        </div>

        <div
          v-else-if="!loading && results.length === 0"
          class="flex min-h-36 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground"
        >
          <UIcon name="tabler:zoom-cancel" class="size-7" aria-hidden="true" />
          No results for “{{ query.trim() }}”.
        </div>

        <ul
          v-else
          id="content-search-results"
          ref="resultsList"
          role="listbox"
          class="space-y-1"
          aria-label="Search results"
        >
          <li
            v-for="(result, index) in results"
            :key="`${result.collection}:${result.path}`"
            role="presentation"
          >
            <RunableLink
              :id="`content-search-result-${index}`"
              :to="resultPath(result)"
              role="option"
              :aria-selected="activeIndex === index"
              :data-search-index="index"
              class="group flex min-w-0 flex-col gap-1 rounded-md px-3 py-3 outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
              :class="{ 'bg-muted': activeIndex === index }"
              @mouseenter="activeIndex = index"
              @click="open = false"
            >
              <span class="flex min-w-0 items-center gap-2">
                <span class="truncate font-medium text-foreground">
                  {{ result.meta.title }}
                </span>
                <span
                  class="ml-auto shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted-foreground"
                >
                  {{ collectionLabels[result.collection] ?? result.collection }}
                </span>
              </span>

              <span
                v-if="result.excerpt"
                class="line-clamp-2 text-sm leading-relaxed text-muted-foreground"
              >
                <template
                  v-for="(part, index) in excerptParts(result.excerpt)"
                  :key="index"
                >
                  <mark
                    v-if="part.highlighted"
                    class="bg-accent/20 text-foreground"
                    >{{ part.text }}</mark
                  >
                  <template v-else>{{ part.text }}</template>
                </template>
              </span>
            </RunableLink>
          </li>
        </ul>
      </div>

      <div
        class="flex items-center justify-between border-t border-border px-4 py-2 font-mono text-[10px] uppercase tracking-wide text-muted-foreground bg-background"
      >
        <span class="flex items-center gap-3">
          <span> <UKbd>↓</UKbd> <UKbd>↑</UKbd> Navigate</span>
          <span> <UKbd>↵</UKbd> Open</span>
        </span>
        <span v-if="results.length">{{ results.length }} results</span>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style lang="scss" scoped>
input[type="search"]::-webkit-search-cancel-button {
  display: none;
}
</style>
