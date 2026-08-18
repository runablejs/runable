import type { MiddlewareHandler } from "hono";
import type { IncomingMessage, ServerResponse } from "node:http";

import {
  createSyoraAppPromise,
  runViteMiddleware,
  type SyoraAdapterOptions,
} from "./shared.js";
import { requestNode, requestWeb } from "../vite/request.js";

type HonoNodeBindings = {
  incoming?: IncomingMessage;
  outgoing?: ServerResponse;
};

const RESPONSE_ALREADY_SENT = new Response(null, {
  headers: { "x-hono-already-sent": "true" },
});

/** Creates a Hono middleware that renders Syora when no backend route matched. */
export function hono(options: SyoraAdapterOptions = {}): MiddlewareHandler {
  const syoraAppPromise = createSyoraAppPromise(options);

  return async (context, next) => {
    const syoraApp = await syoraAppPromise;

    await next();
    if (context.res.status !== 404) return context.res;

    const env = context.env as HonoNodeBindings;
    if (env?.incoming && env?.outgoing) {
      const handledByVite = await runViteMiddleware(
        syoraApp,
        env.incoming,
        env.outgoing,
      );

      if (!handledByVite && !env.outgoing.writableEnded) {
        await requestNode({
          syoraApp,
          req: env.incoming,
          res: env.outgoing,
        });
      }

      return RESPONSE_ALREADY_SENT;
    }

    return requestWeb({ syoraApp, req: context.req.raw });
  };
}
