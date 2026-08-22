---
title: Components
description: Reference for the global components built into the Runable runtime.
---

Runable registers its internal components globally. Use them directly in a template.

| Component | Purpose |
| --- | --- |
| `RunablePage` | Display the current route |
| `RunableLink` | Navigate with Vue Router |
| `RunableLayout` | Apply the page layout |
| `ClientOnly` | Delay rendering until the client has mounted |

```vue
<template>
  <RunableLayout>
    <RunablePage />
  </RunableLayout>
</template>
```
