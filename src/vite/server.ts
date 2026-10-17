import { createServer as _createViteServer, type ViteDevServer } from "vite";

import { createRuntime } from "@/runtime/index.js";
import { createViteConfig } from "./config.js";

export async function createViteServer() {
  const runtime = createRuntime();
  const mode = runtime.getEnv("NODE_ENV") ?? "development";
  let vite: ViteDevServer | null = null;
  const config = createViteConfig();

  if (mode === "development") {
    vite = await _createViteServer(config);
  }

  return vite;
}
