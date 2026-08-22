---
title: useApp
description: Retrieve the current Vue application, its global properties, and Runable hooks.
---

```ts
function useApp(): AppContext
```

```ts
const app = useApp();

app.$router;
app.$route;
app.config.globalProperties;
```

Call `useApp()` from `setup()`, a composable, or after installing the context plugin. The function throws when no current or global application is available.

During SSR, do not keep this result in a module variable: the application must remain isolated per request.
