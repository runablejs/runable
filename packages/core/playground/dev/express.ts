import { createServer as createHttpServer } from "node:http";
import { createServer, useConfig, serve } from "../../src";
import express from "express";
import sirv from "sirv";
import { join } from "node:path";

process.env.NODE_ENV = "production";
const app = express();
const httpServer = createHttpServer(app);

const vite = await createServer(httpServer);
const config = useConfig();

if (vite) app.use(vite.middlewares);
else app.use(sirv(join(config.distDir, "client"), { extensions: [] }));

app.use("*all", async (req, res) => {
  const html = await serve({ vite, url: req.originalUrl });
  res.status(200).set({ "Content-Type": "text/html" }).end(html);
});

httpServer.listen(5173);
