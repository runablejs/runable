import { koa } from "runable/adapters/koa";
import Koa from "koa";

const app = new Koa();
app.use(koa());

app.listen(5173);
