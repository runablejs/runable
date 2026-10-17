import type { Runtime } from "../types/index.js";

export function detectRuntime(): Runtime {
  const g = globalThis as typeof globalThis & {
    Bun?: unknown;
    Deno?: unknown;
    process?: {
      versions?: {
        node?: string;
      };
    };
  };

  // Bun also exposes Node.js-compatible APIs.
  if (typeof g.Bun !== "undefined") {
    return "bun";
  }

  // Deno exposes its own global runtime API.
  if (typeof g.Deno !== "undefined") {
    return "deno";
  }

  // Detect Cloudflare Workers before generic Node.js checks.
  // Workers exposes the `workerd` compatibility identifier.
  if (
    typeof g.navigator !== "undefined" &&
    g.navigator.userAgent === "Cloudflare-Workers"
  ) {
    return "workerd";
  }

  // Detect Node.js using its runtime version identifier.
  if (typeof g.process?.versions?.node === "string") {
    return "node";
  }

  // Browser environments expose both window and document.
  if (typeof g.window !== "undefined" && typeof g.document !== "undefined") {
    return "browser";
  }

  throw new Error(
    "Unsupported runtime: unable to detect the current JavaScript environment.",
  );
}
