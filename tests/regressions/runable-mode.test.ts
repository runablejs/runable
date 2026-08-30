import { afterEach, describe, expect, it } from "vitest";

import {
  getRunableMode,
  isRunableProduction,
} from "../../packages/runable/src/utils/mode.js";

const originalMode = process.env.RUNABLE_MODE;
const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  if (originalMode === undefined) delete process.env.RUNABLE_MODE;
  else process.env.RUNABLE_MODE = originalMode;

  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
});

describe("RUNABLE_MODE", () => {
  it("defaults to development", () => {
    delete process.env.RUNABLE_MODE;

    expect(getRunableMode()).toBe("development");
    expect(isRunableProduction()).toBe(false);
  });

  it("uses production only when explicitly selected", () => {
    process.env.RUNABLE_MODE = "production";

    expect(getRunableMode()).toBe("production");
    expect(isRunableProduction()).toBe(true);
  });

  it("does not use NODE_ENV as the Runable mode", () => {
    delete process.env.RUNABLE_MODE;
    process.env.NODE_ENV = "production";

    expect(getRunableMode()).toBe("development");
  });
});
