import { type ViteDevServer } from "vite";

import { createRuntime } from "@/runtime/index.js";
import { writeTsConfig } from "@/utils/tsconfig.js";

/**
 * Loads the Runable configuration and prepares the application runtime.
 * Returns Vite's middleware server in development and `null` in production.
 */
export async function createViteServer() {
  const runtime = createRuntime();
  const mode = runtime.getEnv("NODE_ENV") ?? "development";
  let vite: ViteDevServer | null = null;

  if (mode === "development") {
    const { prepare } = await import("./prepare.js");
    vite = await prepare(false);

    writeTsConfig();
  }

  return vite;
}
