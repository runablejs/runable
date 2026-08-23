import { describe, it, expect, vi } from "vitest";
import { createApp, type App } from "vue";
import type { VuePluginObject } from "../../packages/runable/dist/plugin/types.js";

// `installPlugins` (the only public export of packages/runable/src/plugin/index.ts)
// reads its plugin list from the build-injected virtual module ":plugins" —
// only that virtual module is mocked below; the real ordering/awaiting
// orchestration logic in installPlugins runs unmocked.
async function installWithPlugins(plugins: VuePluginObject[]) {
  vi.resetModules();
  vi.doMock(":plugins", () => ({ plugins }));
  const { installPlugins } = await import("../../packages/runable/dist/plugin/index.js");
  const app = createApp({}) as App;
  await installPlugins(app);
  return app;
}

describe("regression #010 - a dependent plugin observes a fully-awaited async setup", () => {
  it("waits for auth's async setup (including its internal await) before running api's setup", async () => {
    const seenAuthAtApiSetup: unknown[] = [];

    const auth: VuePluginObject = {
      name: "auth",
      async setup(app) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        app.provide("auth", true);
      },
    };
    const api: VuePluginObject = {
      name: "api",
      dependsOn: ["auth"],
      setup(app) {
        seenAuthAtApiSetup.push((app as any)._context.provides.auth);
      },
    };

    await installWithPlugins([api, auth]);

    expect(seenAuthAtApiSetup).toEqual([true]);
  });
});

describe("regression #011 - a dependency in a later enforce group is rejected, not silently misordered", () => {
  it("throws instead of running consumer before its post-enforce dependency", async () => {
    const order: string[] = [];

    const late: VuePluginObject = {
      name: "late",
      enforce: "post",
      setup() {
        order.push("late");
      },
    };
    const consumer: VuePluginObject = {
      name: "consumer",
      dependsOn: ["late"],
      setup() {
        order.push("consumer");
      },
    };

    await expect(installWithPlugins([consumer, late])).rejects.toThrow(
      /cannot depend on "late"/,
    );

    // The historical bug silently ran consumer, then late, with no error at
    // all — guard against that regressing back in, in case the throw above
    // is ever loosened.
    expect(order).not.toEqual(["consumer", "late"]);
  });
});
