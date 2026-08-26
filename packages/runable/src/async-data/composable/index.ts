import { inject, isRef, onServerPrefetch, ref, shallowRef, toValue, watch, type Ref } from "vue";
import type { AsyncDataContext, AsyncDataExecuteOptions, AsyncDataOptions, AsyncDataResult, AsyncDataStatus } from "../types.js";
import { ASYNC_DATA_CONTEXT_KEY } from "../symbols.js";

export type _AsyncData<Data, ErrorType> = AsyncDataResult<Data, ErrorType> & PromiseLike<AsyncDataResult<Data, ErrorType>>;

function pick<Data>(data: Data, keys?: string[]): Data {
  if (!keys?.length || !data || Array.isArray(data) || typeof data !== "object") return data;
  const record = data as Record<string, unknown>;
  return Object.fromEntries(keys.filter((key) => key in record).map((key) => [key, record[key]])) as Data;
}

export function useAsyncData<Data, TransformedData = Data>(
  keyInput: string | Ref<string> | (() => string),
  fetcher: (signal?: AbortSignal) => Promise<Data>,
  options: AsyncDataOptions<Data, TransformedData> = {},
): _AsyncData<TransformedData, Error> {
  const context = inject<AsyncDataContext>(ASYNC_DATA_CONTEXT_KEY);
  if (!context) throw new Error("useAsyncData must be used within an app initialized with createAsyncDataPlugin()");
  const key = () => toValue(keyInput);
  const config = { server: true, lazy: false, immediate: true, deep: false, dedupe: "cancel" as "cancel" | "defer", enabled: true as boolean, default: () => undefined as TransformedData, ttl: context.options.ttl ?? 300000, ...options };
  config.server ??= true;
  config.lazy ??= false;
  config.immediate ??= true;
  config.deep ??= false;
  config.dedupe ??= "cancel";
  config.enabled ??= true;
  config.default ??= () => undefined as TransformedData;
  config.ttl ??= context.options.ttl ?? 300000;
  const defaultValue = config.default();
  const data = (config.deep ? ref(isRef(defaultValue) ? defaultValue.value : defaultValue) : shallowRef(isRef(defaultValue) ? defaultValue.value : defaultValue)) as Ref<TransformedData>;
  const pending = ref(false);
  const error = shallowRef<Error>();
  const status = ref<AsyncDataStatus>("idle");
  const isServer = !("window" in globalThis);
  let generation = 0;

  const executeWithCause = async (executeOptions: AsyncDataExecuteOptions = {}, cause: "initial" | "refresh:manual" | "watch" = "refresh:manual") => {
    if ((isServer && !config.server) || !toValue(config.enabled)) return;
    const currentKey = key();
    const cacheEntry = context.cache.get<TransformedData>(currentKey);
    const cached = config.getCachedData
      ? config.getCachedData(currentKey, context, { cause })
      : cacheEntry && cacheEntry.expiresAt > Date.now()
        ? cacheEntry.data
        : undefined;
    if (cause === "initial" && cached !== undefined) {
      data.value = cached;
      status.value = "success";
      return;
    }
    const currentGeneration = ++generation;
    pending.value = true;
    status.value = "pending";
    error.value = undefined;
    const controller = new AbortController();
    const externalSignal = executeOptions.signal;
    const abortExternal = () => controller.abort(externalSignal?.reason);
    externalSignal?.addEventListener("abort", abortExternal, { once: true });
    const timeout = executeOptions.timeout ?? config.timeout;
    const timer = timeout ? setTimeout(() => controller.abort("Request timed out"), timeout) : undefined;
    try {
      const raw = await context.requestManager.execute(currentKey, (managerSignal) => {
        managerSignal?.addEventListener("abort", () => controller.abort(managerSignal.reason), { once: true });
        return fetcher(controller.signal);
      }, (executeOptions.dedupe ?? config.dedupe) === "cancel");
      if (currentGeneration !== generation) return;
      const transformed = config.transform ? await config.transform(raw) : raw as unknown as TransformedData;
      const finalData = pick(transformed, config.pick);
      data.value = finalData;
      if (config.serialize !== false) context.cache.set(currentKey, finalData, config.ttl);
      status.value = "success";
    } catch (caught) {
      if (currentGeneration !== generation) return;
      const caughtError = caught as Error;
      error.value = caughtError;
      status.value = "error";
      context.options.onError?.(caughtError, currentKey);
    } finally {
      if (timer) clearTimeout(timer);
      externalSignal?.removeEventListener("abort", abortExternal);
      if (currentGeneration === generation) pending.value = false;
    }
  };
  const refresh = (executeOptions?: AsyncDataExecuteOptions) => executeWithCause(executeOptions, "refresh:manual");
  const clear = () => {
    generation++;
    context.requestManager.abort(key(), "Async data cleared");
    context.cache.delete(key());
    const value = config.default();
    data.value = isRef(value) ? value.value : value;
    error.value = undefined;
    pending.value = false;
    status.value = "idle";
  };
  let fetchPromise = Promise.resolve();
  if (config.immediate) fetchPromise = executeWithCause(undefined, "initial");
  if (config.watch?.length) watch(config.watch, () => executeWithCause(undefined, "watch"), { deep: true });
  if (isServer && config.server && !config.lazy) onServerPrefetch(() => fetchPromise);
  const result: AsyncDataResult<TransformedData, Error> = { data, pending, error, status, execute: refresh, refresh, clear };
  return Object.assign(config.lazy ? Promise.resolve(result) : fetchPromise.then(() => result), result) as _AsyncData<TransformedData, Error>;
}
