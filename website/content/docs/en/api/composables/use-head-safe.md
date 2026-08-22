---
title: useHeadSafe
description: Add only tags and attributes allowed by Unhead's safe policy.
---

`useHeadSafe()` works like `useHead()`, but filters potentially dangerous entries.

```ts
useHeadSafe({
  title: "Profile",
  meta: [
    { name: "description", content: profile.value.summary },
  ],
});
```

Choose this function when values come from a CMS or another source that must not be able to inject arbitrary scripts and attributes into the document.
