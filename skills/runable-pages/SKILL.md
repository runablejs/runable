---
name: runable-pages
description: Create and modify Runable pages, file-based routes, layouts, route metadata, navigation middleware, and navigation components. Use when working with app/pages, dynamic routes, nested routes, definePageMeta, app/layouts, app/middlewares, RunablePage, RunableLink, or RunableLayout.
---

# Runable Pages

Use this skill when creating or modifying a Runable page, route, layout, or navigation middleware.

Use `runable-project` first when the application structure or configuration has not yet been inspected.

Do not edit generated routes under `.app/` — routes, layouts, and middleware registries are derived from `app/pages/`, `app/layouts/`, and `app/middlewares/` (or their configured equivalents). Change the source files instead.

## Inspect before modifying

1. Read `runable.config.ts` and note any `pages`, `layouts`, or `middlewares` overrides — do not assume the default `app/` paths when configuration overrides them.
2. Inspect the existing page tree under the actual pages directory.
3. Look at sibling pages for naming and metadata conventions already in use.
4. Preserve existing conventions instead of introducing a new pattern.

## File-based routing

Every Vue component under the pages directory becomes a route:

```text
app/pages/
├── index.vue                 → /
├── about.vue                 → /about
├── users/
│   ├── index.vue             → /users
│   └── [id].vue              → /users/:id
├── blog/[[page]].vue         → /blog/:page?
└── docs/[...slug].vue        → /docs/:slug*
```

`index.vue` in a directory becomes that directory's route (`users/index.vue` → `/users`). A plain directory with no sibling `.vue` file of the same name (like `users/` above) produces flat, independent routes — it does **not** require a parent outlet. Nesting only happens when a file shares its name with the sibling directory; see "Nested pages" below.

## Creating a page

1. Convert the requested URL into the corresponding file path under the pages directory.
2. Inspect sibling pages for the conventions already used (script style, layout, metadata).
3. Create the Vue SFC (prefer `<script setup lang="ts">`).
4. Add `definePageMeta()` only when the file-based convention doesn't already express what's needed (see "Route metadata").
5. Reuse existing layouts and components instead of duplicating markup.
6. Validate the resulting route matches the requested URL.

Do not mix in data fetching by default. A dynamic route does not imply `useAsyncData()` — only add data loading when the request actually asks for it, and treat that as a separate concern (a future data-fetching skill covers it).

## Dynamic routes

A segment in square brackets captures a URL parameter:

```text
app/pages/projects/[id].vue → /projects/:id
```

Read it with `useRoute()`:

```vue
<script setup lang="ts">
const route = useRoute();
const projectId = computed(() => String(route.params.id));
</script>
```

## Optional routes

Double square brackets make a parameter optional:

```text
app/pages/blog/[[page]].vue → /blog/:page?
```

The page renders both with and without the segment; check `route.params.page` for `undefined`.

## Catch-all routes

A segment prefixed with `...` inside square brackets matches the rest of the path as an array:

```text
app/pages/docs/[...slug].vue → /docs/:slug*
```

`route.params.slug` is an array of the matched segments.

## Nested pages

Nesting requires a file with the same name as the sibling directory, containing a `RunablePage` outlet:

```vue
<!-- app/pages/projects.vue -->
<template>
  <section>
    <h1>Projects</h1>
    <RunablePage />
  </section>
</template>
```

With `app/pages/projects/index.vue` and `app/pages/projects/[id].vue` present, `projects.vue` becomes the parent route and its children render through `<RunablePage />`. Without a `projects.vue` file, `projects/index.vue` and `projects/[id].vue` are independent top-level routes — do not assume a directory alone creates a nested outlet.

## Route metadata

`definePageMeta()` is auto-imported in pages. Pass a plain, static object — it's extracted at build time, so a runtime-computed value (a function call, a variable) will not work.

```vue
<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});
</script>
```

Confirmed fields:

| Field | Effect |
| --- | --- |
| `name` | Overrides the generated route name |
| `path` | Overrides the generated route path |
| `alias` | Adds alternate paths — currently only applied when `path` is also set; verify before relying on `alias` alone |
| `layout` | Selects the layout (see "Layouts") |
| `middleware` | Runs named middleware, in array order (see "Navigation middleware") |

Any other key is still stored on `route.meta` and readable via `route.meta.<key>`, but has no built-in Runable behavior.

