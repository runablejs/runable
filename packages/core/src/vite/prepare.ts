import { loadConfig } from "../config";
import { buildViteConfig } from "./config";
import { generateTsconfigs } from "@/utils";
import { createServer } from "vite";

export async function prepare(onlyPrepare = true) {
  await loadConfig();
  generateTsconfigs();

  const config = buildViteConfig();
  const vite = await createServer(config);

  if (onlyPrepare) await vite.close();

  return vite;
}
