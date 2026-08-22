---
title: useSchemaOrg
description: Add Schema.org structured data to the document with Unhead.
---

`useSchemaOrg()` registers Schema.org nodes and generates their JSON-LD representation in the head.

```ts
useSchemaOrg([
  defineWebSite({
    name: "Runable",
    url: "https://example.com",
  }),
  defineWebPage({
    name: "Documentation",
  }),
]);
```

Runable installs the Schema.org integration using the configured `siteUrl` as its host:

```ts
export default defineConfig({
  siteUrl: "https://example.com",
});
```

Helpers such as `defineWebSite`, `defineWebPage`, `defineArticle`, and `defineProduct` are also auto-imported, but `useSchemaOrg()` remains the entry point for registering nodes.
