import { createApp, createSSRApp } from "vue";
import { createHead } from "@unhead/vue/client";

import { callWithAppCtx, type AppContext } from "@/app/context.js";
import { getRoot } from "./root.js";
import { intall } from "./install.js";

/**
 * Monte l'application Vue dans le navigateur.
 *
 * Si le serveur a déjà généré le HTML, Vue hydrate le contenu.
 * Sinon, Vue construit l'interface directement dans le navigateur.
 */
export async function mountClient(ssr: boolean) {
  /**
   * Sélectionne la stratégie de montage.
   *
   * createSSRApp() : réutilise le HTML existant et l'hydrate.
   * createApp()    : crée l'interface côté navigateur.
   */
  const Root = await getRoot();
  const app = ssr ? createSSRApp(Root) : createApp(Root);
  const head = createHead({});

  await callWithAppCtx(app as AppContext, async () => {
    intall(app as AppContext);
    app.use(head);

    const router = app.config.globalProperties.$router;
    await router.isReady();

    app.mount("#app");
  });

  /**
   * Monte l'application dans le conteneur principal.
   */
}

/**
 * Détermine automatiquement le mode de rendu.
 *
 * switcher.ts ajoute data-ssr="true" lorsque le serveur
 * a préalablement généré le HTML.
 */
const entryScript = document.querySelector<HTMLScriptElement>(
  "script[data-app-entry]",
);

const ssr = entryScript?.dataset.ssr === "true";

/**
 * Lance l'application dans le navigateur.
 */
await mountClient(ssr);
