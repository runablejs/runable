import { loadConfig } from "../config/load.js";
import { type ViteDevServer } from "vite";
import { writeTsConfig } from "@/utils";

/**
 * Loads the Runable configuration and prepares the application runtime.
 * Returns Vite's middleware server in development and `null` in production.
 */
export async function createRunableApp() {
  const isProduction = process.env.NODE_ENV === "production";
  let vite: ViteDevServer | null = null;

  await loadConfig();

  if (!isProduction) {
    const { prepare } = await import("./prepare.js");
    vite = await prepare(false);

    writeTsConfig();
  }

  return vite;
}
