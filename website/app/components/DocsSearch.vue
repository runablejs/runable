<script setup lang="ts">
import "@docsearch/css";

const container = ref<HTMLElement | null>(null);
const runtime = useRuntime() as {
  public: Record<string, string | undefined>;
};

const credentials = {
  appId: runtime.public.algoliaAppId,
  apiKey: runtime.public.algoliaSearchApiKey,
  indexName: runtime.public.algoliaIndexName,
};

const isConfigured = Object.values(credentials).every(Boolean);
let search: { destroy: () => void } | undefined;

onMounted(async () => {
  if (!container.value || !isConfigured) return;

  const { default: docsearch } = await import("@docsearch/js/docsearch");

  search = docsearch({
    container: container.value,
    appId: credentials.appId!,
    apiKey: credentials.apiKey!,
    indices: [credentials.indexName!],
  });
});

onBeforeUnmount(() => search?.destroy());
</script>

<template>
  <div
    v-if="isConfigured"
    ref="container"
    class="runable-docsearch"
    aria-label="Search the documentation"
  />
</template>

<style>
.runable-docsearch {
  --docsearch-primary-color: var(--accent);
  --docsearch-text-color: var(--foreground);
  --docsearch-muted-color: var(--muted-foreground);
  --docsearch-container-background: color-mix(
    in oklch,
    var(--background) 82%,
    transparent
  );
  --docsearch-modal-background: var(--background);
  --docsearch-searchbox-background: var(--muted);
  --docsearch-searchbox-focus-background: var(--background);
  --docsearch-hit-background: var(--card);
  --docsearch-hit-color: var(--foreground);
  --docsearch-hit-shadow: 0 1px 0 0 var(--border);
  --docsearch-footer-background: var(--card);
  --docsearch-footer-shadow: 0 -1px 0 0 var(--border);
  --docsearch-key-gradient: var(--muted);
  --docsearch-key-shadow: none;
}

.runable-docsearch .DocSearch-Button {
  height: 2.25rem;
  margin: 0;
  border: 1px solid var(--border);
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.runable-docsearch .DocSearch-Button:hover {
  border-color: var(--accent);
  background: var(--muted);
  box-shadow: none;
}

@media (max-width: 767px) {
  .runable-docsearch .DocSearch-Button {
    width: 2.25rem;
    padding: 0;
  }
}
</style>
