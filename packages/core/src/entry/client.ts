import ":css";
import { deserializeState } from "@/async-data/serialize";
import { hydrateAsyncData } from "@/async-data/ssr";

import { createApp } from "@/entry/main.js";
import { useRouter } from "@/router/composables.js";

export async function render() {
  const { app } = await createApp();

  await useRouter().isReady();

  const raw = (window as any).__ASYNC_DATA__;
  if (raw) {
    hydrateAsyncData(
      app,
      typeof raw === "string" ? deserializeState(raw) : raw,
    );
  }

  return app;
}

if (typeof window !== "undefined") {
  const app = await render();
  app.mount("#app", true);
}
