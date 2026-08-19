---
title: Vue APIs
description: Use common Vue functions without manual imports in a Syora application.
---

Syora auto-imports the most frequently used Vue APIs. Their behavior and signatures remain unchanged.

## Reactivity

`ref`, `shallowRef`, `reactive`, `shallowReactive`, `readonly`, `computed`, `watch`, `watchEffect`, `watchPostEffect`, `watchSyncEffect`, `toRef`, `toRefs`, `toValue`, `unref`, `isRef`, `isReactive`, `isReadonly`, `isProxy`, `markRaw`, and `triggerRef`.

```ts
const count = ref(0);
const doubled = computed(() => count.value * 2);
```

## Lifecycle

`onMounted`, `onBeforeMount`, `onUpdated`, `onBeforeUpdate`, `onUnmounted`, `onBeforeUnmount`, `onActivated`, `onDeactivated`, `onErrorCaptured`, `onServerPrefetch`, `onRenderTracked`, and `onRenderTriggered`.

## Components and context

`defineComponent`, `defineAsyncComponent`, `h`, `inject`, `provide`, `nextTick`, `getCurrentInstance`, `useAttrs`, `useSlots`, `useTemplateRef`, `useId`, `resolveComponent`, `withDirectives`, `withModifiers`, and `withKeys`.

Import any Vue API that is not auto-imported normally:

```ts
import { createApp } from "vue";
```
