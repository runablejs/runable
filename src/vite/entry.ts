import { join } from "node:path";
import { readFile } from "node:fs/promises";

import type { Manifest } from "vite";

import { useConfig } from "@/config/load.js";

type RuntimeEntry = import("vite").ManifestChunk & {
  absolute: string;
  url: string;
};

let clientEntry: RuntimeEntry | undefined;
let serverEntry: RuntimeEntry | undefined;

function toPublicUrl(baseUrl: string | undefined, file: string): string {
  const base = baseUrl ?? "/";

  if (/^https?:\/\//.test(base)) {
    return new URL(file, base.endsWith("/") ? base : `${base}/`).href;
  }

  const prefix = base.endsWith("/") ? base : `${base}/`;
  return `${prefix}${file}`.replace(/([^:]\/)\/+/g, "$1");
}

async function getEntry(
  directory: "client" | "server",
  sourceSuffix: string,
): Promise<RuntimeEntry> {
  const config = useConfig();
  const mPath = join(config.distDir, directory, "manifest.json");
  const manifest: Manifest = JSON.parse(await readFile(mPath, "utf-8"));
  const entry = Object.values(manifest).find((chunk) => {
    return (
      chunk.isEntry && chunk.src?.replace(/\\/g, "/").endsWith(sourceSuffix)
    );
  });

  if (!entry) {
    throw new Error(
      `Unable to find the Runable ${directory} entry in Vite's manifest.`,
    );
  }

  return {
    ...entry,
    absolute: join(config.distDir, directory, entry.file),
    url: toPublicUrl(config.baseUrl, entry.file),
  };
}

export async function getServerEntry(): Promise<RuntimeEntry> {
  serverEntry ??= await getEntry("server", "/vue/render.ts");
  return serverEntry;
}

export async function getClientEntry(): Promise<RuntimeEntry> {
  clientEntry ??= await getEntry("client", "/vue/client.ts");
  return clientEntry;
}
