import Database from "better-sqlite3";
import type { CollectionDefinition } from "../collection/collection.js";
import type {
  ResolvedDataEntry,
  ResolvedPageEntry,
} from "../collection/resolve.js";

interface EntryRow {
  type: "page" | "data";
  path: string;
  meta_or_data: string;
  toc: string | null;
  html: string | null;
}

function rowToEntry<T>(
  row: EntryRow,
): ResolvedPageEntry<T> | ResolvedDataEntry<T> {
  if (row.type === "page") {
    return {
      type: "page",
      path: row.path,
      meta: JSON.parse(row.meta_or_data) as T,
      toc: row.toc ? JSON.parse(row.toc) : undefined,
      html: row.html ?? "",
    };
  }

  return {
    type: "data",
    path: row.path,
    data: JSON.parse(row.meta_or_data) as T,
  };
}

/** Query builder chaînable, à la `queryCollection` de Nuxt Content */
export interface CollectionQuery<T> {
  /** Filtre sur un path exact (ex: "/docs/get-started") */
  path(path: string): CollectionQuery<T>;
  /** Tri par path (ASC par défaut) */
  order(direction?: "ASC" | "DESC"): CollectionQuery<T>;
  limit(n: number): CollectionQuery<T>;
  /** Exécute la requête, retourne toutes les entrées matchées */
  all(): (ResolvedPageEntry<T> | ResolvedDataEntry<T>)[];
  /** Exécute la requête, retourne la première entrée (ou undefined) */
  first(): ResolvedPageEntry<T> | ResolvedDataEntry<T> | undefined;
}

interface QueryState {
  path?: string;
  order: "ASC" | "DESC";
  limit?: number;
}

class CollectionQueryImpl<T> implements CollectionQuery<T> {
  private state: QueryState = { order: "ASC" };

  constructor(
    private db: Database.Database,
    private collection: string,
  ) {}

  path(path: string): this {
    this.state.path = path;
    return this;
  }

  order(direction: "ASC" | "DESC" = "ASC"): this {
    this.state.order = direction;
    return this;
  }

  limit(n: number): this {
    this.state.limit = n;
    return this;
  }

  all(): (ResolvedPageEntry<T> | ResolvedDataEntry<T>)[] {
    const { sql, params } = this.build();
    const rows = this.db.prepare(sql).all(...params) as EntryRow[];
    return rows.map((row) => rowToEntry<T>(row));
  }

  first(): ResolvedPageEntry<T> | ResolvedDataEntry<T> | undefined {
    const { sql, params } = this.build(1);
    const row = this.db.prepare(sql).get(...params) as EntryRow | undefined;
    return row ? rowToEntry<T>(row) : undefined;
  }

  private build(forcedLimit?: number): { sql: string; params: unknown[] } {
    const params: unknown[] = [this.collection];
    let sql = `SELECT type, path, meta_or_data, toc, html FROM entries WHERE collection = ?`;

    if (this.state.path !== undefined) {
      sql += ` AND path = ?`;
      params.push(this.state.path);
    }

    sql += ` ORDER BY path ${this.state.order}`;

    const limit = forcedLimit ?? this.state.limit;
    if (limit !== undefined) {
      sql += ` LIMIT ?`;
      params.push(limit);
    }

    return { sql, params };
  }
}

export function getCollection<
  TCollections extends Record<string, CollectionDefinition<any>>,
  K extends keyof TCollections & string,
>(
  db: Database.Database,
  config: { collections: TCollections },
  name: K,
): TCollections[K] extends CollectionDefinition<infer T>
  ? CollectionQuery<T>
  : never {
  // garde-fou : évite une requête avec un nom de collection qui n'existe
  // pas dans la config (typo, collection renommée, etc.)
  if (!(name in config.collections)) {
    throw new Error(`Collection "${name}" inconnue`);
  }

  return new CollectionQueryImpl<any>(db, name) as any;
}
