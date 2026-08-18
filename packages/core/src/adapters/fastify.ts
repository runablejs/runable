import type { FastifyPluginAsync } from "fastify";

import {
  createSyoraAppPromise,
  runViteMiddleware,
  type SyoraAdapterOptions,
} from "./shared.js";
import { requestNode } from "../vite/request.js";

/** Creates a Fastify plugin that registers Syora as the frontend fallback. */
export function fastify(
  options: SyoraAdapterOptions = {},
): FastifyPluginAsync {
  const syoraAppPromise = createSyoraAppPromise(options);

  return async (app) => {
    app.all("*", async (request, reply) => {
      const syoraApp = await syoraAppPromise;
      const handledByVite = await runViteMiddleware(
        syoraApp,
        request.raw,
        reply.raw,
      );

      if (!handledByVite && !reply.raw.writableEnded) {
        await requestNode({ syoraApp, req: request.raw, res: reply.raw });
      }

      reply.hijack();
      return reply;
    });
  };
}
