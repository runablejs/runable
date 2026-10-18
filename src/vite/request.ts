import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import type { OutgoingHttpHeaders } from "node:http";
import { pathToFileURL } from "node:url";

import type { ViteDevServer } from "vite";

import type { HttpResult } from "@/http/http.js";
import createRenderer, {
  type RendererOptions,
  type RenderRequest,
} from "../vue/render.js";
import { getClientEntry, getServerEntry } from "./entry.js";

let productionRenderer: RenderFunction | undefined;
let productionClientHtml: Promise<string> | undefined;

/**
 * Configuration nécessaire au chargement du moteur de rendu.
 */
interface ViteRequestOptions {
  /**
   * Instance Vite disponible en développement.
   * En production, cette valeur est absente.
   */
  vite?: ViteDevServer | null;

  /** URL demandée par le client. */
  url: string;

  /** Méthode HTTP de la requête. */
  method?: string;

  /** Active ou désactive le rendu côté serveur. */
  ssr?: boolean;
}

/**
 * Contrat du moteur de rendu exporté par switcher.ts.
 */
type RenderFunction = (request: RenderRequest) => Promise<string>;

/**
 * Contrat de la fonction d'initialisation exportée par switcher.ts.
 */
type CreateRenderer = (options?: RendererOptions) => RenderFunction;

async function getProductionClientHtml(): Promise<string> {
  const { absolute } = await getClientEntry();
  productionClientHtml ??= readFile(
    resolve(absolute, "..", "..", "index.html"),
    "utf8",
  );

  return productionClientHtml;
}

async function getProductionRenderer(): Promise<RenderFunction> {
  if (productionRenderer) return productionRenderer;

  const [{ url: clientEntry }, { absolute: entryPath }, template] =
    await Promise.all([
      getClientEntry(),
      getServerEntry(),
      getProductionClientHtml(),
    ]);
  const module = await import(pathToFileURL(entryPath).href);
  const createRenderer = module.default as CreateRenderer;

  productionRenderer = createRenderer({ ssr: true, clientEntry, template });
  return productionRenderer;
}

/**
 * Traite une requête en utilisant le moteur de rendu Vue.
 *
 * En développement, Vite charge et transforme switcher.ts.
 * En production, Node.js charge le fichier compilé.
 *
 * Le moteur est initialisé pour cette invocation. Pour éviter
 * cette initialisation à chaque requête, il faudra ensuite séparer
 * le chargement du moteur du traitement des requêtes.
 */
export async function viteRequest0({
  vite,
  url,
  method = "GET",
  ssr = false,
}: ViteRequestOptions): Promise<HttpResult> {
  const clientEntry = vite
    ? resolve(import.meta.dirname, "../vue/client.js")
    : resolve(import.meta.dirname, "../dist/vue/client.js");

  const headers: OutgoingHttpHeaders = vite?.config.server.headers ?? {};

  const render = createRenderer({
    ssr: true,
    clientEntry,
  });

  const rendered = await render({ url, method });

  return {
    content: rendered,
    status: 200,
    type: "text/html",
    headers,
  };
}

export async function viteRequest({
  vite,
  url,
  method = "GET",
  ssr = false,
}: ViteRequestOptions) {
  let rendered: string;

  /**
   * En développement, le module doit être chargé par Vite.
   * En production, Node.js charge le JavaScript compilé.
   */
  if (vite) {
    /**
     * Utiliser un chemin relatif à la racine Vite.
     * Adapte ce chemin à l'emplacement réel de switcher.ts.
     */
    const clientEntry = resolve(import.meta.dirname, "../vue/client.js");
    const renderPath = resolve(import.meta.dirname, "../vue/render.js");
    const module = await vite.ssrLoadModule(renderPath);

    const createRenderer = module.default as CreateRenderer;
    const render = createRenderer({ ssr, clientEntry });

    rendered = await render({ url, method });
  } else {
    /**
     * En production, importer le fichier compilé.
     * Ce fichier ne doit plus dépendre directement de fichiers .vue
     * non compilés par Vite.
     */
    if (!ssr) {
      rendered = await getProductionClientHtml();
    } else {
      const render = await getProductionRenderer();
      rendered = await render({ url, method });
    }
  }

  return {
    content: rendered,
    status: 200,
    type: "text/html",
    headers: vite?.config.server.headers ?? {},
  };
}
