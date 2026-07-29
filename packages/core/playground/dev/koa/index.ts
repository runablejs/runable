import { createServer, useConfig, serve } from "../../../src";
import Koa from "koa";
import koaConnect from "koa-connect";
import koaStatic from "koa-static";
import { join } from "node:path";

process.env.NODE_ENV = "production";
const app = new Koa();

const vite = await createServer();
const config = useConfig();

if (vite) app.use(koaConnect(vite.middlewares));
else {
  app.use(koaStatic(join(config.distDir, "client"), { extensions: [] }));
}

app.use(async (ctx) => {
  const html = await serve({ vite, url: ctx.path });
  ctx.type = "text/html";
  ctx.body = html;
});

app.listen(5173);
