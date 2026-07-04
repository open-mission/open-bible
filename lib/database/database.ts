import { DatabaseManager } from "./DatabaseManager"
import { createUserDb, type UserDb } from "./user/drizzle"
import { runUserMigrations } from "./user/migrator"
import { notesRepository } from "./user/repositories/notesRepository"
import { noteReferencesRepository } from "./user/repositories/noteReferencesRepository"
import { BibleDatabase } from "./bible/BibleDatabase"
import * as schema from "./user/schema"
import { eq } from "drizzle-orm"

/**
 * Single entry point for the whole app. React imports only from here (plus the
 * repository/BibleDatabase types). Holds the manager, the Drizzle user db, and
 * caches open BibleDatabase instances.
 */
class Database {
  readonly manager = new DatabaseManager()
  private userDb: UserDb | null = null
  private bibles = new Map<string, BibleDatabase>()
  private ready: Promise<void> | null = null

  /** Idempotent: boot worker, open + migrate app.db. */
  async initialize(): Promise<void> {
    if (this.ready) return this.ready
    this.ready = (async () => {
      await this.manager.initialize()
      await runUserMigrations(this.manager)
      this.userDb = createUserDb(this.manager)
    })()
    return this.ready
  }

  private requireUserDb(): UserDb {
    if (!this.userDb) throw new Error("Database not initialized — call initialize() first")
    return this.userDb
  }

  /** Direct access to the Drizzle user db (app.db). */
  openUserDatabase(): UserDb {
    return this.requireUserDb()
  }

  get notes() {
    return notesRepository(this.requireUserDb())
  }

  get noteReferences() {
    return noteReferencesRepository(this.requireUserDb())
  }

  /** Open (caching) a BibleDatabase for an installed version. */
  async openBible(name: string): Promise<BibleDatabase> {
    const cached = this.bibles.get(name)
    if (cached) return cached
    const path = await this.manager.openBible(name)
    const bible = new BibleDatabase(this.manager, path, name)
    this.bibles.set(name, bible)
    return bible
  }

  async installBible(name: string, file: File | ArrayBuffer): Promise<void> {
    this.bibles.delete(name)
    await this.manager.installBible(name, file)

    try {
      const bible = await this.openBible(name)
      const displayName = await bible.name()

      // Use raw SQL via manager.exec instead of Drizzle to avoid
      // abstraction that masks the underlying SQLite error.
      const path = this.manager.userDbPath

      // Verify installed_bibles table exists, create if missing
      const tableExists = await this.manager.tableExists(path, "installed_bibles")
      if (!tableExists) {
        console.warn("[Database] installed_bibles table missing, creating it now")
        await this.manager.exec(
          path,
          `CREATE TABLE IF NOT EXISTS \`installed_bibles\` (
            \`id\` text PRIMARY KEY NOT NULL,
            \`name\` text NOT NULL,
            \`installed_at\` integer NOT NULL,
            \`version_code\` integer DEFAULT 1 NOT NULL
          )`,
          [],
          "run"
        )
      }

      // Check if already installed
      const existing = await this.manager.exec(
        path,
        `SELECT id FROM installed_bibles WHERE id = ?`,
        [name],
        "all"
      )

      if (existing.length > 0) {
        await this.manager.exec(
          path,
          `UPDATE installed_bibles SET name = ?, installed_at = ?, version_code = 1 WHERE id = ?`,
          [displayName, Date.now(), name],
          "run"
        )
      } else {
        await this.manager.exec(
          path,
          `INSERT INTO installed_bibles (id, name, installed_at, version_code) VALUES (?, ?, ?, 1)`,
          [name, displayName, Date.now()],
          "run"
        )
      }
    } catch (e) {
      console.error("Failed to register installed Bible in app.db:", e)
    }
  }

  async removeBible(name: string): Promise<void> {
    this.bibles.delete(name)
    await this.manager.removeBible(name)

    try {
      const path = this.manager.userDbPath
      await this.manager.exec(
        path,
        `DELETE FROM installed_bibles WHERE id = ?`,
        [name],
        "run"
      )
    } catch (e) {
      console.error("Failed to remove Bible registration from app.db:", e)
    }
  }

  async listInstalledBibles(): Promise<string[]> {
    try {
      const db = this.requireUserDb()
      const rows = await db.select().from(schema.installedBibles)
      return rows.map((r) => r.id)
    } catch {
      return this.manager.listInstalledBibles()
    }
  }
}

// Client-only singleton.
export const database = new Database()
