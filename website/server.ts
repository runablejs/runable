import { hono } from "@syora/core/adapters/hono";

// server.ts
import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

app.use("*", hono());

app.get("/api/health", (context) => {
  return context.json({ status: "ok" });
});

serve({ fetch: app.fetch, port: 3000 });
