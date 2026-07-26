import { renderToString } from "vue/server-renderer";
import { createHead } from "@unhead/vue/server";
import { createApp } from "./main.js";

export async function render(url: string) {
  const { app, head, router } = createApp(true);

  app.use(head);

  // const url = new URL(url);
  // const href = url.href.slice(url.origin.length);

  // console.log(router.getRoutes());

  await router.push(url);
  await router.isReady();

  const ctx = {};
  let html = await renderToString(app, ctx);

  return { html, head };
}
