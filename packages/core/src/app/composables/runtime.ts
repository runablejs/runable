import type { RuntimeValues } from "../../runtime/types.js";
import { values } from ":runtime";

export function useRuntime(): RuntimeValues {
  return values;
}
