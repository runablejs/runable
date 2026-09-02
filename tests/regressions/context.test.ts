import { describe, expect, it } from "vitest";
import type { App } from "vue";

import {
  callWithAppCtx,
  useVueApp,
} from "../../packages/runable/src/context/context.js";
import {
  createHooks,
  installLifecycleBridge,
} from "../../packages/runable/src/context/hook.js";

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

  it("runs root lifecycle hooks without relying on the ambient context", async () => {
    let mixin: Record<string, (this: { $parent: null }) => unknown> = {};
    const app = {
      mixin(value: typeof mixin) {
        mixin = value;
      },
    } as unknown as App;
    const hooks = createHooks();
    let receivedApp: unknown;

    hooks.hook("app:created", (appContext) => {
      receivedApp = appContext;
    });
    installLifecycleBridge(app, hooks);

    await mixin.created?.call({ $parent: null });

    expect(receivedApp).toBe(app);
  });
});
