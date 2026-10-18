import { createServer } from "vite";

import { loadConfig } from "../config/load.js";
import { createViteConfig } from "./config.js";
import { writeTsConfig } from "@/utils/tsconfig.js";

export async function prepare(onlyPrepare = true) {
  await loadConfig();

  const config = createViteConfig();
  const vite = await createServer(config);

  if (onlyPrepare) {
    await vite.close();
    writeTsConfig();
  }

  return vite;
}
