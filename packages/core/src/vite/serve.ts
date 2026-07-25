import { join, resolve } from "node:path";
import { getIndexHtml } from "./html.js";
import type { ViteDevServer } from "vite";
import { readdirSync, readFileSync } from "node:fs";
import { transformHtmlTemplate } from "@unhead/vue/server";
import { useConfig } from "../config/index.js";

export async function serve({
  vite,
  url,
}: {
  vite?: ViteDevServer | null;
  url: string;
}) {
  const config = useConfig();

  const clientEntry = resolve(import.meta.dirname, "../entry-client.js");
  let serverEntry = resolve(import.meta.dirname, "../entry-server.js");

  let template = "";

  try {
    let render: (typeof import("../entry-server.js"))["render"];

    if (vite) {
      template = getIndexHtml(clientEntry);
      template = await vite!.transformIndexHtml(url, template);
    } else {
      const entryFileName = readdirSync(config.distDir).find((dir) =>
        dir.startsWith("entry-server"),
      );
      join(config.distDir, entryFileName!);
      serverEntry = join(config.distDir, entryFileName!);

      template = readFileSync(join(config.distDir, "index.html"), "utf-8");
    }

    if (!config.ssr) return template.replace(`<!--app-html-->`, "");

    if (vite) render = (await vite.ssrLoadModule(serverEntry)).render;
    else render = (await import(serverEntry)).render;

    const rendered = await render(url);

    const html = transformHtmlTemplate(
      rendered.head as any,
      template.replace(`<!--app-html-->`, rendered.html ?? ""),
    );

    return html;
  } catch (e) {
    vite?.ssrFixStacktrace(e as Error);
    throw e as Error;
  }
}
