import { loadConfig } from "../config/load";
import { buildViteConfig } from "./config";
import { writeTsConfig } from "@/utils";
import { createServer } from "vite";

export async function prepare(onlyPrepare = true) {
  await loadConfig();

  const config = buildViteConfig();
  const vite = await createServer(config);

  if (onlyPrepare) {
    await vite.close();
    writeTsConfig();
  }

  return vite;
}
