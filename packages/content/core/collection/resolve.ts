import fg from "fast-glob";
import { join, extname, relative, sep } from "node:path";
import { readFile } from "node:fs/promises";
import { parse as parseYaml } from "yaml";
import type {
  CollectionDefinition,
  CollectionSource,
  SchemaValidator,
} from "./collection.js";
import { normalizeSources } from "./collection.js";
import { mdc } from "../index.js";
import { compressCollection } from "./compressor.js";
import { atomicWriteFile, normalizeDir, ResolvedConfig } from "@syora/core";

export interface ResolvedPageEntry<TMeta = unknown> {
  type: "page";
  path: string;
  meta: TMeta;
  toc: unknown;
  html: string;
}

export interface ResolvedDataEntry<TData = unknown> {
  type: "data";
  path: string;
  data: TData;
}

export type ResolvedEntry = ResolvedPageEntry | ResolvedDataEntry;

interface ResolveOptions {
  root: string;
  syoraConfig: ResolvedConfig;
}

function applyPrefix(path: string, prefix?: string): string {
  if (!prefix) return path;
  const cleanPrefix = prefix.startsWith("/") ? prefix : "/" + prefix;
  return path === "/" ? cleanPrefix : cleanPrefix + path;
}

function validate<T>(
  schema: SchemaValidator<T> | undefined,
  data: unknown,
  filePath: string,
): T {
  if (!schema) return data as T;

  try {
    return schema(data, filePath);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Validation échouée pour ${filePath}:\n  ${reason}`);
  }
}

async function collectFiles(
  source: CollectionSource,
  root: string,
): Promise<{ absolutePath: string; cwd: string }[]> {
  const cwd = source.cwd ? join(root, source.cwd) : root;

  const files = await fg(source.include, {
    cwd,
    ignore: source.exclude
      ? Array.isArray(source.exclude)
        ? source.exclude
        : [source.exclude]
      : undefined,
    absolute: false,
    onlyFiles: true,
  });

  return files.map((f) => ({ absolutePath: join(cwd, f), cwd }));
}

async function resolvePageEntry<T>(
  filePath: string,
  cwd: string,
  source: CollectionSource,
  schema: SchemaValidator<T> | undefined,
): Promise<ResolvedPageEntry<T>> {
  const vfile = await mdc({ file: filePath, root: cwd });

  const meta = validate(schema, vfile.data.meta, filePath);
  const path = applyPrefix(vfile.data.path!, source.prefix);

  return {
    type: "page",
    path,
    meta,
    toc: vfile.data.toc,
    html: vfile.toString(),
  };
}

async function resolveDataEntry<T>(
  filePath: string,
  cwd: string,
  source: CollectionSource,
  schema: SchemaValidator<T> | undefined,
): Promise<ResolvedDataEntry<T>> {
  const raw = await readFile(filePath, "utf8");
  const ext = extname(filePath);

  const parsed = ext === ".json" ? JSON.parse(raw) : parseYaml(raw);
  const data = validate(schema, parsed, filePath);

  const relativePath = relative(cwd, filePath);
  const withoutExt = relativePath.slice(0, -ext.length);
  const segments = withoutExt.split(sep).filter(Boolean);

  const path = applyPrefix("/" + segments.join("/"), source.prefix);

  return { type: "data", path, data };
}

export async function resolveCollection<T>(
  definition: CollectionDefinition<T>,
  options: ResolveOptions,
): Promise<(ResolvedPageEntry<T> | ResolvedDataEntry<T>)[]> {
  const sources = normalizeSources(definition.source);
  const entries: (ResolvedPageEntry<T> | ResolvedDataEntry<T>)[] = [];

  for (const source of sources) {
    const files = await collectFiles(source, options.root);

    for (const { absolutePath, cwd } of files) {
      const entry =
        definition.type === "page"
          ? await resolvePageEntry(absolutePath, cwd, source, definition.schema)
          : await resolveDataEntry(
              absolutePath,
              cwd,
              source,
              definition.schema,
            );

      entries.push(entry);
    }
  }

  return entries;
}

const dtsCollectionTemplate = `
import type { ResolvedPageEntry, ResolvedDataEntry } from '{{resolve_path}}';

export type Collections = {
{{collection_types}}
}
`;

export async function resolveContentConfig<
  TCollections extends Record<string, CollectionDefinition<any>>,
>(
  config: { collections?: TCollections },
  options: ResolveOptions,
): Promise<{
  compressed: string;
  collections: {
    [K in keyof TCollections]: TCollections[K] extends CollectionDefinition<
      infer T
    >
      ? TCollections[K]["type"] extends "page"
        ? ResolvedPageEntry<T>[]
        : ResolvedDataEntry<T>[]
      : never;
  };
}> {
  const collections = config.collections ?? ({} as TCollections);

  const result = {} as any;
  const _collections = [];
  const types = [];

  for (const key of Object.keys(collections)) {
    result[key] = await resolveCollection(
      collections[key as keyof TCollections],
      options,
    );

    const compressed = await compressCollection(result[key]);

    _collections.push(`export const ${key} = "${compressed}";`);

    if (collections[key].type === "page") {
      types.push(`  ${key}: ResolvedPageEntry;`);
    } else {
      types.push(`  ${key}: ResolvedDataEntry;`);
    }
  }

  const outputContent = join(options.syoraConfig.output, "content");

  atomicWriteFile(
    join(options.syoraConfig.output, "content", "compressed.ts"),
    _collections.join("\n"),
  );

  atomicWriteFile(
    join(outputContent, "collections.d.ts"),

    dtsCollectionTemplate
      .replaceAll(
        "{{resolve_path}}",
        normalizeDir(relative(outputContent, import.meta.filename)),
      )
      .replaceAll("{{collection_types}}", types.join("\n")),
  );

  return { collections: result, compressed: _collections.join("\n") };
}
