<script setup lang="ts">
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
  if (!container.value) return;

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
