import { loadRuntimeEnv } from "@/utils/load-env.js";
import type { RuntimeValues } from "./types.js";
import merge from "lodash/merge.js";

export function useRuntime(): RuntimeValues {
  const envs = loadRuntimeEnv();
  return merge(envs.runtime.private, {
    public: envs.runtime.public,
  }) as unknown as RuntimeValues;
}
