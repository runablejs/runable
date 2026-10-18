import { createViteServer, handleRequest } from "@/index.js";
import express from "express";

const hostname: string = "127.0.0.1";
const port: number = 3000;

const app = express();
const vite = await createViteServer();

if (vite) app.use(vite.middlewares);

app.use("*all", async (req, res) => {
  await handleRequest(vite, req, res);
});

// Démarrage du serveur
app.listen(port, hostname, () => {
  console.log(`Serveur en cours d'exécution sur http://${hostname}:${port}`);
});
