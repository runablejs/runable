import Fastify from "fastify";
import fastifyMiddie from "@fastify/middie";
import sirv from "sirv";
import { createServer, useConfig, serve } from "@syora/core";

const app = Fastify();
const vite = await createServer();
const config = useConfig();

await app.register(fastifyMiddie);

if (vite) app.use(vite.middlewares);
else app.use(sirv(config.distDir, { extensions: [] }));

app.get("/*", async (req, reply) => {
  const html = await serve({ vite, url: req.url });
  reply.status(200).header("Content-Type", "text/html").send(html);
});

await app.listen({ port: 3000 });
