---
title: useSeoMeta
description: Declare SEO metadata with a flat, typed API.
---

`useSeoMeta()` simplifies the creation of SEO, Open Graph, and Twitter tags.

```ts
useSeoMeta({
  title: "Syora",
  description: "A Vue framework for your backend.",
  ogTitle: "Syora",
  ogDescription: "A Vue framework for your backend.",
  ogImage: "https://example.com/og.png",
  twitterCard: "summary_large_image",
});
```

Keys are typed and converted to `<meta>` tags by Unhead. Use `useHead()` when you need other elements such as `link`, `script`, `style`, or `htmlAttrs`.
