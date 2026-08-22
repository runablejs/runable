import config from ":config";
import { ClientConfig } from "@/config";

export function useConfig(): ClientConfig {
  return config;
}
