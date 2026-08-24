import { hono } from "runable/adapters/hono";
import { Hono } from "hono";

const app = new Hono();

app.use("*", hono());

app.get("/api/health", (context) => {
  return context.json({ status: "ok" });
});

export default app;
