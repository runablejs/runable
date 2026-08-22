---
title: Configuration runtime
description: Chargez des variables typées sans exposer les secrets au navigateur.
---

Runable lit les fichiers `.env` du mode Vite actif et les variables de `process.env`. Il conserve les noms préfixés par `RUN_` ou `VITE_`.

## Déclarer les valeurs

```dotenv
RUN_PUBLIC_API_BASE=/api
RUN_PUBLIC_FEATURE_ENABLED=true
RUN_DATABASE_URL=postgres://localhost/acme
RUN_RETRY_COUNT=3
```

Le segment `PUBLIC_` détermine la visibilité :

| Variable | Accès généré | Client | Serveur |
| --- | --- | --- | --- |
| `RUN_PUBLIC_API_BASE` | `runtime.public.apiBase` | Oui | Oui |
| `RUN_PUBLIC_FEATURE_ENABLED` | `runtime.public.featureEnabled` | Oui | Oui |
| `RUN_DATABASE_URL` | `runtime.databaseUrl` | Non | Oui |
| `RUN_RETRY_COUNT` | `runtime.retryCount` | Non | Oui |

## Lire les valeurs

```ts
const runtime = useRuntime();

const apiBase = runtime.public.apiBase;

if (import.meta.server) {
  console.log(runtime.databaseUrl);
}
```

Runable retire le préfixe, convertit le nom en `camelCase` et infère les booléens, nombres, tableaux, objets JSON, `null` et `undefined`.

## Utiliser import.meta.env

Les accès statiques sont aussi remplacés pendant la compilation :

```ts
const apiBase = import.meta.env.RUN_PUBLIC_API_BASE;
```

La notation dynamique `import.meta.env[key]` n'est pas transformée. Préférez `useRuntime()` pour profiter de la séparation `public` et des types.

## Fournir les types à l'éditeur

Runable écrit `.app/runtime.d.ts` au démarrage. Si vous ajoutez ou renommez une variable, redémarrez le serveur pour régénérer la déclaration.

::u-tip
---
variant: destructive
title: Une variable publique n'est jamais secrète
---

Toute valeur `*_PUBLIC_*` est intégrée au bundle client. Ne l'utilisez jamais pour un mot de passe, un token privé ou une chaîne de connexion.

::
