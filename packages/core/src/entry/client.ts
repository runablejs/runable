import ":css";

import { createApp } from "@/main.js";

export async function render() {
  const { app, head } = await createApp();
  app.use(head);
  // await router.isReady();

  return app;
}
