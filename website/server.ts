import express from "express";
import { createServer, requestNode } from "../packages/core/src/index.js";

const app = express();

app.get("/api/users", (req, res) => {
  res.json([{ id: 1, name: "Alice" }]);
});

const syoraApp = await createServer();
if (syoraApp) app.use(syoraApp.middlewares);

app.use("*all", async (req, res) => {
  await requestNode({ syoraApp, req, res });
});

app.listen(3000);
