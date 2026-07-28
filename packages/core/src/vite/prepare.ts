import { loadConfig } from "../config";
import { buildViteConfig } from "./config";
import { generateTsconfigs } from "@/utils";
import { createServer, type HttpServer } from "vite";

export async function prepare(onlyPrepare = true, httpServer?: HttpServer) {
  await loadConfig();
  generateTsconfigs();

  const config = buildViteConfig(httpServer);
  const vite = await createServer(config);

  // if (onlyPrepare) await vite.close();

  return vite;
}
