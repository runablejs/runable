---
title: ClientOnly
description: Render browser-dependent content only after Vue has mounted.
---

`ClientOnly` prevents its default slot from being rendered on the server. Use it for libraries that access `window`, the DOM, or browser-only APIs.

```vue
<ClientOnly fallback="Loading…" fallback-tag="span">
  <BrowserChart />
</ClientOnly>
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `fallback` | `string` | Text displayed before mounting |
| `fallbackTag` | `string` | Fallback element, `span` by default |
| `placeholder` | `string` | Alias for `fallback` |
| `placeholderTag` | `string` | Alias for `fallbackTag` |

The `fallback` or `placeholder` slot replaces the text:

```vue
<ClientOnly>
  <Map />

  <template #fallback>
    <p>Preparing the map…</p>
  </template>
</ClientOnly>
```
