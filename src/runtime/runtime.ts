import { detectRuntime } from "./detect-runtime.js";
import type { Runtime } from "../types/index.js";

export interface RuntimeAdapter {
  readonly name: Runtime;

  getEnv(key: string): string | undefined;
  getEnvAll(): Record<string, string | undefined>;

  cwd(): string | undefined;
  argv(): string[];
}

type RuntimeGlobals = typeof globalThis & {
  Bun?: {
    env: Record<string, string | undefined>;
  };

  Deno?: {
    env: {
      get(key: string): string | undefined;
      toObject(): Record<string, string>;
    };
    cwd(): string;
    args: string[];
  };

  process?: {
    env: Record<string, string | undefined>;
    cwd(): string;
    argv: string[];
  };
};

export function createRuntime(): RuntimeAdapter {
  const globals = globalThis as RuntimeGlobals;
  const name = detectRuntime();

  switch (name) {
    case "bun": {
      const bun = globals.Bun;
      const process = globals.process;

      if (!bun || !process) {
        throw new Error("Bun runtime APIs are unavailable.");
      }

      return {
        name,

        getEnv: (key) => bun.env[key],
        getEnvAll: () => ({ ...bun.env }),

        cwd: () => process.cwd(),
        argv: () => [...process.argv],
      };
    }

    case "deno": {
      const deno = globals.Deno;

      if (!deno) {
        throw new Error("Deno runtime APIs are unavailable.");
      }

      return {
        name,

        getEnv: (key) => deno.env.get(key),
        getEnvAll: () => deno.env.toObject(),

        cwd: () => deno.cwd(),
        argv: () => [...deno.args],
      };
    }

    case "node": {
      const process = globals.process;

      if (!process) {
        throw new Error("Node.js runtime APIs are unavailable.");
      }

      return {
        name,

        getEnv: (key) => process.env[key],
        getEnvAll: () => ({ ...process.env }),

        cwd: () => process.cwd(),
        argv: () => [...process.argv],
      };
    }

    case "workerd":
      return {
        name,

        getEnv: () => undefined,
        getEnvAll: () => ({}),

        cwd: () => undefined,
        argv: () => [],
      };

    case "browser":
      return {
        name,

        getEnv: () => undefined,
        getEnvAll: () => ({}),

        cwd: () => undefined,
        argv: () => [],
      };
  }
}
