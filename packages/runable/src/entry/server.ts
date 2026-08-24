import { renderToString } from "vue/server-renderer";
import { createApp } from "./main.js";
import { useRouter } from "../app/composables/router.js";
import type { SSRContext } from "./switcher.js";
import { transformHtmlTemplate } from "@unhead/vue/server";
import { loadConfig } from "@/config/load.js";
import { dehydrateAsyncData } from "@/async-data/ssr.js";
import { serializeState } from "@/async-data/serialize.js";
import { getAppErrorState } from "@/error/plugin.js";
import { callWithAppCtx } from "@/context/context.js";

export async function render(ssrContext: SSRContext) {
  await loadConfig();

  const { app, head } = await createApp(true);

  return callWithAppCtx(app, async () => {
    const router = useRouter();

    const { pathname, search, hash } = new URL(
      ssrContext.url ?? "/",
      "http://ssr-internal",
    );
    await router.push(pathname + search + hash);
    await router.isReady();

    let html: string;

    try {
      html = await renderToString(app, {});
    } catch (error) {
      const errorState = getAppErrorState(app);
      if (!errorState) throw error;

      errorState.showError(error, {
        source: "vue",
        info: "server-render",
      });

      // Render again: RunableApp now selects the error component instead of
      // the component tree that failed during the first pass.
      html = await renderToString(app, {});
    }

    // Extract + serialize the async-data cache for this request
    const asyncDataState = dehydrateAsyncData(app);
    const asyncDataScript = `<script>window.__ASYNC_DATA__=${serializeState(asyncDataState)}</script>`;

    return transformHtmlTemplate(
      head as any,
      ssrContext.template
        .replace(`<!--app-html-->`, html ?? "")
        .replace(`</body>`, `${asyncDataScript}</body>`),
    );
  });
}
