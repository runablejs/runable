import type { RuntimeValues } from "../types.js";
import { values } from ":runtime";

export function useRuntime(): RuntimeValues {
  return values;
}
