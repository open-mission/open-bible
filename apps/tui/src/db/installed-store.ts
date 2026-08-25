import * as fs from "node:fs"
import { appDbPath, ensureDataDirs } from "./paths.js"
import { openReadWrite, type SqliteDb } from "./sqlite.js"

export interface InstalledBible {
  id: string
  name: string
  installedAt: number
  versionCode: number
}

export class InstalledStore {
  private db: SqliteDb

  constructor(dbPath?: string) {
    ensureDataDirs()
    const target = dbPath ?? appDbPath()
    this.db = openReadWrite(target)
    // WAL mode for concurrency (works for both drivers via pragma/exec)
    try { this.db.pragma?.("journal_mode = WAL") } catch {}
    this.initSchema()
  }

  private initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS installed_bibles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        installed_at INTEGER NOT NULL,
        version_code INTEGER NOT NULL DEFAULT 1
      );
    `)
  }

  list(): InstalledBible[] {
    const rows = this.db.prepare("SELECT id, name, installed_at, version_code FROM installed_bibles ORDER BY id").all() as { id: string; name: string; installed_at: number; version_code: number }[]
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      installedAt: r.installed_at,
      versionCode: r.version_code,
    }))
  }

  get(id: string): InstalledBible | null {
    const row = this.db.prepare("SELECT id, name, installed_at, version_code FROM installed_bibles WHERE id = ?").get(id) as { id: string; name: string; installed_at: number; version_code: number } | undefined
    if (!row) return null
    return { id: row.id, name: row.name, installedAt: row.installed_at, versionCode: row.version_code }
  }

  upsert(bible: InstalledBible): void {
    this.db.prepare(`
      INSERT INTO installed_bibles (id, name, installed_at, version_code)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET name=excluded.name, installed_at=excluded.installed_at, version_code=excluded.version_code
    `).run(bible.id, bible.name, bible.installedAt, bible.versionCode)
  }

  remove(id: string): boolean {
    const info = this.db.prepare("DELETE FROM installed_bibles WHERE id = ?").run(id)
    return info.changes > 0
  }

  close(): void {
    this.db.close()
  }

  getDbPath(): string {
    return this.db.name ?? appDbPath()
  }
}
