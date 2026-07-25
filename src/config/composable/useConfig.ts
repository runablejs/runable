import config from ":config";
import type { ClientConfig } from "../index.js";

export function useConfig(): ClientConfig {
  return config;
}
