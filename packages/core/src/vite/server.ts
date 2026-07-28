import { loadConfig } from "../config";
import { type HttpServer, type ViteDevServer } from "vite";
import { generateTsconfigs } from "@/utils";

export async function createServer(httpServer: HttpServer) {
  const isProduction = process.env.NODE_ENV === "production";
  let vite: ViteDevServer | null = null;

  await loadConfig();

  if (!isProduction) {
    const { prepare } = await import("./prepare.js");
    vite = await prepare(false, httpServer);

    generateTsconfigs();
  }

  return vite;
}
