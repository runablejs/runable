import type { NestMiddleware } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";

import {
  createNodeHandler,
  type SyoraAdapterOptions,
} from "./shared.js";

/** Creates a middleware for Nest applications using the Express platform. */
export function nestjs(options: SyoraAdapterOptions = {}): NestMiddleware["use"] {
  const handle = createNodeHandler(options);

  return (req: Request, res: Response, next: NextFunction) => {
    void handle(req, res, next);
  };
}
