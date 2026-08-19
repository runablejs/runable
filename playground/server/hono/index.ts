import { serve as server, type HttpBindings } from "@hono/node-server";
import { Hono } from "hono";
import { hono } from "@syora/core/adapters/hono";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use("*", hono());

server({ fetch: app.fetch, port: 5173 });
