import Fastify from "fastify";
import middie from "@fastify/middie";
import fastifyStatic from "@fastify/static";
import { createServer, useConfig, serve } from "../../../src";
import { join } from "node:path";

const app = Fastify();

const vite = await createServer();
const config = useConfig();

await app.register(middie);

if (vite) {
  app.use(vite.middlewares);
} else {
  await app.register(fastifyStatic, {
    root: join(config.distDir, "client"),
    extensions: [],
    wildcard: false,
  });
}

app.all("*", async (req, reply) => {
  const html = await serve({ vite, url: req.raw.url ?? req.url });
  reply.type("text/html").send(html);
});

await app.listen({ port: 5173 });
