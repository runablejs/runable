import type { IncomingMessage, ServerResponse } from "node:http";
import type { ViteDevServer } from "vite";

import { createSyoraApp } from "../vite/server.js";
import { requestNode } from "../vite/request.js";

export type SyoraAdapterOptions = {
  /** Reuse an application initialized elsewhere instead of creating one. */
  syoraApp?: Promise<ViteDevServer | null> | ViteDevServer | null;
};

export type NodeNext = (error?: unknown) => unknown;

export function createSyoraAppPromise(options: SyoraAdapterOptions = {}) {
  return Promise.resolve(options.syoraApp ?? createSyoraApp());
}

/** Runs Vite's Connect middleware and reports whether it ended the response. */
export async function runViteMiddleware(
  syoraApp: ViteDevServer | null,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<boolean> {
  if (!syoraApp) return false;

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

    syoraApp.middlewares(req, res, (error: unknown) => {
      if (error) finish(false, error);
      else finish(res.writableEnded);
    });
  });
}

export function createNodeHandler(options: SyoraAdapterOptions = {}) {
  const syoraAppPromise = createSyoraAppPromise(options);

  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next?: NodeNext,
  ): Promise<void> => {
    try {
      const syoraApp = await syoraAppPromise;
      const handledByVite = await runViteMiddleware(syoraApp, req, res);
      if (handledByVite || res.writableEnded) return;

      await requestNode({ syoraApp, req, res });
    } catch (error) {
      if (next) {
        next(error);
        return;
      }
      throw error;
    }
  };
}
