import type {
  AppContext as VueAppContext,
  ComponentCustomProperties,
} from "vue";

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

export type StripOnPrefix<T extends string> = T extends `on${infer Rest}`
  ? `app:${Uncapitalize<Rest>}`
  : T;

export type AppHooks = StripOnPrefix<OnHooks>;

export interface HookSystem {
  hook(name: AppHooks, fn: HookCallback): () => void;
  callHook(name: AppHooks, app: AppContext): Promise<void>;
}

declare module "vue" {
  interface AppContext extends HookSystem {}
}

export type AppContext = VueAppContext &
  ComponentCustomProperties &
  HookSystem &
  Record<string, unknown>;

export type RuntimeHookResult = Promise<void> | void;
export type HookCallback = (app: AppContext) => RuntimeHookResult;

export type RuntimeHooks = {
  [K in AppHooks]?: HookCallback;
};

export let globalAppContext: AppContext | null = null;

export function setAppContext(ctx: AppContext): void {
  globalAppContext = ctx;
}
