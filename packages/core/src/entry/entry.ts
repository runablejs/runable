import ":globals";

export type SSRContext = { url?: string; template: string };

export async function entry(ssrContext: SSRContext | false) {
  if (ssrContext) {
    const { render } = await import("./server.js");
    return await render(ssrContext);
  } else {
    const { render } = await import("./client.js");
    return render();
  }
}
