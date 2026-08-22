---
title: useHead
description: Add reactive tags to the document head with Unhead.
---

```ts
useHead({
  title: "Projects",
  meta: [
    { name: "description", content: "Project list" },
  ],
  link: [
    { rel: "canonical", href: "https://example.com/projects" },
  ],
});
```

Values can be reactive:

```ts
const project = ref<Project | null>(null);

useHead(() => ({
  title: project.value?.name ?? "Loading…",
}));
```

Unhead collects entries during SSR, then updates them on the client when their dependencies change.
