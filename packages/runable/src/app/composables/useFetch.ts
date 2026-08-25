import type { FetchOptions, ResponseType } from "ofetch";
import type { MaybeRefOrGetter, Ref, WatchSource } from "vue";
import { computed, reactive, toValue } from "vue";
import {
  useAsyncData,
  type _AsyncData,
} from "../../async-data/composable/index.js";
import type { AsyncDataOptions } from "../../async-data/types.js";
import { $fetch as defaultFetch } from "../../fetch/globals.js";

type FetchRequest = Parameters<typeof defaultFetch>[0];
type Fetcher = typeof defaultFetch;

export type KeysOf<T> = Array<
  T extends T ? (keyof T extends string ? keyof T : never) : never
>;
export type PickFrom<T, K extends KeysOf<T>> =
  T extends Array<unknown>
    ? T
    : T extends Record<string, unknown>
      ? K[number] extends never
        ? T
        : Pick<T, K[number]>
      : T;
type ComputedOptions<T extends Record<string, unknown>> = {
  [K in keyof T]: T[K] extends (...args: never[]) => unknown
    ? T[K]
    : T[K] extends Record<string, unknown>
      ? ComputedOptions<T[K]> | MaybeRefOrGetter<T[K]>
      : MaybeRefOrGetter<T[K]>;
};

export interface UseFetchOptions<
  ResT,
  DataT = ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = undefined,
>
  extends
    Omit<
      AsyncDataOptions<ResT, DataT>,
      "watch" | "default" | "transform" | "pick"
    >,
    ComputedOptions<Omit<FetchOptions<ResponseType, DataT>, "timeout">> {
  key?: MaybeRefOrGetter<string>;
  $fetch?: Fetcher;
  watch?: Array<WatchSource<unknown> | object> | false;
  default?: () => DefaultT | Ref<DefaultT>;
  transform?: (input: ResT) => DataT | Promise<DataT>;
  pick?: PickKeys;
}

const REACTIVE_KEYS = [
  "method",
  "baseURL",
  "query",
  "params",
  "body",
  "headers",
] as const;
function stableStringify(value: unknown): string {
  const seen = new WeakSet<object>();
  return JSON.stringify(value, (_key, item: unknown) => {
    const resolved =
      typeof item === "function" ? toValue(item as () => unknown) : item;
    if (!resolved || typeof resolved !== "object") return resolved;
    if (seen.has(resolved)) return "[Circular]";
    seen.add(resolved);
    if (Array.isArray(resolved)) return resolved;
    return Object.keys(resolved)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = (resolved as Record<string, unknown>)[key];
        return result;
      }, {});
  });
}
function hash(input: unknown): string {
  const text = stableStringify(input);
  let value = 5381;
  for (let index = text.length - 1; index >= 0; index--)
    value = (value * 33) ^ text.charCodeAt(index);
  return (value >>> 0).toString(36);
}
function optionKeySegments(options: Record<string, unknown>): unknown[] {
  return [
    String(toValue(options.method as never) || "GET").toUpperCase(),
    toValue(options.baseURL as never),
    toValue((options.query || options.params) as never),
    toValue(options.body as never),
  ];
}

/** Fetch data with the same reactive, SSR-friendly API as Nuxt 4's useFetch. */
export function useFetch<
  ResT = unknown,
  ErrorT = Error,
  DataT = ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = undefined,
>(
  request: MaybeRefOrGetter<FetchRequest>,
  options: UseFetchOptions<ResT, DataT, PickKeys, DefaultT> = {},
): _AsyncData<PickFrom<DataT, PickKeys> | DefaultT, ErrorT> {
  const {
    server,
    lazy,
    default: defaultFactory,
    transform,
    pick,
    watch: watchSources,
    immediate,
    getCachedData,
    deep,
    dedupe,
    timeout,
    enabled,
    serialize,
    ttl,
    key: explicitKey,
    $fetch,
    ...rawFetchOptions
  } = options;
  const resolvedRequest = computed(() => toValue(request));
  const fetchOptions = reactive(rawFetchOptions) as Record<string, unknown>;
  const key = computed(
    () =>
      toValue(explicitKey) ||
      `$f${hash([typeof resolvedRequest.value === "string" ? resolvedRequest.value : "", ...optionKeySegments(fetchOptions)])}`,
  );
  if (
    !fetchOptions.baseURL &&
    typeof resolvedRequest.value === "string" &&
    resolvedRequest.value.startsWith("//")
  ) {
    throw new Error(
      `[useFetch] Protocol-relative URLs are not supported: ${resolvedRequest.value}`,
    );
  }
  const asyncOptions: AsyncDataOptions<ResT, DataT> = {
    server,
    lazy,
    default: defaultFactory as (() => DataT) | undefined,
    transform,
    pick: pick as string[] | undefined,
    immediate,
    getCachedData,
    deep,
    dedupe,
    timeout,
    enabled,
    serialize,
    ttl,
    watch:
      watchSources === false
        ? undefined
        : [...(watchSources || []), resolvedRequest, fetchOptions],
  };
  return useAsyncData<ResT, DataT>(
    key,
    (signal) => {
      const resolvedOptions: Record<string, unknown> = {
        ...fetchOptions,
        signal,
      };
      for (const optionKey of REACTIVE_KEYS) {
        if (typeof resolvedOptions[optionKey] === "function")
          resolvedOptions[optionKey] = toValue(
            resolvedOptions[optionKey] as () => unknown,
          );
      }
      return ($fetch || defaultFetch)(
        resolvedRequest.value,
        resolvedOptions,
      ) as Promise<ResT>;
    },
    asyncOptions,
  ) as _AsyncData<PickFrom<DataT, PickKeys> | DefaultT, ErrorT>;
}

export function useLazyFetch<
  ResT = unknown,
  ErrorT = Error,
  DataT = ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = undefined,
>(
  request: MaybeRefOrGetter<FetchRequest>,
  options: UseFetchOptions<ResT, DataT, PickKeys, DefaultT> = {},
) {
  return useFetch<ResT, ErrorT, DataT, PickKeys, DefaultT>(request, {
    ...options,
    lazy: true,
  });
}
