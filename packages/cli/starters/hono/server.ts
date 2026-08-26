import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { hono } from "runable/adapters/hono";

const app = new Hono();

app.get("/api/health", (context) => context.json({ status: "ok" }));
app.use("*", hono());

serve({ fetch: app.fetch, port: 3000 });
console.log("Listening on http://localhost:3000");
