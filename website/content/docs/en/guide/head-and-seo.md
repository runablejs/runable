---
title: Head and SEO
description: Define global and page-specific HTML metadata with Unhead.
---

Runable installs Unhead and its Schema.org integration. Metadata produced during SSR is injected into the document before it is sent.

## Define global values

```ts
// runable.config.ts
export default defineConfig({
  siteUrl: "https://example.com",
  head: {
    titleTemplate: "%s · Acme",
    meta: [{ name: "description", content: "Manage your projects with Acme." }],
    link: [{ rel: "icon", href: "/favicon.svg" }],
  },
});
```

`siteUrl` provides the origin Schema.org uses to build absolute URLs.

## Configure a page

```vue
<script setup lang="ts">
const project = ref({ name: "Runable", summary: "A Vue application with your backend." });

useSeoMeta({
  title: () => project.value.name,
  description: () => project.value.summary,
  ogTitle: () => project.value.name,
  ogDescription: () => project.value.summary,
});
</script>
```

Getters keep metadata synchronized with reactive values.

## Add arbitrary elements

```ts
useHead({
  htmlAttrs: { lang: "en" },
  link: [{ rel: "canonical", href: "https://example.com/projects" }],
});
```

Use `useHeadSafe()` when values come from an untrusted source. `injectHead()` gives advanced integrations direct access to the Unhead instance.

## Declare structured data

```ts
import { defineWebPage } from "@unhead/schema-org";

useSchemaOrg([
  defineWebPage({
    name: "Projects",
    description: "List of public projects",
  }),
]);
```

`useSchemaOrg()` is auto-imported. Explicitly import the Schema.org node helpers your page needs when your configuration does not expose them.

::u-tip
---
variant: info
title: One global source, local overrides
---

Put shared values in `head` and declare only route- or content-specific data in pages.

::
