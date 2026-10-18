import type { Manifest, ManifestChunk } from "vite";
import { resolve } from "node:path";
import { defaultTemplate, replaceMarker } from "@/vue/render.js";

/**
 * Returns the browser URL for an emitted Vite asset.
 *
 * Vite stores paths in its manifest without the configured base, while the
 * generated document needs a URL that a browser can request.
 */
function withBase(base: string | undefined, file: string): string {
  const normalizedBase = base ?? "/";

  if (/^https?:\/\//.test(normalizedBase)) {
    return new URL(
      file,
      normalizedBase.endsWith("/") ? normalizedBase : `${normalizedBase}/`,
    ).href;
  }

  const prefix = normalizedBase.endsWith("/")
    ? normalizedBase
    : `${normalizedBase}/`;

  return `${prefix}${file}`.replace(/([^:]\/)\/+/g, "$1");
}

/** Finds the single browser entry emitted for Runable's client entry module. */
export function getClientEntry(
  manifest: Manifest,
  entryFile: string,
  root: string,
): ManifestChunk {
  const expected = entryFile.replace(/\\/g, "/");
  const matchingEntry = Object.values(manifest).find((chunk) => {
    if (!chunk.isEntry || !chunk.src) return false;

    return resolve(root, chunk.src).replace(/\\/g, "/") === expected;
  });

  if (matchingEntry) return matchingEntry;

  const entries = Object.values(manifest).filter((chunk) => chunk.isEntry);
  if (entries.length === 1) return entries[0]!;

  throw new Error(
    "Unable to find the Runable client entry in Vite's manifest.",
  );
}

/**
 * Produces the static document served by a CSR deployment or used as an SSR
 * fallback. SSR responses themselves continue to be rendered by render.ts.
 */
export function renderClientHtml(
  entry: ManifestChunk,
  baseUrl?: string,
  ssr = false,
): string {
  const styles = (entry.css ?? [])
    .map(
      (file) => `<link rel="stylesheet" href="${withBase(baseUrl, file)}" />`,
    )
    .join("\n    ");
  const clientEntry = withBase(baseUrl, entry.file);
  const clientScript = `<script type="module" src="${clientEntry}" data-app-entry data-ssr="${ssr}"></script>`;

  let html = defaultTemplate;

  // CSS belongs in <head>, but the renderer still needs its marker to inject
  // the request-specific Unhead tags during SSR.
  html = replaceMarker(
    html,
    "<!--app-head-->",
    styles ? `${styles}\n    <!--app-head-->` : "<!--app-head-->",
  );

  html = replaceMarker(html, "<!--app-entry-->", clientScript);

  // html = replaceMarker(html, "<!--html-attrs-->", "");
  // html = replaceMarker(html, "<!--body-attrs-->", "");

  return html;
}
