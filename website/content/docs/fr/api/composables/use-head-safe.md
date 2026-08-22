---
title: useHeadSafe
description: Ajoutez uniquement les balises et attributs autorisés par la politique sûre d'Unhead.
---

`useHeadSafe()` possède une utilisation proche de `useHead()`, mais filtre les entrées potentiellement dangereuses.

```ts
useHeadSafe({
  title: "Profil",
  meta: [
    { name: "description", content: profile.value.summary },
  ],
});
```

Choisissez cette fonction lorsque des valeurs proviennent d'un CMS ou d'une source qui ne doit pas pouvoir injecter librement des scripts et attributs dans le document.

