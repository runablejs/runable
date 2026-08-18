import type { RequestHandler } from "express";

import {
  createNodeHandler,
  type SyoraAdapterOptions,
} from "./shared.js";

/** Creates an Express middleware that initializes and renders Syora. */
export function express(options: SyoraAdapterOptions = {}): RequestHandler {
  const handle = createNodeHandler(options);

  return (req, res, next) => {
    void handle(req, res, next);
  };
}
