---
title: server.ts
description: Démarrez votre backend et branchez l'adaptateur Runable en dernier middleware.
---

`server.ts` est le point d'entrée de votre backend. Il configure le serveur HTTP, les routes API et l'adaptateur Runable.

```ts
// server.ts
import Express from "express";
import { express } from "runable/adapters/express";

const server = Express();

server.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

server.use(express());

server.listen(3000, () => {
  console.log("http://localhost:3000");
});
```

Placez les routes API et middlewares métier avant l'adaptateur. Runable reçoit alors uniquement les requêtes qui n'ont pas déjà produit de réponse.

Le nom `server.ts` est une convention du projet, pas une contrainte du framework. Vous pouvez organiser le backend dans plusieurs fichiers ou utiliser le point d'entrée imposé par NestJS, AdonisJS, Bun ou Deno.

L'adaptateur initialise l'instance Runable une seule fois, connecte Vite en développement et utilise le build de `.output/` en production.

