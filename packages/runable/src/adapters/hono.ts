import type { MiddlewareHandler } from "hono";
import type { IncomingMessage, ServerResponse } from "node:http";

import {
  createRunableAppPromise,
  runViteMiddleware,
  type RunableAdapterOptions,
} from "./shared.js";
import { requestNode, requestWeb } from "../vite/request.js";

type HonoNodeBindings = {
  incoming?: IncomingMessage;
  outgoing?: ServerResponse;
};

const RESPONSE_ALREADY_SENT = new Response(null, {
  headers: { "x-hono-already-sent": "true" },
});

/** Creates a Hono middleware that renders Runable when no backend route matched. */
export function hono(options: RunableAdapterOptions = {}): MiddlewareHandler {
  const runableAppPromise = createRunableAppPromise(options);

  return async (context, next) => {
    const runableApp = await runableAppPromise;

    await next();
    if (context.res.status !== 404) return context.res;

    const env = context.env as HonoNodeBindings;
    if (env?.incoming && env?.outgoing) {
      const handledByVite = await runViteMiddleware(
        runableApp,
        env.incoming,
        env.outgoing,
      );

      if (!handledByVite && !env.outgoing.writableEnded) {
        await requestNode({
          runableApp,
          req: env.incoming,
          res: env.outgoing,
        });
      }

      return RESPONSE_ALREADY_SENT;
    }

    return requestWeb({ runableApp, req: context.req.raw });
  };
}
