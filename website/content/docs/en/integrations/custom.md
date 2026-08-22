---
title: Custom adapter
description: Connect Runable to a Node or Fetch API server without a dedicated adapter.
---

Create the application once, then pass each frontend request to the primitive that matches your runtime.

## Node server

```ts
import { createServer } from "node:http";
import { createRunableApp, requestNode } from "runable";

const runableApp = createRunableApp();

createServer(async (req, res) => {
  await requestNode({
    runableApp: await runableApp,
    req,
    res,
  });
}).listen(3000);
```

## Fetch API runtime

```ts
import { createRunableApp, requestWeb } from "runable";

const runableApp = createRunableApp();

export async function fetch(request: Request) {
  return requestWeb({
    runableApp: await runableApp,
    req: request,
  });
}
```

`requestNode()` writes directly to `ServerResponse`. `requestWeb()` returns a `Response`. In both cases, handle API routes before calling Runable.

::u-tip
---
variant: info
title: Development with a Node server
---

Official Node adapters run Vite's Connect middleware before `requestNode()`. If you write a custom Node adapter, reproduce this step so development modules and assets are served correctly.

::
