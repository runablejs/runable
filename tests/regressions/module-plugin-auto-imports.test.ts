import { describe, expect, it } from "vitest";

import { shouldTransformComponents } from "../../packages/runable/dist/components/unplugin.js";
import { shouldTransformGlobals } from "../../packages/runable/dist/globals/unplugin.js";

describe("module resource auto-imports", () => {
  it.each([
    "plugins/pinia.js",
    "components/card.vue",
    "layouts/default.vue",
    "pages/index.vue",
    "middlewares/auth.js",
    "composables/state.js",
    "globals/helpers.js",
  ])("transforms a registered %s file from node_modules", (resource) => {
    const file = `/project/node_modules/.pnpm/example/node_modules/example/dist/app/${resource}`;

    expect(shouldTransformGlobals(file, [file])).toBe(true);
    expect(shouldTransformGlobals(`${file}?v=123`, [file])).toBe(true);
    expect(shouldTransformComponents(file, [file])).toBe(true);
    expect(shouldTransformComponents(`${file}?v=123`, [file])).toBe(true);
  });

  it("continues to ignore unrelated dependencies and virtual modules", () => {
    expect(
      shouldTransformGlobals("/project/node_modules/pinia/dist/pinia.mjs", []),
    ).toBe(false);
    expect(shouldTransformGlobals("\0:plugins", [])).toBe(false);
    expect(shouldTransformGlobals("/project/app/plugins/local.ts", [])).toBe(
      true,
    );
    expect(
      shouldTransformComponents(
        "/project/node_modules/pinia/dist/pinia.mjs",
        [],
      ),
    ).toBe(false);
    expect(
      shouldTransformComponents("/project/app/components/local.vue", []),
    ).toBe(true);
  });
});
