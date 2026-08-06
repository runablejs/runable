import { createServer, useConfig, requestNode } from "./src";
import express from "express";
import { join } from "node:path";

const app = express();

const vite = await createServer();
const config = useConfig();

if (vite) app.use(vite.middlewares);
else {
  //   app.use(express.static(join(config.distDir, "client"), { extensions: [] }));
}

app.use("*all", async (req, res) => {
  await requestNode({ vite, req, res });
});

app.listen(5173);
