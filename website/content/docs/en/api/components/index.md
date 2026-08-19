---
title: Components
description: Reference for the global components built into the Syora runtime.
---

Syora registers its internal components globally. Use them directly in a template.

| Component | Purpose |
| --- | --- |
| `SyoraPage` | Display the current route |
| `SyoraLink` | Navigate with Vue Router |
| `SyoraLayout` | Apply the page layout |
| `ClientOnly` | Delay rendering until the client has mounted |

```vue
<template>
  <SyoraLayout>
    <SyoraPage />
  </SyoraLayout>
</template>
```
