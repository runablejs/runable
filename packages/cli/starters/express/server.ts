import Express from "express";
import { express } from "runable/adapters/express";

const app = Express();

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use(express());
app.listen(3000, () => console.log("Listening on http://localhost:3000"));

