import { loadConfig, useConfig } from "../config";
import { buildViteConfig } from "./config";
import { generateTsconfigs } from "@/utils";
import { createServer } from "vite";

export async function prepare(onlyPrepare = true) {
  await loadConfig();
  generateTsconfigs();
  const vite = await createServer(buildViteConfig(useConfig()));

  if (onlyPrepare) await vite.close();

  return vite;
}
