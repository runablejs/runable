---
title: Vue APIs
description: Utilisez les fonctions Vue courantes sans import manuel dans l'application Runable.
---

Runable auto-importe les API Vue utilisées le plus souvent. Le comportement et les signatures restent ceux de Vue.

## Réactivité

`ref`, `shallowRef`, `reactive`, `shallowReactive`, `readonly`, `computed`, `watch`, `watchEffect`, `watchPostEffect`, `watchSyncEffect`, `toRef`, `toRefs`, `toValue`, `unref`, `isRef`, `isReactive`, `isReadonly`, `isProxy`, `markRaw` et `triggerRef`.

```ts
const count = ref(0);
const doubled = computed(() => count.value * 2);
```

## Cycle de vie

`onMounted`, `onBeforeMount`, `onUpdated`, `onBeforeUpdate`, `onUnmounted`, `onBeforeUnmount`, `onActivated`, `onDeactivated`, `onErrorCaptured`, `onServerPrefetch`, `onRenderTracked` et `onRenderTriggered`.

## Composants et contexte

`defineComponent`, `defineAsyncComponent`, `h`, `inject`, `provide`, `nextTick`, `getCurrentInstance`, `useAttrs`, `useSlots`, `useTemplateRef`, `useId`, `resolveComponent`, `withDirectives`, `withModifiers` et `withKeys`.

Pour une API Vue non auto-importée, importez-la normalement :

```ts
import { createApp } from "vue";
```