Do not add explicit metadata when the file-based convention already expresses the requested route (e.g. don't set `path` to reproduce what the filename already produces).

## Layouts

Layout files live in the layouts directory (`app/layouts/` by default). `default.vue` applies automatically when a page doesn't select another one.

Select a layout by name:

```vue
<script setup lang="ts">
definePageMeta({ layout: "dashboard" });
</script>
```

`dashboard` maps to `app/layouts/dashboard.vue`. Pass props to it with the object form:

```ts
definePageMeta({
  layout: { name: "dashboard", props: { compact: true } },
});
```

Disable the layout entirely:

```ts
definePageMeta({ layout: false });
```

| `layout` value | Effect |
| --- | --- |
| omitted | Loads `default.vue` |
| `"name"` | Loads `app/layouts/<name>.vue` |
| `{ name, props }` | Loads the layout and passes props to it |
| `false` | Renders the page content directly, no layout |

If the name matches no loaded layout, the page renders without a wrapper — this fails silently, not with an error, so double-check the layout file name and the `layout` value when a layout doesn't appear to apply.

## Navigation middleware

Runable navigation middleware is **not** backend HTTP middleware. It runs in the browser and during SSR navigation, controlling what the Vue Router shows — it cannot protect an API route. Keep real authentication and API authorization in the backend.

Named middleware lives in the middlewares directory and is attached by file name:

```ts
// app/middlewares/auth.ts
export default defineVueMiddleware((to) => {
  const authenticated = false;

  if (!authenticated) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }
});
```

```ts
definePageMeta({ middleware: ["auth"] });
```

`defineVueMiddleware()` normalizes its argument (one function or an array) into an array; each function receives `(to, from)` and may return `undefined`/`true` (continue), `false` (cancel), or a route location (redirect).

A file suffixed `.global.ts` runs on every navigation without being referenced from any page:

```text
app/middlewares/analytics.global.ts
```

Global middleware always runs before named middleware. Named middleware from `middleware: [...]` runs in the order listed; a middleware referenced more than once (e.g. by a parent and a child route) still only runs once.

## Navigation

| API | Use |
| --- | --- |
| `RunableLink` | Template links (`<RunableLink to="/projects">…</RunableLink>`) |
| `navigateTo()` | Programmatic navigation from a script (`await navigateTo("/projects")` or `await navigateTo({ name: "project-details", params: { id: "42" } })`) |
| `useRoute()` | Read the current route (`params`, `query`, `meta`, …) |
| `useRouter()` | Direct Vue Router instance access (`router.push()`, `router.replace()`) |

All four are auto-imported in application code. Prefer `RunableLink`/`navigateTo()` over a raw `<a>` tag or `window.location.href` for internal navigation — use a real page load (`window.location`) only when one is actually intended (e.g. leaving the SPA).

`navigateTo(to, { replace? })` pushes a new history entry by default; pass `replace: true` to replace the current one instead. Passing `null`/`undefined` is a no-op.

## RunablePage

`RunablePage` is a thin wrapper around Vue Router's `RouterView` — same props, same slots.

```vue
<template>
  <RunablePage />
</template>
```

It's also the outlet used for nested routes (see "Nested pages"): a parent page needs one `<RunablePage />` for its child route to render.

## RunableLayout

`RunableLayout` reads `route.meta.layout`, loads the matching layout component, and renders its default slot inside it:

```vue
<template>
  <RunableLayout>
    <RunablePage />
  </RunableLayout>
</template>
```

This is typically already wired in the application root (`app.vue`) — check the existing composition before adding a second `RunableLayout` wrapper.

## Safe workflow

1. Inspect `runable.config.ts` for pages/layouts/middlewares overrides.
2. Locate the actual pages/layouts/middlewares directories.
3. Inspect the current page tree and neighboring conventions.
4. Determine the smallest source change that satisfies the request.
5. Modify source files only.
6. Never patch generated routes under `.app/`.
7. Regenerate Runable output when required (the project's preparation command).
8. Run the project's relevant checks (typecheck, tests, build) from `package.json`.

## Common mistakes

- Editing generated routes under `.app/` instead of the source page/layout/middleware file.
- Assuming every project uses `app/pages/` without checking `runable.config.ts`.
- Confusing Vue navigation middleware with HTTP/API middleware.
- Copying Nuxt routing, layout, or middleware behavior without verifying it against Runable.
- Adding route metadata that only reproduces what the file-based convention already expresses.
- Introducing data fetching (`useAsyncData`, `$fetch`, …) when the task only concerns routing or layout.
- Treating a plain pages subdirectory as an automatic nested outlet — nesting needs a same-named parent file with `<RunablePage />`.
- Relying on `alias` alone without also setting `path` — currently it has no effect in that case.

Consult the current Runable API reference when exact behavior matters.
