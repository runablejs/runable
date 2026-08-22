---
title: RunableLink
description: Create typed links that navigate with Vue Router.
---

`RunableLink` wraps `RouterLink` and preserves its props, HTML attributes, and slots.

```vue
<RunableLink to="/projects">Projects</RunableLink>
```

## Main props

| Prop | Type | Description |
| --- | --- | --- |
| `to` | `RouteLocationRaw` | Link destination |
| `replace` | `boolean` | Replaces the current history entry |
| `custom` | `boolean` | Disables the automatic `<a>` element |
| `activeClass` | `string` | Class applied when the link is active |
| `exactActiveClass` | `string` | Class applied on an exact match |
| `viewTransition` | `boolean` | Uses View Transitions when available |

The custom slot exposes `href`, `route`, `navigate`, `isActive`, and `isExactActive`.
