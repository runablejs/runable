import type {
  IncomingMessage,
  OutgoingHttpHeaders,
  ServerResponse,
} from "node:http";
import { detectRuntime } from "../runtime/detect-runtime.js";
import { Readable } from "node:stream";
import type { ViteDevServer } from "vite";
import { viteRequest } from "@/vite/request.js";

type NodeRequest = IncomingMessage;
type NodeResponse = ServerResponse;

type HttpInput = Request | NodeRequest;
type HttpOutput = Response | void;

type HttpBody =
  | string
  | Buffer
  | Uint8Array
  | ReadableStream<Uint8Array>
  | null;

export type HttpResult =
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

export async function handleRequest(
  vite: ViteDevServer | null,
  req: HttpInput,
  res?: NodeResponse,
): Promise<HttpOutput> {
  const runtime = detectRuntime();

  const result = await viteRequest({
    vite: vite ?? null,
    url: req.url ?? "/",
    method: req.method,
    ssr: true,
  });

  // Node.js requires both the incoming request and outgoing response.
  if (runtime === "node") {
    validateNodeRequest(req, res);

    return toResponse(req as NodeRequest, res!, result);
  }

  // Bun supports both Web APIs and Node.js HTTP APIs.
  if (runtime === "bun") {
    if (req instanceof Request) {
      validateWebRequest(req, res);
      return toWebResponse(req, result);
    }

    validateNodeRequest(req, res);
    return toResponse(req as NodeRequest, res!, result);
  }

  // Deno and edge runtimes use the Web Request API.
  if (runtime === "deno" || runtime === "workerd") {
    validateWebRequest(req, res);
    return toWebResponse(req as Request, result);
  }

  throw new Error(`Unsupported runtime: ${runtime}`);
}

function validateWebRequest(
  req: unknown,
  res?: unknown,
): asserts req is Request {
  if (!(req instanceof Request)) {
    throw new TypeError("Expected a Web API Request object.");
  }

  if (res !== undefined) {
    throw new TypeError(
      "The Web Request API does not require a separate response object.",
    );
  }
}

function validateNodeRequest(
  req: unknown,
  res: unknown,
): asserts req is NodeRequest {
  // TODO: Validate that req is a Node.js IncomingMessage.
  // TODO: Validate that res is a Node.js ServerResponse.
  // TODO: Check that both objects belong to the same HTTP lifecycle.

  if (!req || !res) {
    throw new TypeError("Node.js requires both req and res.");
  }
}

// Converts a Web Request into a Web Response.
async function toWebResponse(
  req: Request,
  result: HttpResult,
): Promise<Response> {
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

// Handles a Node.js request and writes the response to res.
async function toResponse(
  req: NodeRequest,
  res: NodeResponse,
  result: HttpResult,
): Promise<void> {
  // Do not write a response if the connection is already finished.
  if (res.destroyed || res.writableEnded) {
    return;
  }

  // Handle redirects separately.
  if ("redirect" in result) {
    res.statusCode = result.status ?? 302;
    res.setHeader("Location", result.redirect);
    res.end();
    return;
  }

  const { content, type, status, headers } = result;

  // Set the response status and headers before writing the body.
  res.statusCode = status ?? 200;

  if (type && !res.hasHeader("content-type")) {
    res.setHeader("Content-Type", type);
  }

  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      if (value !== undefined && !res.hasHeader(key)) {
        res.setHeader(key, value);
      }
    }
  }

  // HEAD requests must return headers without a response body.
  if (req.method === "HEAD" || content === null) {
    res.end();
    return;
  }

  // Write simple body types directly.
  if (
    typeof content === "string" ||
    Buffer.isBuffer(content) ||
    content instanceof Uint8Array
  ) {
    res.end(content);
    return;
  }

  // Convert Web ReadableStream to a Node.js stream and pipe it.
  const stream = Readable.fromWeb(
    content as import("node:stream/web").ReadableStream<Uint8Array>,
  );

  // Handle stream errors without attempting to send a second response.
  stream.on("error", (error) => {
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end("Internal Server Error");
    } else {
      res.destroy(error);
    }
  });

  // pipe() handles backpressure automatically.
  stream.pipe(res);
}
