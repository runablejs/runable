import type { HttpContext } from "@adonisjs/core/http";

import {
  createSyoraAppPromise,
  runViteMiddleware,
  type SyoraAdapterOptions,
} from "./shared.js";
import { requestNode } from "../vite/request.js";

/** Creates an AdonisJS catch-all route handler for Syora. */
export function adonis(options: SyoraAdapterOptions = {}) {
  const syoraAppPromise = createSyoraAppPromise(options);

  return async ({ request, response }: HttpContext): Promise<void> => {
    const syoraApp = await syoraAppPromise;
    const req = request.request;
    const res = response.response;

    const handledByVite = await runViteMiddleware(syoraApp, req, res);
    if (handledByVite || res.writableEnded) return;

    await requestNode({ syoraApp, req, res });
  };
}
