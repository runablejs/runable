import { loadConfig } from "../config";
import { type ViteDevServer } from "vite";
import { generateTsconfigs } from "@/utils";

export async function createServer() {
  const isProduction = process.env.NODE_ENV === "production";
  let vite: ViteDevServer | null = null;

  await loadConfig();

  if (!isProduction) {
    const { prepare } = await import("./prepare.js");
    vite = await prepare();

    generateTsconfigs();
  }

  return vite;
}
