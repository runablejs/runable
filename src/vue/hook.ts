import type { App, ComponentPublicInstance } from "vue";
import { useApp } from "./composable/useApp.js";
import type {
  AppHooks,
  OnHooks,
  HookCallback,
  AppContext,
  HookSystem,
} from "./context.js";

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

function toOptionName(onHook: OnHooks): string {
  return onHook[2].toLowerCase() + onHook.slice(3);
}

function toAppHookKey(onHook: OnHooks): AppHooks {
  const rest = onHook.slice(2);
  return `app:${rest[0].toLowerCase()}${rest.slice(1)}` as AppHooks;
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
