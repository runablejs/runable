import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { detectRuntime } from "../runtime/detect-runtime.js";

export async function loadAsset(path: string): Promise<Uint8Array> {
  const runtime = detectRuntime();

  // Resolve the asset path from the current working directory.
  const assetPath = resolve(path);

  switch (runtime) {
    case "node":
    case "bun":
    case "deno":
      return readFile(assetPath);

    case "workerd":
      throw new Error(
        "File system access is not available in this runtime. " +
          "Load assets through the platform asset binding instead.",
      );

    default:
      throw new Error(`Unsupported runtime: ${runtime}`);
  }
}
