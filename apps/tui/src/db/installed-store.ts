import Database from "better-sqlite3"
import * as fs from "node:fs"
import * as path from "node:path"
import { appDbPath, ensureDataDirs } from "./paths.js"

export interface InstalledBible {
  id: string
  name: string
  installedAt: number
  versionCode: number
}

export class InstalledStore {
  private db: Database.Database

  constructor(dbPath?: string) {
    ensureDataDirs()
    const target = dbPath ?? appDbPath()
    const existed = fs.existsSync(target)
    this.db = new Database(target)
    this.db.pragma("journal_mode = WAL")
    this.initSchema()
    if (!existed) {
      // ensure file exists
    }
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
    const rows = this.db.prepare("SELECT id, name, installed_at, version_code FROM installed_bibles ORDER BY id").all() as any[]
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      installedAt: r.installed_at,
      versionCode: r.version_code,
    }))
  }

  get(id: string): InstalledBible | null {
    const row = this.db.prepare("SELECT id, name, installed_at, version_code FROM installed_bibles WHERE id = ?").get(id) as any
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore internal
    return (this.db as any).name ?? appDbPath()
  }
}
