---
"runable": minor
---

Add `resolveRoute(path)` to `runable/inspector`: given an absolute path, resolves it against the project's routes using Vue Router's own matcher (the same one a real navigation would use), returning the matched `InspectorRoute` plus extracted `params`/`query`/`hash`, or `null` if nothing matches. Supports dynamic, optional, and catch-all params, nested routes, and `definePageMeta({ path, name })` overrides. Like every other Inspector getter, it reflects state as of the last `refresh()`.
