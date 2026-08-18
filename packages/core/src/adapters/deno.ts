import {
  createSyoraAppPromise,
  type SyoraAdapterOptions,
} from "./shared.js";
import { requestWeb } from "../vite/request.js";
import type { WebFetchHandler } from "./bun.js";

/** Creates a Fetch API handler compatible with `Deno.serve()`. */
export function deno(options: SyoraAdapterOptions = {}): WebFetchHandler {
  const syoraAppPromise = createSyoraAppPromise(options);

  return async (req) => {
    const syoraApp = await syoraAppPromise;
    return requestWeb({ syoraApp, req });
  };
}
