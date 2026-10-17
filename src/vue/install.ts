import type { AppContext } from "@/engine/context.js";
import router from "@/engine/pages/router.js";

export function intall(app: AppContext) {
  app.use(router);
}
