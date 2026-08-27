import Fastify from "fastify";
import { fastify } from "runable/adapters/fastify";

const app = Fastify();

app.get("/api/health", async () => ({ status: "ok" }));
await app.register(fastify());

await app.listen({ port: 3000 });
console.log("Listening on http://localhost:3000");
