---
title: useApp
description: Récupérez l'application Vue courante, ses propriétés globales et les hooks Runable.
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

Appelez `useApp()` depuis `setup()`, un composable ou après l'installation du plugin de contexte. La fonction lève une erreur si aucune application courante ou globale n'est disponible.

En SSR, évitez de conserver ce résultat dans une variable de module : l'application doit rester isolée par requête.

