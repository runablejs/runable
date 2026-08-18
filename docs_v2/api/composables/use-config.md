---
title: useConfig
description: Lisez la partie publique de la configuration Syora dans l'application Vue.
---

```ts
function useConfig(): ClientConfig
```

Le résultat contient uniquement les options sûres transmises au client :

```ts
const config = useConfig();

console.log(config.ssr);
console.log(config.siteUrl);
console.log(config.baseUrl);
console.log(config.head);
```

`ClientConfig` comprend `head`, `ssr`, `siteUrl` et `baseUrl`. Les chemins absolus, modules et réglages Vite restent côté serveur.

