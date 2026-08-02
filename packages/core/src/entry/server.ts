import { renderToString } from "vue/server-renderer";
import { createApp } from "./main.js";
import { useRouter } from "../router/composables.js";
import type { SSRContext } from "./switcher.js";
import { transformHtmlTemplate } from "@unhead/vue/server";
import { loadConfig } from "@/config/load.js";
import { dehydrateAsyncData } from "@/async-data/ssr.js";
import { serializeState } from "@/async-data/serialize.js";

export async function render(ssrContext: SSRContext) {
  await loadConfig();

  const { app, head } = await createApp(true);
  const router = useRouter();

  const { pathname, search, hash } = new URL(
    ssrContext.url ?? "/",
    "http://ssr-internal",
  );
  await router.push(pathname + search + hash);
  await router.isReady();

  const ctx = {};
  let html = await renderToString(app, ctx);

  // Extract + serialize the async-data cache for this request
  const asyncDataState = dehydrateAsyncData(app);
  const asyncDataScript = `<script>window.__ASYNC_DATA__=${serializeState(asyncDataState)}</script>`;

  const rendered = transformHtmlTemplate(
    head as any,
    ssrContext.template
      .replace(`<!--app-html-->`, html ?? "")
      .replace(`</body>`, `${asyncDataScript}</body>`),
  );

  return rendered;
}
