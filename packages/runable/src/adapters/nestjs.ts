import {
  All,
  Controller,
  Inject,
  Module,
  Next,
  Req,
  Res,
  type DynamicModule,
} from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";

import { createNodeHandler, type RunableAdapterOptions } from "./shared.js";

export const RUNABLE_ADAPTER_OPTIONS = Symbol("RUNABLE_ADAPTER_OPTIONS");

@Controller()
export class RunableController {
  private readonly handle: ReturnType<typeof createNodeHandler>;

  constructor(@Inject(RUNABLE_ADAPTER_OPTIONS) options: RunableAdapterOptions) {
    this.handle = createNodeHandler(options);
  }

  @All("{*path}")
  async fallback(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    await this.handle(req, res, next);
  }
}

@Module({})
export class RunableModule {
  static register(options: RunableAdapterOptions = {}): DynamicModule {
    return {
      module: RunableModule,
      controllers: [RunableController],
      providers: [
        {
          provide: RUNABLE_ADAPTER_OPTIONS,
          useValue: options,
        },
      ],
    };
  }
}
