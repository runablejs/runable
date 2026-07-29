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
  let entryPath = resolve(import.meta.dirname, "../entry/switcher.js");
  let template: string;

  try {
    let render: (typeof import("../entry/switcher.js"))["render"];

    if (vite) {
      template = getIndexHtml(
        resolve(import.meta.dirname, "../entry/client.js"),
      );
      template = await vite.transformIndexHtml(url, template);
    } else {
      const entryFileName = readdirSync(join(config.distDir, "server")).find(
        (dir) => dir.startsWith("switcher-"),
      );

      entryPath = join(config.distDir, "server", entryFileName!);
      template = readFileSync(
        join(config.distDir, "client/index.html"),
        "utf-8",
      );
    }

    if (!config.ssr) {
      return template
        .replace(`<!--app-html-->`, "")
        .replace(`<!--app-head-->`, "");
    }

    if (vite) render = (await vite.ssrLoadModule(entryPath)).render;
    else render = (await import(entryPath)).render;

    const rendered = await render({ url, template });
    return rendered as string;
  } catch (e) {
    vite?.ssrFixStacktrace(e as Error);
    throw e as Error;
  }
}
