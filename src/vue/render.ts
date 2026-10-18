import type { ServerRenderResult } from "./server.js";

/**
 * Configuration du moteur de rendu.
 */
export interface RendererOptions {
  /** Active ou désactive le rendu serveur. */
  ssr?: boolean;

  /** Template HTML utilisé pour construire le document final. */
  template?: string;

  /** URL publique du point d'entrée client. */
  clientEntry: string;
}

/**
 * Paramètres d'une requête.
 */
export interface RenderRequest {
  url: string;
  method?: string;
}

/**
 * Template HTML par défaut.
 *
 * Les marqueurs facultatifs permettent d'injecter les attributs
 * html/body et les balises Unhead positionnées dans le body.
 */
export const defaultTemplate = `<!doctype html>
<html <!--html-attrs-->>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!--app-head-->
  </head>
  <body <!--body-attrs-->>
    <!--body-tags-open-->
    <div id="app"><!--app-html--></div>
    <!--app-entry-->
    <!--body-tags-->
  </body>
</html>`;

/**
 * Remplace un marqueur obligatoire.
 *
 * Une erreur explicite permet de détecter un template incorrect.
 */
export function replaceMarker(
  template: string,
  marker: string,
  value: string,
): string {
  if (!template.includes(marker)) {
    throw new Error(`Marqueur HTML manquant dans le template : ${marker}`);
  }

  return template.replace(marker, value);
}

/**
 * Remplace un marqueur facultatif.
 *
 * Cette fonction permet de conserver la compatibilité avec les templates
 * personnalisés qui ne déclarent pas tous les marqueurs optionnels.
 */
function replaceOptionalMarker(
  template: string,
  marker: string,
  value: string,
): string {
  return template.replace(marker, value);
}

/**
 * Ajoute une langue par défaut si Unhead n'en a pas défini.
 */
function withDefaultLanguage(attrs: string): string {
  if (/(?:^|\s)lang\s*=/.test(attrs)) {
    return attrs;
  }

  return `lang="en" ${attrs}`.trim();
}

/**
 * Initialise le moteur et retourne la fonction de rendu.
 *
 * La configuration est conservée entre les requêtes.
 * Les instances Vue et Unhead, elles, restent propres à chaque rendu SSR.
 */
export default function createRenderer({
  ssr = false,
  template = defaultTemplate,
  clientEntry,
}: RendererOptions) {
  return async function render({
    url,
    method = "GET",
  }: RenderRequest): Promise<string> {
    /**
     * HEAD doit produire les mêmes en-têtes que GET, mais le serveur HTTP
     * doit supprimer le corps de la réponse avant de l'envoyer.
     */
    if (method !== "GET" && method !== "HEAD") {
      throw new Error(`Méthode HTTP non prise en charge : ${method}`);
    }

    let rendered: ServerRenderResult | undefined;

    /**
     * Charge le moteur serveur uniquement lorsque le SSR est activé.
     *
     * Vite peut ainsi transformer les composants Vue en développement,
     * à condition que render.ts soit lui-même chargé via Vite.
     */
    if (ssr) {
      const { renderServer } = await import("./server.js");
      rendered = await renderServer({ url });
    }

    /**
     * En CSR, aucune métadonnée applicative n'est générée sur le serveur.
     * Unhead les calculera dans le navigateur après le montage.
     */
    const appHtml = rendered?.html ?? "";
    const head = rendered?.head;

    /**
     * Prépare le script client.
     *
     * L'attribut data-ssr permet au client de choisir l'hydratation
     * ou le montage classique.
     */
    const clientScript = `
<script
  type="module"
  src="${clientEntry}"
  data-app-entry
  data-ssr="${ssr}"
></script>`;

    /** Injecte le contenu SSR et les métadonnées propres à la requête. */
    let html = template;

    html = replaceMarker(html, "<!--app-head-->", head?.headTags ?? "");
    html = replaceMarker(html, "<!--app-html-->", appHtml);

    // A production template already contains the hashed client entry. Keep
    // supporting source/custom templates, where the marker is still present.
    html = replaceOptionalMarker(html, "<!--app-entry-->", clientScript);

    /**
     * Injecte les attributs <html> et <body> générés par Unhead.
     *
     * Le document garde lang="fr" par défaut si aucune langue
     * n'a été définie par les composants.
     */
    const htmlAttrs = withDefaultLanguage(head?.htmlAttrs ?? "");
    const bodyAttrs = head?.bodyAttrs ?? "";

    html = replaceOptionalMarker(html, "<!--html-attrs-->", htmlAttrs);
    html = replaceOptionalMarker(html, "<!--body-attrs-->", bodyAttrs);

    /**
     * Insère les balises supplémentaires gérées par Unhead.
     */
    html = replaceOptionalMarker(
      html,
      "<!--body-tags-open-->",
      head?.bodyTagsOpen ?? "",
    );

    html = replaceOptionalMarker(
      html,
      "<!--body-tags-->",
      head?.bodyTags ?? "",
    );

    return html;
  };
}
