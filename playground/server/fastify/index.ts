import Fastify from "fastify";
import { fastify } from "@syora/core";

const app = Fastify();
await app.register(fastify());

await app.listen({ port: 5173 });
