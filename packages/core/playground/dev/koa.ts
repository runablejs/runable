import { createServer as createHttpServer } from "node:http";
import sirv from "sirv";
import { createServer, useConfig, serve } from "../../src";
import Koa from "koa";
import koaConnect from "koa-connect";
import { join } from "node:path";

process.env.NODE_ENV = "production";
const app = new Koa();
const httpServer = createHttpServer(app.callback());

const vite = await createServer(httpServer);
const config = useConfig();

if (vite) app.use(koaConnect(vite.middlewares));
else {
  app.use(koaConnect(sirv(join(config.distDir, "client"), { extensions: [] })));
}

app.use(async (ctx) => {
  const html = await serve({ vite, url: ctx.path });
  ctx.type = "text/html";
  ctx.body = html;
});

httpServer.listen(5173);
