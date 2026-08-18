---
title: useHead
description: Ajoutez des balises réactives dans le head du document avec Unhead.
---

```ts
useHead({
  title: "Projets",
  meta: [
    { name: "description", content: "Liste des projets" },
  ],
  link: [
    { rel: "canonical", href: "https://example.com/projects" },
  ],
});
```

Les valeurs peuvent être réactives :

```ts
const project = ref<Project | null>(null);

useHead(() => ({
  title: project.value?.name ?? "Chargement…",
}));
```

Unhead collecte les entrées pendant le SSR puis les met à jour côté client lorsque leurs dépendances changent.

