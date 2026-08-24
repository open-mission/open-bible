import type { DatabaseManager } from "../DatabaseManager"
import { MIGRATIONS } from "./migrations"

/**
 * Applies pending migrations to app.db. Tracks applied tags in a metadata
 * table. Idempotent — safe to call on every initialize().
 */
export async function runUserMigrations(db: DatabaseManager): Promise<void> {
  const path = db.userDbPath
  await db.exec(
    path,
    `CREATE TABLE IF NOT EXISTS __migrations (tag text PRIMARY KEY NOT NULL, applied_at integer NOT NULL)`,
    [],
    "run"
  )
  const appliedRows = await db.exec(path, `SELECT tag FROM __migrations`, [], "all")
  const applied = new Set(appliedRows.map((r) => (r as unknown[])[0] as string))

  for (const migration of MIGRATIONS) {
    if (applied.has(migration.tag)) continue
    for (const stmt of migration.statements) {
      await db.exec(path, stmt, [], "run")
    }
    await db.exec(path, `INSERT INTO __migrations (tag, applied_at) VALUES (?, ?)`, [migration.tag, Date.now()], "run")
  }
}
