import type { FastifyPluginAsync } from "fastify";

import {
  createRunableAppPromise,
  runViteMiddleware,
  type RunableAdapterOptions,
} from "./shared.js";
import { requestNode } from "../vite/request.js";

/** Creates a Fastify plugin that registers Runable as the frontend fallback. */
export function fastify(
  options: RunableAdapterOptions = {},
): FastifyPluginAsync {
  const runableAppPromise = createRunableAppPromise(options);

  return async (app) => {
    app.all("*", async (request, reply) => {
      const runableApp = await runableAppPromise;
      const handledByVite = await runViteMiddleware(
        runableApp,
        request.raw,
        reply.raw,
      );

      if (!handledByVite && !reply.raw.writableEnded) {
        await requestNode({ runableApp, req: request.raw, res: reply.raw });
      }

      reply.hijack();
      return reply;
    });
  };
}
