import type { App, ComponentPublicInstance } from "vue";
import { useApp } from "./composables.js";
import type { AppContext } from "./context.js";

export type StripOnPrefix<T extends string> = T extends `on${infer Rest}`
  ? `app:${Uncapitalize<Rest>}`
  : T;

export type AppHooks = StripOnPrefix<OnHooks>;

export interface HookSystem {
  hook(name: AppHooks, fn: HookCallback): () => void;
  callHook(name: AppHooks, app: AppContext): Promise<void>;
}

export type OnHooks =
  | "onBeforeCreate"
  | "onCreated"
  | "onBeforeMount"
  | "onMounted"
  | "onBeforeUpdate"
  | "onUpdated"
  | "onBeforeUnmount"
  | "onUnmounted"
  | "onErrorCaptured"
  | "onActivated"
  | "onDeactivated"
  | "onRenderTracked"
  | "onRenderTriggered"
  | "onServerPrefetch";

const OPTIONS_HOOK_NAMES: readonly OnHooks[] = [
  "onBeforeCreate",
  "onCreated",
  "onBeforeMount",
  "onMounted",
  "onBeforeUpdate",
  "onUpdated",
  "onBeforeUnmount",
  "onUnmounted",
  "onErrorCaptured",
  "onActivated",
  "onDeactivated",
  "onRenderTracked",
  "onRenderTriggered",
  "onServerPrefetch",
];

export type RuntimeHookResult = Promise<void> | void;
export type HookCallback = (app: AppContext) => RuntimeHookResult;

export type RuntimeHooks = {
  [K in AppHooks]?: HookCallback;
};

export interface HookSystem {
  hook(name: AppHooks, fn: HookCallback): () => void;
  callHook(name: AppHooks, app: AppContext): Promise<void>;
}

function toOptionName(onHook: OnHooks): string {
  return onHook[2]?.toLowerCase() + onHook.slice(3);
}

function toAppHookKey(onHook: OnHooks): AppHooks {
  const rest = onHook.slice(2);
  return `app:${rest[0]?.toLowerCase()}${rest.slice(1)}` as AppHooks;
}

export function createHooks(): HookSystem {
  const handlers = new Map<AppHooks, Set<HookCallback>>();

  function hook(name: AppHooks, fn: HookCallback): () => void {
    if (!handlers.has(name)) handlers.set(name, new Set());
    handlers.get(name)!.add(fn);
    return () => handlers.get(name)?.delete(fn);
  }

  async function callHook(name: AppHooks, app: AppContext): Promise<void> {
    for (const fn of handlers.get(name) ?? []) {
      await fn(app);
    }
  }

  return { hook, callHook };
}

export function installLifecycleBridge(app: App, hooks: HookSystem) {
  const mixin: Record<string, (this: ComponentPublicInstance) => unknown> = {};

  for (const onHook of OPTIONS_HOOK_NAMES) {
    const key = toAppHookKey(onHook);

    mixin[toOptionName(onHook)] = function (this: ComponentPublicInstance) {
      if (this.$parent !== null) return;
      return hooks.callHook(key, useApp());
    };
  }

  app.mixin(mixin);
}

/**
 * Registers every hook declared on one or more `RuntimeHooks` objects.
 * Accepts an array so hooks coming from several sources (main config +
 * every module, or several plugins) all get registered independently —
 * merging them into a single object first would silently drop any hook
 * whose name collides with one from another source.
 */
export function registerHooks(
  appCtx: ReturnType<typeof useApp>,
  hooks: RuntimeHooks | RuntimeHooks[],
): void {
  for (const hookSet of Array.isArray(hooks) ? hooks : [hooks]) {
    for (const [key, fn] of Object.entries(hookSet) as [
      AppHooks,
      HookCallback,
    ][]) {
      appCtx.hook(key, fn);
    }
  }
}
