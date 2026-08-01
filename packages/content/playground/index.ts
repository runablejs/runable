import { join, resolve } from "node:path";
import {
  mdc,
  defineCollection,
  defineContentConfig,
  resolveContentConfig,
  saveCollections,
  getCollection,
} from "../core";
import Database from "better-sqlite3";

interface DocMeta {
  title: string;
  description?: string;
}

function docSchema(data: unknown, filePath: string): DocMeta {
  if (typeof data !== "object" || data === null) {
    throw new Error("meta doit être un objet");
  }
  const meta = data as Record<string, unknown>;

  if (typeof meta.title !== "string") {
    throw new Error(`champ "title" manquant ou invalide`);
  }

  return {
    title: meta.title,
    description:
      typeof meta.description === "string" ? meta.description : undefined,
  };
}

const config = defineContentConfig({
  collections: {
    docs: defineCollection<DocMeta>({
      type: "page",
      source: {
        include: "docs/**/*.md",
        exclude: "docs/**/*.draft.md",
        prefix: "/docs",
      },
      // schema: docSchema,
    }),

    authors: defineCollection({
      type: "data",
      source: "authors/**/*.yml",
      // pas de schema => data typée `unknown`
    }),
  },
  root: join(import.meta.dirname, "content"),
  output: import.meta.dirname,
});

config.output ??= process.cwd();
config.root ??= join(process.cwd(), "content");

const collections = await resolveContentConfig(config, {
  root: config.root,
});

const e1 = await mdc({
  file: resolve(import.meta.dirname, "./content/docs/get-started/index.md"),
  root: resolve(import.meta.dirname, "./content"),
});

const e2 = await mdc({
  file: resolve(import.meta.dirname, "./content/docs/get-started/usage.md"),
  root: resolve(import.meta.dirname, "./content"),
});

const db = new Database(join(config.output, ".content.sqlite"));
saveCollections(db, collections);

const docs = getCollection(db, config, "docs")
  .path("/docs/documentation/get-started")
  .first();
console.log(docs);

db.close();
