import { join, resolve } from "node:path";
import { getIndexHtml } from "./html.js";
import type { ViteDevServer } from "vite";
import { readdirSync, readFileSync } from "node:fs";
import { useConfig } from "../config/index.js";

export async function serve({
  vite,
  url,
}: {
  vite?: ViteDevServer | null;
  url: string;
}) {
  const config = useConfig();
  let entryPath = resolve(import.meta.dirname, "../entry/entry.js");
  const clientEntry = resolve(import.meta.dirname, "../entry-client.js");

  let template = "";

  try {
    let entry: (typeof import("../entry/entry.js"))["entry"];

    if (vite) {
      template = getIndexHtml(clientEntry);
      template = await vite!.transformIndexHtml(url, template);
    } else {
      const entryFileName = readdirSync(config.distDir).find((dir) =>
        dir.startsWith("entry-"),
      );
      entryPath = join(config.distDir, entryFileName!);
      template = readFileSync(join(config.distDir, "index.html"), "utf-8");
    }

    if (!config.ssr) return template.replace(`<!--app-html-->`, "");

    if (vite) entry = (await vite.ssrLoadModule(entryPath)).entry;
    else entry = (await import(entryPath)).entry;

    const render = await entry({ url, template });

    return render as string;
  } catch (e) {
    vite?.ssrFixStacktrace(e as Error);
    throw e as Error;
  }
}
