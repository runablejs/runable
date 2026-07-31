import { LAYOUTS_CONTEXT_KEY } from "./symbols";
import { inject } from "vue";

export function useLayouts() {
  const layouts =
    inject<Record<string, () => Promise<Component>>>(LAYOUTS_CONTEXT_KEY);

  if (!layouts) {
    throw new Error(
      "useLayouts must be used within an app initialized with createAsyncDataPlugin()",
    );
  }

  return layouts;
}
