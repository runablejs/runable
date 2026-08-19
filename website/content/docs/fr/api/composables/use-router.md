---
title: useRouter
description: Accédez à l'instance Vue Router installée dans l'application Syora.
---

`useRouter()` possède la même signature que le composable Vue Router.

```ts
const router = useRouter();

await router.push("/projects");
await router.replace({ name: "project", params: { id: "42" } });
```

Syora récupère le routeur depuis le contexte de l'application. Appelez cette fonction dans un contexte où l'application Vue est installée.

