---
title: CSS et assets
description: Chargez les styles globaux et servez les fichiers statiques de l'application.
---

Runable distingue les fichiers transformés par Vite des fichiers servis tels quels.

## Charger des styles globaux

Déclarez-les dans `runable.config.ts` :

```ts
export default defineConfig({
  css: [
    "app/css/reset.css",
    "app/css/main.css",
  ],
});
```

Runable regroupe les styles du projet et de ses modules, supprime les doublons puis les importe dans l'entrée client. Vite traite les imports, URLs et préprocesseurs installés.

Vous pouvez aussi scanner un dossier :

```ts
export default defineConfig({
  css: [{ dirs: "app/css" }],
});
```

## Garder un style local

Un style propre à un composant reste dans son fichier Vue :

```vue
<style scoped>
.card {
  border: 1px solid #ddd;
}
</style>
```

N'ajoutez à `css` que les feuilles qui doivent être chargées globalement.

## Servir un fichier public

Placez les fichiers non transformés dans `public/` :

```text
public/
├── favicon.svg
└── images/logo.png
```

Référencez-les depuis la racine :

```vue
<img src="/images/logo.png" alt="Acme" />
```

Pour importer un asset et laisser Vite le versionner, gardez-le dans le code source :

```vue
<script setup lang="ts">
import logoUrl from "../assets/logo.svg";
</script>

<template><img :src="logoUrl" alt="Acme" /></template>
```

## Changer le dossier public

```ts
export default defineConfig({
  publicDir: "static",
});
```

Utilisez `publicDir: false` pour désactiver ce dossier.

::u-tip
---
variant: info
title: Public ou import ?
---

Utilisez `public/` pour conserver un nom stable comme `robots.txt`. Utilisez un import pour permettre à Vite de générer un nom versionné et d'optimiser la référence.

::
