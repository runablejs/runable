---
title: Plugins
description: Initialisez une bibliothèque, fournissez des dépendances et ordonnez le démarrage de l'application Vue.
---

Un plugin s'exécute pendant la création de l'application Vue, avant son rendu. Placez-le dans `app/plugins/` lorsqu'une fonctionnalité doit être installée une fois par instance.

## Créer un plugin

```ts
// app/plugins/api.ts
export default defineVuePlugin((vueApp) => {
  vueApp.directive("focus", {
    mounted(element) {
      element.focus();
    },
  });

  return {
    provide: {
      apiBase: "/api",
    },
  };
});
```

Les valeurs de `provide` sont enregistrées avec `app.provide()` et comme propriétés globales préfixées par `$`.

## Déclarer l'ordre

```ts
// app/plugins/tracking.ts
export default defineVuePlugin({
  name: "tracking",
  enforce: "post",
  dependsOn: ["api"],
  setup() {
    // Initialisation
  },
});
```

| Option | Rôle |
| --- | --- |
| `name` | Identifie le plugin dans les dépendances |
| `enforce: "pre"` | Passe avant les plugins sans priorité |
| `enforce: "post"` | Passe après les plugins sans priorité |
| `dependsOn` | Attend les plugins nommés du même groupe |
| `setup` | Configure l'application Vue |
| `hooks` | Enregistre des hooks runtime Runable |

Runable trie séparément les groupes `pre`, normal et `post`, puis résout `dependsOn`. Une dépendance circulaire provoque une erreur explicite. Une dépendance absente produit un avertissement.

## Garder le SSR isolé

En SSR, Runable crée une application Vue pour chaque rendu. Créez les états mutables dans `setup()` :

```ts
export default defineVuePlugin(() => {
  const state = reactive({ user: null });
  return { provide: { session: state } };
});
```

Ne placez pas l'état d'un utilisateur dans une variable mutable au niveau du module, car plusieurs requêtes pourraient la partager.

::u-tip
---
variant: info
title: Plugin ou module ?
---

Un plugin initialise Vue à l'exécution. Un module configure Runable et peut fournir plusieurs plugins, composants, layouts ou autres collections.

::
