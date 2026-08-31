import { readFile, stat } from "node:fs/promises";
import { extname, isAbsolute, join, resolve, sep } from "node:path";
import { Readable } from "node:stream";
import type {
  IncomingMessage,
  OutgoingHttpHeaders,
  ServerResponse,
} from "node:http";

import type { ViteDevServer } from "vite";

import { getIndexHtml } from "./html.js";
import { useConfig } from "../config/load.js";
import { isRunableProduction } from "../utils/mode.js";

type HttpBody =
  | string
  | Buffer
  | Uint8Array
  | ReadableStream<Uint8Array>
  | null;

export type RequestResult =
  | {
      content: HttpBody;
      type?: string;
      status?: number;
      headers?: OutgoingHttpHeaders;
    }
  | {
      redirect: string;
      status?: 301 | 302 | 307 | 308;
    };

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

/** Reads a generated client asset in production, or returns undefined for an application route. */
export async function readProductionAsset({
  distdir,
  url,
  method = "GET",
}: {
  distdir: string;
  url: string;
  method?: string;
}): Promise<RequestResult | undefined> {
  if (method !== "GET" && method !== "HEAD") return;

  let pathname: string;
  try {
    pathname = decodeURIComponent(new URL(url, "http://runable.local").pathname);
  } catch {
    return;
  }

  const clientDir = resolve(distdir, "client");
  const file = resolve(clientDir, pathname.replace(/^\/+/, ""));
  if (file === clientDir || !file.startsWith(`${clientDir}${sep}`)) return;

  try {
    const info = await stat(file);
    if (!info.isFile()) return;

    return {
      content: method === "HEAD" ? null : await readFile(file),
      status: 200,
      type: CONTENT_TYPES[extname(file).toLowerCase()] ??
        "application/octet-stream",
      headers: {
        "Content-Length": info.size,
      },
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Shared request pipeline used by both Node and Fetch API adapters.
// ---------------------------------------------------------------------------
async function viteRequest({
  vite,
  url,
  method,
}: {
  vite?: ViteDevServer | null;
  url: string;
  method?: string;
}): Promise<RequestResult> {
  const config = useConfig();
  let entryPath = resolve(import.meta.dirname, "../entry/switcher.js");
  let template: string;
  const headers: OutgoingHttpHeaders = vite?.config.server.headers ?? {};

  try {
    let render: (typeof import("../entry/switcher.js"))["render"] | undefined;

    if (!vite && isRunableProduction()) {
      const asset = await readProductionAsset({
        distdir: config.distdir,
        url,
        method,
      });
      if (asset) return asset;
    }

    if (vite) {
      // --- Dev : lecture dynamique via le serveur Vite ---
      template = getIndexHtml(
        resolve(import.meta.dirname, "../entry/client.js"),
      );
      template = await vite.transformIndexHtml(url, template);
    } else {
      const manifestModule = (await import(
        join(config.distdir, "manifest.js")
      )) as { default?: Record<string, string> } & Record<string, unknown>;
      const manifest = (manifestModule.default ?? manifestModule) as Record<
        string,
        string
      >;

      // // --- Prod : tout est déjà en mémoire, embarqué au build ---
      const templateContent = manifest.html;
      if (!templateContent) {
        throw new Error(
          `No client template found matching "/dist/client/index.html". ` +
            `Check that the client build ran before the server build, and ` +
            `that the glob pattern matches your actual dist layout.`,
        );
      }

      template = templateContent;

      const entryLoader = manifest.switcher;
      if (!entryLoader) {
        throw new Error(
          `No server entry found matching "/dist/server/switcher-*.js". ` +
            `Check that the server build ran and produced a switcher-*.js file.`,
        );
      }

      const serverEntry = isAbsolute(entryLoader)
        ? entryLoader
        : join(config.distdir, "server", entryLoader);

      render = (await import(serverEntry)).render;
    }

    if (!config.ssr) {
      return {
        type: "text/html",
        status: 200,
        headers,
        content: template
          .replace(`<!--app-html-->`, "")
          .replace(`<!--app-head-->`, ""),
      };
    }

    if (vite) render = (await vite.ssrLoadModule(entryPath)).render;

    if (!render) {
      throw new Error("The server entry does not export a render function.");
    }

    const rendered = await render({ url, template });

    return {
      content: rendered as string,
      status: 200,
      type: "text/html",
      headers,
    };
  } catch (e) {
    vite?.ssrFixStacktrace(e as Error);
    throw e as Error;
  }
}

// ---------------------------------------------------------------------------
// Sérialisation pure : RequestResult -> effets sur ServerResponse (Node)
// ---------------------------------------------------------------------------
export function sendRequestResult(
  result: RequestResult,
  res: ServerResponse,
): void {
  if ("redirect" in result) {
    if (!res.headersSent) {
      res.statusCode = result.status ?? 302;
      res.setHeader("Location", result.redirect);
    }
    res.end();
    return;
  }

  const { content, type, status, headers } = result;

  if (!res.headersSent) {
    res.statusCode = status ?? 200;

    if (type && !res.hasHeader("content-type")) {
      res.setHeader("Content-Type", type);
    }

    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        res.setHeader(key, value!);
      }
    }
  }

  if (content === null) {
    res.end();
    return;
  }

  if (
    typeof content === "string" ||
    Buffer.isBuffer(content) ||
    content instanceof Uint8Array
  ) {
    res.end(content);
    return;
  }

  Readable.fromWeb(content as import("node:stream/web").ReadableStream).pipe(
    res,
  );
}

// ---------------------------------------------------------------------------
// Sérialisation pure : RequestResult -> Response (Fetch API standard)
// ---------------------------------------------------------------------------
export function toWebResponse(result: RequestResult): globalThis.Response {
  if ("redirect" in result) {
    return Response.redirect(result.redirect, result.status ?? 302);
  }

  const { content, type, status, headers } = result;

  const responseHeaders = new Headers(headers as any);
  if (type && !responseHeaders.has("content-type")) {
    responseHeaders.set("Content-Type", type);
  }

  return new Response(content as BodyInit | null, {
    status: status ?? 200,
    headers: responseHeaders,
  });
}

// ---------------------------------------------------------------------------
// Adaptateur Node (Express, Koa, Fastify via .raw, Adonis, Nest-Express, h3 Node)
// ---------------------------------------------------------------------------
export async function requestNode({
  runableApp,
  req,
  res,
}: {
  runableApp?: ViteDevServer | null;
  req: IncomingMessage;
  res: ServerResponse;
}): Promise<void> {
  const result = await viteRequest({
    vite: runableApp,
    url: req.url!,
    method: req.method,
  });
  sendRequestResult(result, res);
}

// ---------------------------------------------------------------------------
// Standard Fetch API adapter (Bun, Deno and Hono outside Node bindings).
// ---------------------------------------------------------------------------
export async function requestWeb({
  runableApp,
  req,
}: {
  runableApp?: ViteDevServer | null;
  req: globalThis.Request;
}): Promise<globalThis.Response> {
  const result = await viteRequest({
    vite: runableApp,
    url: req.url,
    method: req.method,
  });
  return toWebResponse(result);
}
