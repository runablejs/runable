import type { HttpContext } from "@adonisjs/core/http";

import {
  createRunableAppPromise,
  runViteMiddleware,
  type RunableAdapterOptions,
} from "./shared.js";
import { requestNode } from "../vite/request.js";

/** Creates an AdonisJS catch-all route handler for Runable. */
export function adonis(options: RunableAdapterOptions = {}) {
  const runableAppPromise = createRunableAppPromise(options);

  return async ({ request, response }: HttpContext): Promise<void> => {
    const runableApp = await runableAppPromise;
    const req = request.request;
    const res = response.response;

    const handledByVite = await runViteMiddleware(runableApp, req, res);
    if (handledByVite || res.writableEnded) return;

    await requestNode({ runableApp, req, res });
  };
}
