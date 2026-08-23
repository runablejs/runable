---
title: Auto-imports
description: Automatically use application components, composables, and global functions.
---

Runable generates the required imports from three collections. Your files remain modular without repeating imports in every component.

## Auto-imported components

Files in `app/components/` are available in templates:

```text
app/components/base/Button.vue → <BaseButton />
app/components/UserCard.vue    → <UserCard />
```

The path contributes to the default name. A component can declare its own name:

```vue
<script setup lang="ts">
defineOptions({ name: "PrimaryButton" });
</script>
```

With the Options API:

```ts
export default defineComponent({
  name: "PrimaryButton",
});
```

The explicit name takes precedence over the file name.

## Auto-imported composables

Every export from `app/composables/` can be used in Vue scripts:

```ts
// app/composables/useCurrency.ts
export function useCurrency() {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
}
```

```vue
<script setup lang="ts">
const currency = useCurrency();
</script>
```

## Auto-imported globals

Place functions that do not depend on the Vue lifecycle in `app/globals/`:

```ts
// app/globals/formatDate.ts
export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US").format(new Date(value));
}
```

## Add other sources

```ts
export default defineConfig({
  components: ["app/components", { dirs: "app/components/ui", prefix: "Ui" }],
  composables: ["app/composables", "shared/composables"],
  globals: ["app/globals", "shared/utils"],
});
```

Runable generates TypeScript declarations in `.app`. Extend `.app/tsconfig.app.json` from your TypeScript configuration so the editor knows these symbols.

::u-tip
---
variant: warning
title: Keep side effects in plugins
---

An auto-imported file should primarily export values. Use a plugin when code must run during application startup.

::
