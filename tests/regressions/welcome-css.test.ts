import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("built-in welcome component styles", () => {
  it("imports the extracted stylesheet from the compiled component", () => {
    const componentDir = path.resolve(
      "packages/runable/dist/app/components",
    );
    const component = readFileSync(
      path.join(componentDir, "runable-welcome.js"),
      "utf8",
    );
    const cssImport = component.match(/^import "\.\/(.+\.css)";/m);

    expect(cssImport?.[1]).toBeTruthy();

    const stylesheet = path.join(componentDir, cssImport![1]);
    expect(existsSync(stylesheet)).toBe(true);
    expect(readFileSync(stylesheet, "utf8")).toContain(".welcome-shell");
  });
});
