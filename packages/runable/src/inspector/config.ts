import { join } from "node:path";

import type { ResolvedConfig } from "@/config/types.js";
import { loadRuntimeEnv } from "@/utils/load-env.js";
import { toProjectRelative } from "./relative.js";
import { toSerializable } from "./serialize.js";
import type { InspectorConfig } from "./types.js";

/**
 * Runtime env privacy: reuses `loadRuntimeEnv()` unchanged — the exact
 * function the real `runable:runtime` Vite plugin uses to split
 * `RUN_*`/`VITE_*` variables into `public` (`*_PUBLIC_*`, shipped to the
 * client) and everything else (server-only) — see `utils/load-env.ts`.
 * This is Runable's one and only public/private convention; the Inspector
 * doesn't invent a second one.
 *
 * Only `runtime.public`'s *values* are ever returned. For everything else,
 * only the *key names* are exposed (never the value) — the whole point of
 * this boundary. See the module doc on `./index.js`.
 *
 * `path` is passed explicitly (`<rootDir>/.env`) rather than left to
 * `loadRuntimeEnv()`'s own `process.cwd()` default: by the time this runs,
 * the process may already be back outside the brief `rootDir` `chdir`
 * window `resolveState()` uses (see `./index.js`).
 */
export function resolveInspectorConfig(rootDir: string, main: ResolvedConfig): InspectorConfig {
  const env = loadRuntimeEnv({ path: join(rootDir, ".env") });

  return {
    appDir: toProjectRelative(main._cwd, main.appDir),
    ssr: main.ssr,
    baseUrl: main.baseUrl,
    siteUrl: main.siteUrl,
    devtools: main.devtools,
    head: toSerializable(main.head),
    runtime: {
      public: toSerializable(env.runtime.public) ?? {},
      privateKeys: Object.keys(env.runtime.private).sort(),
    },
  };
}
