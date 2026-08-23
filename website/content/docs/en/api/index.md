---
title: API
description: Reference for the components, composables, and global functions provided by Runable.
---

This section describes APIs that are automatically available in the Vue application.

| Family | Content |
| --- | --- |
| Components | Page rendering, layouts, links, and client-only content |
| Composables | Data, router, configuration, head, and Schema.org |
| Globals | Fetch, page metadata, middleware, plugins, and Vue APIs |

The components and functions documented here are auto-imported into application code scanned by Runable (`app/`) — that scan is their only wiring. Most of them have no explicit `import ... from "runable"` path at all; `useRuntime()` is the one exception, re-exported from the package root for use in backend code (see <a href="/docs/api/composables/use-runtime.md">useRuntime</a>).

::u-tip
---
variant: warning
title: Alpha API
---

Some signatures may still change. Individual pages identify functions whose implementation is incomplete.

::
