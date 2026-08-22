---
title: app/css
description: Organize global stylesheets loaded by Runable.
---

`app/css/` is an organizational convention, but its files are not loaded automatically. Declare each global entry in `runable.config.ts`.

```css
/* app/css/main.css */
:root {
  font-family: system-ui, sans-serif;
}
```

```ts
export default defineConfig({
  css: ["./app/css/main.css"],
});
```

Import component-specific styles from the component's `<style>` block. Reserve the `css` option for resets, tokens, themes, and truly global styles.

Vite processes declared files. To use Sass, Less, or Stylus, install the matching preprocessor in the consuming project.
