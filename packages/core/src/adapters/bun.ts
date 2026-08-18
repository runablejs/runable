import {
  createSyoraAppPromise,
  type SyoraAdapterOptions,
} from "./shared.js";
import { requestWeb } from "../vite/request.js";

export type WebFetchHandler = (request: Request) => Response | Promise<Response>;

/** Creates a Fetch API handler compatible with `Bun.serve({ fetch })`. */
export function bun(options: SyoraAdapterOptions = {}): WebFetchHandler {
  const syoraAppPromise = createSyoraAppPromise(options);

  return async (req) => {
    const syoraApp = await syoraAppPromise;
    return requestWeb({ syoraApp, req });
  };
}
