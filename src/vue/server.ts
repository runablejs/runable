import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import { createHead, type SSRHeadPayload } from "@unhead/vue/server";

import { callWithAppCtx, type AppContext } from "@/app/context.js";
import { useRouter } from "@/app/composables/router.js";
import { getRoot } from "./root.js";
import { intall } from "./install.js";

export interface ServerRenderOptions {
  url: string;
}

export interface ServerRenderResult {
  html: string;
  head: SSRHeadPayload;
}

/**
 * Génère le HTML de l'application Vue pour une requête.
 *
 * Cette fonction ne construit pas le document HTML complet :
 * elle retourne uniquement le HTML des composants Vue.
 */
export async function renderServer({ url }: ServerRenderOptions) {
  // Promise<ServerRenderResult>

  /**
   * Crée une instance indépendante pour cette requête.
   * Ne réutilise pas une instance Vue globale entre utilisateurs.
   */
  const app = createSSRApp(await getRoot());
  const head = createHead({ disableDefaults: true });

  return callWithAppCtx(app as AppContext, async () => {
    intall(app as AppContext);
    app.use(head);

    app.config.globalProperties.$router;

    const router = app.config.globalProperties.$router;

    const { pathname, search, hash } = new URL(
      url ?? "/",
      "http://ssr-internal",
    );
    await router.push(pathname + search + hash);
    await router.isReady();

    const html = await renderToString(app);

    return { html, head: head.render() };
  });

  /**
   * Transforme l'arbre de composants Vue en chaîne HTML.
   */
  // return { app: await renderToString(app), head: head.render() };
}
