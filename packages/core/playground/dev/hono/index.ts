import { serve as server, type HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import {
  createServer as createViteServer,
  useConfig,
  serve,
} from "../../../src";
import { join } from "node:path";

const app = new Hono<{ Bindings: HttpBindings }>();

const vite = await createViteServer();
const config = useConfig();

if (vite) {
  app.use("*", async (c, next) => {
    await new Promise<void>((resolve) => {
      vite.middlewares(c.env.incoming, c.env.outgoing, () => resolve());
    });

    await next();
  });
} else {
  app.use("*", serveStatic({ root: join(config.distDir, "client") }));
}

app.all("*", async (c) => {
  const url = new URL(c.req.url);
  const html = await serve({ vite, url: url.pathname + url.search });
  return c.html(html);
});

server({ fetch: app.fetch, port: 5173 });
