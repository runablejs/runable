import express from "express";
import sirv from "sirv";
import { createViteServer, useConfig, serve } from "../src";

async function createServer() {
  // process.env.NODE_ENV = "production";
  const app = express();
  const vite = await createViteServer();
  const config = useConfig();

  if (vite) app.use(vite.middlewares);
  else {
    app.use(sirv(config.distDir, { extensions: [] }));
  }

  app.use("*all", async (req, res) => {
    const html = await serve({ vite, url: req.originalUrl });
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  });

  app.listen(5173);
}

createServer();
