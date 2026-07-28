import ":globals";

export type SSRContext = { url: string; template: string };

export async function render(ctx: SSRContext | false) {
  if (ctx) {
    const { render } = await import("./server.js");
    return await render(ctx);
  } else {
    await import("./client.js");
  }
}
