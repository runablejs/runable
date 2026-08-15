import { join, resolve } from "node:path";
import { Readable } from "node:stream";
import type {
  IncomingMessage,
  OutgoingHttpHeaders,
  ServerResponse,
} from "node:http";

import type { ViteDevServer } from "vite";

import { getIndexHtml } from "./html.js";
import { useConfig } from "../config/load.js";

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

// ---------------------------------------------------------------------------
// Core, runtime-agnostic: ne dépend d'aucune API réseau, juste d'une URL.
// ---------------------------------------------------------------------------
async function viteRequest({
  vite,
  url,
}: {
  vite?: ViteDevServer | null;
  url: string;
}): Promise<RequestResult> {
  const config = useConfig();
  let entryPath = resolve(import.meta.dirname, "../entry/switcher.js");
  let template: string;
  const headers: OutgoingHttpHeaders = vite?.config.server.headers ?? {};

  try {
    let render: (typeof import("../entry/switcher.js"))["render"];

    if (vite) {
      // --- Dev : lecture dynamique via le serveur Vite ---
      template = getIndexHtml(
        resolve(import.meta.dirname, "../entry/client.js"),
      );
      template = await vite.transformIndexHtml(url, template);
    } else {
      const manifest = (await import(
        join(config.distdir, "manifest.js")
      )) as Record<string, string>;

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

      render = (await import(entryLoader)).render;
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
    else render = (await import(entryPath)).render;

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
    res.statusCode = result.status ?? 302;
    res.setHeader("Location", result.redirect);
    res.end();
    return;
  }

  const { content, type, status, headers } = result;

  res.statusCode = status ?? 200;

  if (type && !res.hasHeader("content-type")) {
    res.setHeader("Content-Type", type);
  }

  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value!);
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
  syoraApp,
  req,
  res,
}: {
  syoraApp?: ViteDevServer | null;
  req: IncomingMessage;
  res: ServerResponse;
}): Promise<void> {
  const result = await viteRequest({ vite: syoraApp, url: req.url! });
  sendRequestResult(result, res);
}

// ---------------------------------------------------------------------------
// Adaptateur Web standard (Bun, Deno, Cloudflare Workers, Next.js Edge,
// Hono, SvelteKit, Remix, h3 hors-Node...) — zéro dépendance Node.
// ---------------------------------------------------------------------------
export async function requestWeb({
  syoraApp,
  req,
}: {
  syoraApp?: ViteDevServer | null;
  req: globalThis.Request;
}): Promise<globalThis.Response> {
  const result = await viteRequest({ vite: syoraApp, url: req.url });
  return toWebResponse(result);
}
