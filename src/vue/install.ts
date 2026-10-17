import type { AppContext } from "@/app/context.js";
import router from "@/app/pages/router.js";

export function intall(app: AppContext) {
  app.use(router);
}
