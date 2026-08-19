---
title: Adaptateur personnalisé
description: Connectez Syora à un serveur Node ou Fetch API sans adaptateur dédié.
---

Créez l'application une seule fois, puis transmettez chaque requête frontend à la primitive adaptée à votre runtime.

## Serveur Node

```ts
import { createServer } from "node:http";
import { createSyoraApp, requestNode } from "@syora/core";

const syoraApp = createSyoraApp();

createServer(async (req, res) => {
  await requestNode({
    syoraApp: await syoraApp,
    req,
    res,
  });
}).listen(3000);
```

## Runtime Fetch API

```ts
import { createSyoraApp, requestWeb } from "@syora/core";

const syoraApp = createSyoraApp();

export async function fetch(request: Request) {
  return requestWeb({
    syoraApp: await syoraApp,
    req: request,
  });
}
```

`requestNode()` écrit directement dans `ServerResponse`. `requestWeb()` retourne une `Response`. Dans les deux cas, traitez vos routes API avant d'appeler Syora.

::u-tip
---
variant: info
title: Développement avec un serveur Node
---

Les adaptateurs Node officiels exécutent le middleware Connect de Vite avant `requestNode()`. Si vous écrivez votre propre adaptateur Node, reproduisez ce passage pour servir correctement les modules et assets de développement.

::

