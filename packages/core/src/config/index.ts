import { loadConfig as c12Load } from "c12";
import { resolveConfig } from "./resolve";
import { type ResolvableHead } from "@unhead/vue";
import type { UserConfig } from "vite";

export type Config = {
  appDir?: string;
  globalsDir?: string[];
  pagesDirs?: string[];
  pluginsDirs?: string[];
  layoutsDirs?: string[];
  componentsDirs?: string[];
  css?: string[];

  output?: string;
  distDir?: string;
  baseUrl?: string;

  ssr?: boolean;
  devtools?: boolean;

  alias?: Record<string, string>;

  siteUrl?: string;
  head?: ResolvableHead;

  vite?: Omit<
    UserConfig,
    "ssr" | "appType" | "server" | "root" | "base" | "publicDir"
  >;

  publicDir?: UserConfig["publicDir"];
};

export type ClientConfig = Pick<Config, "head" | "ssr" | "siteUrl" | "baseUrl">;

let cachedConfig: Required<Config> | undefined;

export function defineConfig<TConfig extends Config>(config: TConfig): TConfig {
  return config;
}

export async function loadConfig() {
  if (cachedConfig) return cachedConfig;

  const { config } = await c12Load<Config>({
    configFile: "syora.config",
  });

  cachedConfig = resolveConfig(config);
}

export function useConfig() {
  if (!cachedConfig) {
    throw new Error(
      "Syora config is not loaded. Call loadSyoraConfigs() first.",
    );
  }

  return cachedConfig;
}
