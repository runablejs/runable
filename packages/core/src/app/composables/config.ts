import config from ":config";
import type { ClientConfig } from "../../config/load.js";

export function useConfig(): ClientConfig {
  return config;
}
