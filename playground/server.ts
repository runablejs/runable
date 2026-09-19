// server.ts
import Express from "express";
import { express } from "runable/adapters/express";

const server = Express();

server.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// The adapter initializes Runable once and serves the frontend.
server.use(express());

server.listen(3000, () => {
  console.log("http://localhost:3000");
});
