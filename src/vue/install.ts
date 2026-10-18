import type { AppContext } from "@/engine/context.js";
import router from "@/engine/pages/router.js";
import components from ":components";

export function intall(app: AppContext) {
  app.use(router);
  app.use(components);
}
