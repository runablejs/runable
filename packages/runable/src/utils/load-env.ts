import { config as loadDotenvFile } from "dotenv";
import camelCase from "lodash/camelCase.js";
import merge from "lodash/merge.js";
import { inferEnvType, inferEnvValue, type EnvValue } from "./infer-env";

// Kept in sync with the `runable:runtime` Vite plugin.
const RELEVANT_PREFIX = /^(RUN_|VITE_)/;
const PUBLIC_PREFIX = /^(RUN_PUBLIC_|VITE_PUBLIC_)/;

function toPropName(key: string, prefix: RegExp): string {
  return camelCase(key.replace(prefix, ""));
}

export interface RuntimeEnvValues {
  public: Record<string, EnvValue>;
  private: Record<string, EnvValue>;
}

export interface LoadEnvResult {
  /** Raw env vars, original prefixed name -> value. */
  raw: { public: Record<string, string>; private: Record<string, string> };
  /** Reshaped for runtime use: `{ public: {...}, ...private }`, camelCase, prefix stripped. */
  runtime: RuntimeEnvValues;
  types: { public: Record<string, string>; private: Record<string, string> };
}

/**
 * Loads `.env*` file(s) via dotenv, merges them with `process.env`, and
 * keeps only the `RUN_`/`VITE_`-prefixed variables.
 *
 * Returns both:
 * - `raw`: original prefixed names -> value
 * - `runtime`: same split used by the `runable:runtime` Vite plugin
 *   (`*_PUBLIC_*` under `public`, the rest flat), camelCase, prefix stripped
 */
export function loadRuntimeEnv({
  path,
  envs,
}: {
  path?: string | string[];
  envs?: Record<string, EnvValue>;
} = {}): LoadEnvResult {
  const parsed: Record<string, EnvValue> = {};

  if (!envs) {
    // `processEnv: {}` keeps dotenv from mutating the global `process.env`;
    // we merge it ourselves below so already-exported shell vars still win.
    // `quiet: true` keeps it from writing its own "injected env (...) from
    // .env" notice straight to stdout on every call — this is a library
    // used from arbitrary host processes (including, notably, an MCP
    // server whose stdout is reserved for a wire protocol), so it must
    // never assume stdout is free for its own informational output.
    merge(parsed, loadDotenvFile({ path, processEnv: {}, quiet: true }).parsed);
  } else {
    merge(parsed, envs);
  }

  const merged = merge(parsed, process.env);

  const raw: LoadEnvResult["raw"] = { public: {}, private: {} };
  const runtime: RuntimeEnvValues = { public: {}, private: {} };
  const types: LoadEnvResult["types"] = { public: {}, private: {} };

  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || !RELEVANT_PREFIX.test(key)) continue;

    const _value = inferEnvValue(value);
    const _types = inferEnvType(_value);

    if (PUBLIC_PREFIX.test(key)) {
      raw.public[key] = value;
      runtime.public[toPropName(key, PUBLIC_PREFIX)] = _value;
      types.public[toPropName(key, PUBLIC_PREFIX)] = _types;
    } else {
      raw.private[key] = value;
      runtime.private[toPropName(key, RELEVANT_PREFIX)] = _value;
      types.private[toPropName(key, RELEVANT_PREFIX)] = _types;
    }
  }

  return { raw, runtime, types };
}
