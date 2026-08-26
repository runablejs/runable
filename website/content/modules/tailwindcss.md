---
title: "@runablejs/tailwindcss"
package: "@runablejs/tailwindcss"
install: pnpm add -D @runablejs/tailwindcss
description: Add Tailwind CSS 4 to a Runable application through the official Vite plugin, with source detection for every loaded module.
category: Styling
icon: logos:tailwindcss-icon
repository: https://github.com/runablejs/tailwindcss
documentation: https://github.com/runablejs/tailwindcss#readme
npm: https://www.npmjs.com/package/@runablejs/tailwindcss
learnMore: https://tailwindcss.com
maintainer: Runable Team
author: domutala
contributors:
  - syora-team
compatibility: Runable 1.x · Tailwind CSS 4
tags:
  - css
  - styling
  - tailwind
  - vite
---

`@runablejs/tailwindcss` configures Tailwind CSS 4 for Runable. It registers the official `@tailwindcss/vite` plugin, injects the Tailwind import, and includes source files exposed by loaded Runable modules.

## Installation

Install the module as a development dependency:

```bash
pnpm add -D @runablejs/tailwindcss
```

Add it to `runable.config.ts`:

```ts
import { defineConfig } from "runable";

export default defineConfig({
  modules: ["@runablejs/tailwindcss"],
});
```

You can now use Tailwind utility classes in Vue components:

```vue
<template>
  <h1 class="text-3xl font-bold text-emerald-500">
    Built with Runable and Tailwind CSS
  </h1>
</template>
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `injectCss` | `boolean` | `true` | Inject `@import "tailwindcss"` and register Runable source files. |
| `exposeConfig` | `boolean` | `false` | Expose the resolved options through the public runtime configuration. |

## Use your own stylesheet

Disable automatic CSS injection when your application already owns its Tailwind entry file:

```ts
import { defineConfig } from "runable";

export default defineConfig({
  modules: ["@runablejs/tailwindcss"],
  tailwindcss: {
    injectCss: false,
  },
  css: ["./app/assets/css/main.css"],
});
```

Then import Tailwind from that stylesheet:

```css
@import "tailwindcss";
```
