import { loadConfig, useConfig } from "../config";
import { buildViteConfig } from "./config";
import { generateTsconfigs } from "@/utils";
import { createServer } from "vite";

export async function prepare() {
  await loadConfig();
  generateTsconfigs();

  const vite = await createServer(buildViteConfig(useConfig()));
  return vite;
}
