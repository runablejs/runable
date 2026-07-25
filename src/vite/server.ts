import { loadConfig, useConfig } from "../config";
import { type ViteDevServer } from "vite";
import { buildViteConfig } from "./config";
import { generateTsconfigs } from "@/utils";

export async function createViteServer() {
  const isProduction = process.env.NODE_ENV === "production";
  let vite: ViteDevServer | null = null;

  await loadConfig();

  if (!isProduction) {
    const { createServer } = await import("vite");
    vite = await createServer(buildViteConfig(useConfig()));

    generateTsconfigs();
  }

  return vite;
}
