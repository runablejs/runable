import type { ResolvedEntry } from "../collection/resolve.js";
import { SqliteDatabase } from "./types.js";

/**
 * Table unique pour toutes les collections : `meta_or_data` contient soit
 * `meta` (entrées "page"), soit `data` (entrées "data"), sérialisé en JSON.
 * On distingue le contenu via `collection` + `type`.
 */
export async function initSchema(db: SqliteDatabase) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collection TEXT NOT NULL,
      type TEXT NOT NULL,
      path TEXT NOT NULL,
      meta_or_data TEXT NOT NULL,
      toc TEXT,
      html TEXT,
      UNIQUE(collection, path)
    );
  `);
}

export function saveCollections(
  db: SqliteDatabase,
  collections: Record<string, ResolvedEntry[]>,
): void {
  initSchema(db);

  // upsert : relancer le script met à jour les entrées existantes
  // au lieu de les dupliquer (utile pendant le dev)
  const upsert = db.prepare(`
    INSERT INTO entries (collection, type, path, meta_or_data, toc, html)
    VALUES (@collection, @type, @path, @meta_or_data, @toc, @html)
    ON CONFLICT(collection, path) DO UPDATE SET
      type = excluded.type,
      meta_or_data = excluded.meta_or_data,
      toc = excluded.toc,
      html = excluded.html
  `);

  const rows = Object.entries(collections).flatMap(
    ([collectionName, entries]) =>
      entries.map((entry) =>
        entry.type === "page"
          ? {
              collection: collectionName,
              type: "page",
              path: entry.path,
              meta_or_data: JSON.stringify(entry.meta),
              toc: JSON.stringify(entry.toc ?? null),
              html: entry.html,
            }
          : {
              collection: collectionName,
              type: "data",
              path: entry.path,
              meta_or_data: JSON.stringify(entry.data),
              toc: null,
              html: null,
            },
      ),
  );

  // transaction = toutes les lignes en une seule écriture disque
  db.transaction((rs: typeof rows) => {
    for (const row of rs) upsert.run(row);
  })(rows);
}
