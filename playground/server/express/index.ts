import { createServer, useConfig, serve } from "@syora/core";
import express from "express";
import { join } from "node:path";
// console.log("******************************");

const app = express();

const vite = await createServer();
const config = useConfig();

if (vite) app.use(vite.middlewares);
else {
  app.use(express.static(join(config.distDir, "client"), { extensions: [] }));
}

app.use("*all", async (req, res) => {
  const html = await serve({ vite, url: req.originalUrl });
  res.status(200).set({ "Content-Type": "text/html" }).end(html);
});

app.listen(5173);
