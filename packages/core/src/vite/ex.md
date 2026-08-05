// Express
app.get("*", async (req, res) => {
  const result = await request({ url: req.url });
  sendRequestResult(result, res); // res EST déjà un ServerResponse (via http.ServerResponse)
});

// Koa
app.use(async (ctx) => {
  const result = await request({ url: ctx.url });
  ctx.respond = false; // on désactive la gestion auto de Koa
  sendRequestResult(result, ctx.res);
});

// Fastify
fastify.get("*", async (req, reply) => {
  const result = await request({ url: req.url });
  reply.hijack(); // on prend la main sur la réponse brute
  sendRequestResult(result, reply.raw);
});

// NestJS (adapter Express, avec @Res())
@Get("*")
async handle(@Req() req: Request, @Res() res: Response) {
  const result = await request({ url: req.url });
  sendRequestResult(result, res);
}

// AdonisJS
router.get("*", async ({ request: adonisReq, response }) => {
  const result = await request({ url: adonisReq.url() });
  sendRequestResult(result, response.response); // response.response = ServerResponse natif
});

// h3 (mode Node)
export default defineEventHandler(async (event) => {
  const result = await request({ url: event.node.req.url! });
  sendRequestResult(result, event.node.res);
});


// Bun
Bun.serve({
  async fetch(req) {
    return requestWeb({ req });
  },
});

// Deno
Deno.serve((req) => requestWeb({ req }));

// Cloudflare Workers
export default {
  fetch(req: Request) {
    return requestWeb({ req });
  },
};

// Hono
app.get("*", (c) => requestWeb({ req: c.req.raw }));

// Next.js App Router (route handler)
export async function GET(req: Request) {
  return requestWeb({ req });
}

// SvelteKit
export const GET: RequestHandler = ({ request }) => requestWeb({ req: request });