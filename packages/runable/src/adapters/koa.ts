import type { Middleware } from "koa";

import { createNodeHandler, type RunableAdapterOptions } from "./shared.js";

/** Creates a Koa middleware that initializes and renders Runable. */
export function koa(options: RunableAdapterOptions = {}): Middleware {
  const handle = createNodeHandler(options);

  return async (context) => {
    context.respond = false;
    await handle(context.req, context.res);
  };
}
