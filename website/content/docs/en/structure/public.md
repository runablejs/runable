---
title: public
description: Serve static files without importing them into Vue code.
---

Put files that must keep their name and be served directly from the site root in `public/`.

```text
public/
├── favicon.svg       → /favicon.svg
└── robots.txt        → /robots.txt
```

Reference them with an absolute URL from the root:

```vue
<img src="/logo.svg" alt="Acme" />
```

For images imported by a component and optimized by Vite, prefer a source directory such as `app/assets/` and a JavaScript import.

You can relocate or disable this directory:

```ts
export default defineConfig({
  publicDir: "static",
  // publicDir: false,
});
```

Use `false` when your backend, a proxy, or a CDN already serves every static file.
