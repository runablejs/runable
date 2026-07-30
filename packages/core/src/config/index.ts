import { loadConfig as c12Load } from "c12";
import { resolveConfig } from "./resolve";
import { type ResolvableHead } from "@unhead/vue";
import type { UserConfig } from "vite";
import type { Arrayable } from "@/utils";
import type { ComponentDir } from "@/components/types";

export type Config = {
  cwd?: string;

  appDir?: string;
  globalsDir?: string[];
  pagesDirs?: string[];
  pluginsDirs?: string[];
  layoutsDirs?: string[];

  components?: Arrayable<ComponentDir>;
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
    "ssr" | "appType" | "server" | "root" | "base" | "publicDir" | "syoraConfig"
  >;

  publicDir?: UserConfig["publicDir"];
};

export type ResolvedConfig = Required<Config> & {
  cwd: string;
  components: ComponentDir[];
};

export type ClientConfig = Pick<Config, "head" | "ssr" | "siteUrl" | "baseUrl">;

let cachedConfig: ResolvedConfig | undefined;

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
