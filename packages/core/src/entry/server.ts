import { renderToString } from "vue/server-renderer";
import { createApp } from "./main.js";
import { useRouter } from "../router/composables.js";
import type { SSRContext } from "./switcher.js";
import { transformHtmlTemplate } from "@unhead/vue/server";

export async function render(ssrContext: SSRContext) {
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

  const rendered = transformHtmlTemplate(
    head as any,
    ssrContext.template.replace(`<!--app-html-->`, html ?? ""),
  );

  return rendered;
}
