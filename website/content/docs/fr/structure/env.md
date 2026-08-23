---
title: .env
description: Chargez des variables d'environnement typées et contrôlez celles que Runable expose au navigateur.
---

Runable charge les fichiers d'environnement du mode Vite actif et les variables déjà présentes dans `process.env`. Utilisez `useRuntime()` pour les lire depuis l'application.

## Déclarer les variables

Runable reconnaît deux préfixes : `RUN_` et `VITE_`. Préférez `RUN_` dans un nouveau projet pour distinguer clairement la configuration Runable.

```dotenv
# Disponible dans le navigateur et pendant le SSR
RUN_PUBLIC_API_BASE=/api
RUN_PUBLIC_FEATURE_ENABLED=true

# Disponible uniquement côté serveur
RUN_DATABASE_URL=postgres://localhost/acme
RUN_RETRY_COUNT=3
```

Le segment `PUBLIC_` contrôle l'exposition au client :

| Nom dans `.env` | Propriété générée | Client | Serveur |
| --- | --- | --- | --- |
| `RUN_PUBLIC_API_BASE` | `runtime.public.apiBase` | Oui | Oui |
| `RUN_PUBLIC_APP_NAME` | `runtime.public.appName` | Oui | Oui |
| `RUN_DATABASE_URL` | `runtime.databaseUrl` | Non | Oui |
| `RUN_RETRY_COUNT` | `runtime.retryCount` | Non | Oui |

Runable retire le préfixe puis convertit le nom en `camelCase`.

## Lire la configuration

`useRuntime()` est auto-importé dans l'application Vue :

```vue
<script setup lang="ts">
const runtime = useRuntime();

const apiBase = runtime.public.apiBase;
</script>

<template>
  <a :href="`${apiBase}/projects`">Voir les projets</a>
</template>
```

Une variable privée existe dans l'objet produit pour le bundle SSR, mais pas dans le bundle client. Lisez-la uniquement dans du code serveur :

```ts
if (import.meta.server) {
  const runtime = useRuntime();
  console.log(runtime.databaseUrl);
}
```

Vous pouvez aussi importer `useRuntime` depuis `runable` dans le code de votre backend. Cette version charge `.env`, fusionne les valeurs avec `process.env` et donne la priorité aux variables du processus.

## Types générés

Au démarrage, Runable analyse les valeurs et écrit leur déclaration dans `.app/runtime.d.ts`. L'éditeur connaît ainsi les propriétés disponibles sans interface TypeScript manuelle.

```dotenv
RUN_PUBLIC_ENABLED=true
RUN_PORT=3000
RUN_TAGS=["documentation","dashboard"]
```

Les valeurs deviennent respectivement un booléen, un nombre et un tableau. Runable reconnaît aussi `null`, `undefined` et les objets JSON valides. Toute autre valeur reste une chaîne de caractères.

Relancez le serveur de développement après l'ajout ou le renommage d'une variable pour régénérer les types et les valeurs injectées.

## Accès direct avec import.meta.env

Runable remplace aussi les accès statiques utilisant les préfixes `RUN_` et `VITE_` :

```ts
const apiBase = import.meta.env.RUN_PUBLIC_API_BASE;
```

Utilisez la notation avec un point et le nom complet de la variable. L'accès dynamique `import.meta.env[key]` n'est pas transformé.

`useRuntime()` reste préférable : il sépare clairement `public`, convertit les noms et fournit les types générés.

::u-tip
---
variant: destructive
surface: solid
title: Ne placez aucun secret dans une variable publique
---

Toute variable `RUN_PUBLIC_*` ou `VITE_PUBLIC_*` est intégrée au bundle client. Considérez sa valeur comme publique.

Évitez également le préfixe `VITE_` pour un secret : Vite expose nativement ses variables `VITE_*` via `import.meta.env`, indépendamment de l'objet construit par `useRuntime()`.

::

## Fichiers à versionner

Conservez les valeurs locales dans `.env` ou dans les variantes standard du mode Vite, comme `.env.development` et `.env.production`. Versionnez un fichier `.env.example` sans secret pour décrire la configuration attendue.

```dotenv
# .env.example
RUN_PUBLIC_API_BASE=
RUN_DATABASE_URL=
```
