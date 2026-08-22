import type { RequestHandler } from "express";

import { createNodeHandler, type RunableAdapterOptions } from "./shared.js";

/** Creates an Express middleware that initializes and renders Runable. */
export function express(options: RunableAdapterOptions = {}): RequestHandler {
  const handle = createNodeHandler(options);

  return (req, res, next) => {
    void handle(req, res, next);
  };
}
