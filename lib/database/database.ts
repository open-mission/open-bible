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
      const db = this.requireUserDb()
      const exists = await db
        .select()
        .from(schema.installedBibles)
        .where(eq(schema.installedBibles.id, name))

      if (exists.length > 0) {
        await db
          .update(schema.installedBibles)
          .set({ name: displayName, installedAt: new Date() })
          .where(eq(schema.installedBibles.id, name))
      } else {
        await db.insert(schema.installedBibles).values({
          id: name,
          name: displayName,
          installedAt: new Date(),
          versionCode: 1,
        })
      }
    } catch (e) {
      console.error("Failed to register installed Bible in app.db:", e)
    }
  }

  async removeBible(name: string): Promise<void> {
    this.bibles.delete(name)
    await this.manager.removeBible(name)

    try {
      const db = this.requireUserDb()
      await db.delete(schema.installedBibles).where(eq(schema.installedBibles.id, name))
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
