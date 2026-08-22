import { express } from "runable/adapters/express";
import Express from "express";

const app = Express();
app.use(express());

app.listen(5173);
