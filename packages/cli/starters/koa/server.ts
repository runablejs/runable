import Koa from "koa";
import { koa } from "runable/adapters/koa";

const app = new Koa();
app.use(async (context, next) => {
  if (context.path === "/api/health") {
    context.body = { status: "ok" };
    return;
  }
  await next();
});
app.use(koa());
app.listen(3000, () => console.log("Listening on http://localhost:3000"));

