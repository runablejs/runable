import type { IncomingMessage, ServerResponse } from "node:http";
import type { ViteDevServer } from "vite";

import { createRunableApp } from "../vite/server.js";
import { requestNode } from "../vite/request.js";

export type RunableAdapterOptions = {
  /** Reuse an application initialized elsewhere instead of creating one. */
  runableApp?: Promise<ViteDevServer | null> | ViteDevServer | null;
};

export type NodeNext = (error?: unknown) => unknown;

export function createRunableAppPromise(options: RunableAdapterOptions = {}) {
  return Promise.resolve(options.runableApp ?? createRunableApp());
}

/** Runs Vite's Connect middleware and reports whether it ended the response. */
export async function runViteMiddleware(
  runableApp: ViteDevServer | null,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<boolean> {
  if (!runableApp) return false;

  return new Promise<boolean>((resolve, reject) => {
    let settled = false;

    const finish = (handled: boolean, error?: unknown) => {
      if (settled) return;
      settled = true;
      res.off("finish", onResponseEnd);
      res.off("close", onResponseEnd);
      if (error) reject(error);
      else resolve(handled);
    };

    const onResponseEnd = () => finish(true);
    res.once("finish", onResponseEnd);
    res.once("close", onResponseEnd);

    runableApp.middlewares(req, res, (error: unknown) => {
      if (error) finish(false, error);
      else finish(res.writableEnded);
    });
  });
}

export function createNodeHandler(options: RunableAdapterOptions = {}) {
  const runableAppPromise = createRunableAppPromise(options);

  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next?: NodeNext,
  ): Promise<void> => {
    try {
      const runableApp = await runableAppPromise;
      const handledByVite = await runViteMiddleware(runableApp, req, res);
      if (handledByVite || res.writableEnded) return;

      await requestNode({ runableApp, req, res });
    } catch (error) {
      if (next) {
        next(error);
        return;
      }
      throw error;
    }
  };
}
