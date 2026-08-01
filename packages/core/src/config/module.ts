import type { SyoraConfig } from "./types.js";

export interface ConfigModule<
  TOptions = unknown,
  TConfigKey = string,
> extends SyoraConfig {
  meta?: {
    default?: TOptions;
    [key: string]: any;
  };
}

type UnwrapModule<T> = T extends { default: infer D }
  ? UnwrapModule<D>
  : T extends (...args: any[]) => infer R
    ? UnwrapModule<R>
    : T extends new (...args: any[]) => infer R
      ? UnwrapModule<R>
      : T;

export type ExtractConfigKey<T> =
  UnwrapModule<T> extends ConfigModule<any, infer K>
    ? string extends K
      ? never
      : K
    : never;

export type ExtractConfigOptions<T> =
  UnwrapModule<T> extends ConfigModule<infer TOptions, any> ? TOptions : never;

export type ModuleConfig<T> = {
  [K in ExtractConfigKey<T>]?: ExtractConfigOptions<T>;
};

export interface ConfigModuleOptions {}

export function defineModule<TOptions = unknown, TConfigKey = string>(
  module: ConfigModule<TOptions, TConfigKey>,
): ConfigModule<TOptions, TConfigKey> {
  return module;
}
