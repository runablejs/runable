import Fastify from "fastify";
import { fastify } from "runable/adapters/fastify";

const app = Fastify();
await app.register(fastify());

await app.listen({ port: 5173 });
