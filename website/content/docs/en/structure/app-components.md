---
title: app/components
description: Create Vue components that are available without manual imports.
---

Syora detects Vue components in this directory and makes them available in templates.

```vue
<!-- app/components/AppLogo.vue -->
<template>
  <strong>Acme</strong>
</template>
```

```vue
<!-- app/pages/index.vue -->
<template>
  <AppLogo />
</template>
```

You can add multiple sources and control generated names:

```ts
export default defineConfig({
  components: [
    "./app/components",
    {
      dirs: "./app/components/ui",
      prefix: "U",
      pathPrefix: false,
    },
  ],
});
```

Syora writes declarations to `.app/components.d.ts`. If autocomplete does not reflect a new component, restart `syora prepare` or the development server.

## Define the name inside the component

A name declared in the file replaces the name inferred from its path:

```vue
<!-- app/components/button.vue -->
<script setup lang="ts">
defineOptions({
  name: "PrimaryAction",
});
</script>

<template>
  <button type="button"><slot /></button>
</template>
```

The component is then available as `<PrimaryAction />`, even though the file is named `button.vue`. Syora also recognizes the Options API and `defineComponent()`:

```ts
export default defineComponent({
  name: "PrimaryAction",
});
```

The name must be a static string. A `componentName` function defined in `syora.config.ts` takes priority. Without a declared or configured name, Syora uses the file name and, depending on `pathPrefix`, its parent directories.

This detection also applies to components written directly in JavaScript or TypeScript files:

```ts
// app/components/layout.ts
export default defineComponent({
  name: "SyoraLayout",
  setup() {
    // ...
  },
});
```

## Components provided by Syora

Syora registers several internal components alongside project components:

| Component | Purpose |
| --- | --- |
| `SyoraPage` | Displays the current Vue Router route |
| `SyoraLink` | Creates a navigation link with `RouterLink` props |
| `SyoraLayout` | Applies the layout associated with the page |
| `ClientOnly` | Renders its content only in the browser |

```vue
<template>
  <nav>
    <SyoraLink to="/projects">Projects</SyoraLink>
  </nav>

  <SyoraPage />
</template>
```
