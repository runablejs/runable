import { loadConfig, useConfig } from "../../config/load";
import { buildModule } from "./module.js";
import { buildProduction } from "./production.js";

export async function build() {
  await loadConfig();
  const config = useConfig();

  if (config._isRunableModule) await buildModule();
  else await buildProduction();
}
