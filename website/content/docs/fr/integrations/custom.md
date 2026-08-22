---
title: Adaptateur personnalisé
description: Connectez Runable à un serveur Node ou Fetch API sans adaptateur dédié.
---

Créez l'application une seule fois, puis transmettez chaque requête frontend à la primitive adaptée à votre runtime.

## Serveur Node

```ts
import { createServer } from "node:http";
import { createRunableApp, requestNode } from "runable";

const runableApp = createRunableApp();

createServer(async (req, res) => {
  await requestNode({
    runableApp: await runableApp,
    req,
    res,
  });
}).listen(3000);
```

## Runtime Fetch API

```ts
import { createRunableApp, requestWeb } from "runable";

const runableApp = createRunableApp();

export async function fetch(request: Request) {
  return requestWeb({
    runableApp: await runableApp,
    req: request,
  });
}
```

`requestNode()` écrit directement dans `ServerResponse`. `requestWeb()` retourne une `Response`. Dans les deux cas, traitez vos routes API avant d'appeler Runable.

::u-tip
---
variant: info
title: Développement avec un serveur Node
---

Les adaptateurs Node officiels exécutent le middleware Connect de Vite avant `requestNode()`. Si vous écrivez votre propre adaptateur Node, reproduisez ce passage pour servir correctement les modules et assets de développement.

::

