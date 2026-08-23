---
name: runable-head
description: Set page titles, meta tags, canonical links, and structured data with Runable's Unhead integration. Use when working with useHead, useSeoMeta, useHeadSafe, injectHead, useSchemaOrg, or the runable.config.ts head/siteUrl options.
---

# Runable Head and SEO

Use this skill when a page or the application needs `<head>` metadata: title, description, Open Graph tags, canonical links, or structured data.

Scope: document `<head>` content only. It does not cover route metadata like `layout`/`middleware` (see `runable-pages`) or data loading (see `runable-data-fetching`) — metadata composables are often called from the same `<script setup>` as `useAsyncData()`, but they are unrelated APIs.

Runable installs Unhead (and its Schema.org integration) directly — these composables are the same ones Unhead exposes elsewhere, not a Runable reimplementation.

## Global defaults

Set shared values once in `runable.config.ts`; only declare route- or content-specific data in pages.

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

## Page-level metadata with useSeoMeta

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

Pass a getter (`() => value`), not a plain value, when the metadata depends on a `ref`/`computed` — a plain value is captured once and won't update when the data changes.

## Arbitrary head elements with useHead

For anything `useSeoMeta()` doesn't cover directly (attributes, links, custom meta):

```ts
useHead({
  htmlAttrs: { lang: "en" },
  link: [{ rel: "canonical", href: "https://example.com/projects" }],
});
```

## Untrusted content with useHeadSafe

Use `useHeadSafe()` instead of `useHead()` when a value comes from user input or another untrusted source — it sanitizes what it accepts to avoid injecting unsafe markup into `<head>`.

## Structured data with useSchemaOrg

```ts
import { defineWebPage } from "@unhead/schema-org";

useSchemaOrg([
  defineWebPage({
    name: "Projects",
    description: "List of public projects",
  }),
]);
```

`useSchemaOrg()` itself is auto-imported, but the Schema.org node helpers (`defineWebPage`, and similar) are not — import the ones a page needs explicitly from `@unhead/schema-org` unless the project's configuration already exposes them globally.

## Direct Unhead access

`injectHead()` returns the underlying Unhead instance for advanced integrations that need lower-level control than `useHead()`/`useSeoMeta()` provide. Most pages don't need it.

## Common mistakes

- Passing a plain value instead of a getter to `useSeoMeta()` for data that changes — the tag won't update.
- Duplicating the same global `title`/`description` in every page instead of setting it once in `runable.config.ts`'s `head` and overriding only what's page-specific.
- Using `useHead()` with unsanitized user-provided content instead of `useHeadSafe()`.
- Calling a Schema.org node helper (`defineWebPage`, etc.) without importing it — it is not auto-imported like `useSchemaOrg()` itself.

## When another skill is needed

- Selecting a page's layout or navigation middleware: `runable-pages`.
- Loading the data a page's metadata depends on: `runable-data-fetching`.

Consult the current Runable API reference when exact behavior matters.
