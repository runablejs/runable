// import Express from "express";
import { hono } from "../packages/core/src/index.js";

// const app = Express();

// app.use(express());

// app.listen(3000);

// server.ts
import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

app.use("*", hono());

app.get("/api/health", (context) => {
  return context.json({ status: "ok" });
});

serve({ fetch: app.fetch, port: 3000 });
