import ":css";

import { createApp } from "@/entry/main.js";
import { useRouter } from "@/router/composables.js";

export async function render() {
  const { app } = await createApp();

  await useRouter().isReady();

  return app;
}

if (typeof window !== "undefined") {
  const app = await render();
  app.mount("#app", true);
}
