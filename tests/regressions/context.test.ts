import { describe, expect, it } from "vitest";
import type { App } from "vue";

import {
  callWithAppCtx,
  useVueApp,
} from "../../packages/runable/src/context/context.js";

describe("SSR app context", () => {
  it("isolates concurrent application contexts", async () => {
    const firstApp = { id: "first" } as unknown as App;
    const secondApp = { id: "second" } as unknown as App;

    const [first, second] = await Promise.all([
      callWithAppCtx(firstApp, async () => {
        await Promise.resolve();
        return useVueApp();
      }),
      callWithAppCtx(secondApp, async () => {
        await Promise.resolve();
        return useVueApp();
      }),
    ]);

    expect(first).toBe(firstApp);
    expect(second).toBe(secondApp);
  });
});
