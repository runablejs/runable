---
title: app/components
description: Créez des composants Vue disponibles sans import manuel.
---

Runable détecte les composants Vue de ce dossier et les rend disponibles dans les templates.

```vue
<!-- app/components/AppLogo.vue -->
<template>
  <strong>Acme</strong>
</template>
```

```vue
<!-- app/pages/index.vue -->
<template>
  <AppLogo />
</template>
```

Vous pouvez ajouter plusieurs sources et contrôler les noms générés :

```ts
export default defineConfig({
  components: [
    "./app/components",
    {
      dirs: "./app/components/ui",
      prefix: "U",
      pathPrefix: false,
    },
  ],
});
```

Runable écrit les déclarations dans `.app/components.d.ts`. Si l'autocomplétion ne reflète pas un nouveau composant, relancez `runable prepare` ou le serveur de développement.

## Définir le nom dans le composant

Le nom déclaré dans le fichier remplace celui déduit de son chemin :

```vue
<!-- app/components/button.vue -->
<script setup lang="ts">
defineOptions({
  name: "PrimaryAction",
});
</script>

<template>
  <button type="button"><slot /></button>
</template>
```

Le composant est alors disponible avec `<PrimaryAction />`, même si le fichier s'appelle `button.vue`. Runable reconnaît aussi l'API Options et `defineComponent()` :

```ts
export default defineComponent({
  name: "PrimaryAction",
});
```

Le nom doit être une chaîne statique. Une fonction `componentName` définie dans `runable.config.ts` garde la priorité. Sans nom déclaré ni renommage configuré, Runable utilise le nom du fichier et, selon `pathPrefix`, celui de ses dossiers parents.

Cette détection s'applique aussi aux composants écrits directement dans un fichier JavaScript ou TypeScript :

```ts
// app/components/layout.ts
export default defineComponent({
  name: "RunableLayout",
  setup() {
    // ...
  },
});
```

## Composants fournis par Runable

Runable enregistre plusieurs composants internes avec les composants du projet :

| Composant | Rôle |
| --- | --- |
| `RunablePage` | Affiche la route Vue Router courante |
| `RunableLink` | Crée un lien de navigation avec les props de `RouterLink` |
| `RunableLayout` | Applique le layout associé à la page |
| `ClientOnly` | Rend son contenu uniquement dans le navigateur |

```vue
<template>
  <nav>
    <RunableLink to="/projects">Projets</RunableLink>
  </nav>

  <RunablePage />
</template>
```
