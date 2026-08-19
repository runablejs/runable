---
title: app/components
description: Créez des composants Vue disponibles sans import manuel.
---

Syora détecte les composants Vue de ce dossier et les rend disponibles dans les templates.

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

Syora écrit les déclarations dans `.app/components.d.ts`. Si l'autocomplétion ne reflète pas un nouveau composant, relancez `syora prepare` ou le serveur de développement.

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

Le composant est alors disponible avec `<PrimaryAction />`, même si le fichier s'appelle `button.vue`. Syora reconnaît aussi l'API Options et `defineComponent()` :

```ts
export default defineComponent({
  name: "PrimaryAction",
});
```

Le nom doit être une chaîne statique. Une fonction `componentName` définie dans `syora.config.ts` garde la priorité. Sans nom déclaré ni renommage configuré, Syora utilise le nom du fichier et, selon `pathPrefix`, celui de ses dossiers parents.

Cette détection s'applique aussi aux composants écrits directement dans un fichier JavaScript ou TypeScript :

```ts
// app/components/layout.ts
export default defineComponent({
  name: "SyoraLayout",
  setup() {
    // ...
  },
});
```

## Composants fournis par Syora

Syora enregistre plusieurs composants internes avec les composants du projet :

| Composant | Rôle |
| --- | --- |
| `SyoraPage` | Affiche la route Vue Router courante |
| `SyoraLink` | Crée un lien de navigation avec les props de `RouterLink` |
| `SyoraLayout` | Applique le layout associé à la page |
| `ClientOnly` | Rend son contenu uniquement dans le navigateur |

```vue
<template>
  <nav>
    <SyoraLink to="/projects">Projets</SyoraLink>
  </nav>

  <SyoraPage />
</template>
```
