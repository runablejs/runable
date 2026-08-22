import {
  createRunableAppPromise,
  type RunableAdapterOptions,
} from "./shared.js";
import { requestWeb } from "../vite/request.js";
import type { WebFetchHandler } from "./bun.js";

/** Creates a Fetch API handler compatible with `Deno.serve()`. */
export function deno(options: RunableAdapterOptions = {}): WebFetchHandler {
  const runableAppPromise = createRunableAppPromise(options);

  return async (req) => {
    const runableApp = await runableAppPromise;
    return requestWeb({ runableApp, req });
  };
}
