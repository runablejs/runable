import ":css";

import { createApp } from "@/main.js";

const { app, head, router } = createApp();

app.use(head);

await router.isReady();
app.mount("#app");
