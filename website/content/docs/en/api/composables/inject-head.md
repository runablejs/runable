---
title: injectHead
description: Access the Unhead instance installed in the application directly.
---

`injectHead()` returns the Unhead instance injected by Syora. Use this API for advanced integrations that need direct access to the head manager.

```ts
const head = injectHead();
```

To define metadata for a page or component, prefer `useHead()`, `useSeoMeta()`, or `useHeadSafe()`. These composables manage their Vue lifecycle automatically.
