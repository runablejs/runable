import type { Middleware } from "koa";

import {
  createNodeHandler,
  type SyoraAdapterOptions,
} from "./shared.js";

/** Creates a Koa middleware that initializes and renders Syora. */
export function koa(options: SyoraAdapterOptions = {}): Middleware {
  const handle = createNodeHandler(options);

  return async (context) => {
    context.respond = false;
    await handle(context.req, context.res);
  };
}
