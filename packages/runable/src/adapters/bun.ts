import {
  createRunableAppPromise,
  type RunableAdapterOptions,
} from "./shared.js";
import { requestWeb } from "../vite/request.js";

export type WebFetchHandler = (
  request: Request,
) => Response | Promise<Response>;

/** Creates a Fetch API handler compatible with `Bun.serve({ fetch })`. */
export function bun(options: RunableAdapterOptions = {}): WebFetchHandler {
  const runableAppPromise = createRunableAppPromise(options);

  return async (req) => {
    const runableApp = await runableAppPromise;
    return requestWeb({ runableApp, req });
  };
}
