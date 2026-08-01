import { loadConfig, useAllConfigs } from "@/config";
import type { AppHooks } from "@/context/context";
import type { HookCallback } from "@/context/hook";

export async function addConfigHooks() {
  console.log("+++++");

  // await loadConfig();
  // const configs = useAllConfigs();

  // for (const config of configs) {
  //   if (config.hooks) {
  //     const appCtx = useApp();
  //     const hooks = Object.entries(config.hooks) as [
  //       AppHooks,
  //       HookCallback,
  //     ][];

  //     for (const [key, fn] of hooks) {
  //       appCtx.hook(key, fn);
  //     }
  //   }
  // }
}
