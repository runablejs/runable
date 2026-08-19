---
title: useRouter
description: Access the Vue Router instance installed in the Syora application.
---

`useRouter()` has the same signature as the Vue Router composable.

```ts
const router = useRouter();

await router.push("/projects");
await router.replace({ name: "project", params: { id: "42" } });
```

Syora retrieves the router from the application context. Call this function where the Vue application has been installed.
