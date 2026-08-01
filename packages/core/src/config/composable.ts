import config from ":config";
import type { ClientConfig } from "./load.js";

export function useConfig(): ClientConfig {
  return config;
}
