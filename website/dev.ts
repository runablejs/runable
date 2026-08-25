import { serve } from "@hono/node-server";
import server from "./server.js";

serve({ fetch: server.fetch, port: 3000 });
