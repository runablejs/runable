// import { serve } from "@hono/node-server";
// import server from "./server.js";

// serve({ fetch: server.fetch, port: 3000 });

import app from "./express";

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () =>
  console.log(
    `Application Express SSR disponible sur http://localhost:${port}`,
  ),
);
