import { createRequire } from "node:module"
import * as fs from "node:fs"

const require = createRequire(import.meta.url)

export interface SqliteStatement {
  all(...params: unknown[]): unknown[]
  get(...params: unknown[]): unknown
  run(...params: unknown[]): { changes: number; lastInsertRowid?: unknown }
}

export interface SqliteDb {
  prepare(sql: string): SqliteStatement
  exec(sql: string): void
  pragma?(query: string): unknown
  close(): void
  // optional name for debugging
  readonly name?: string
}

function isBunRuntime(): boolean {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return typeof Bun !== "undefined" || !!(process as unknown as { versions?: { bun?: string } }).versions?.bun
}

function openWithBetterSqlite(path: string, readonly: boolean): SqliteDb | null {
  try {
    const BetterSqlite = require("better-sqlite3")
    const db = new BetterSqlite(path, readonly ? { readonly: true } : {})
    // wrap to conform
    return {
      name: path,
      prepare: (sql: string) => {
        const stmt = db.prepare(sql)
        return {
          all: (...params: unknown[]) => stmt.all(...params) as unknown[],
          get: (...params: unknown[]) => stmt.get(...params) as unknown,
          run: (...params: unknown[]) => stmt.run(...params) as { changes: number },
        }
      },
      exec: (sql: string) => db.exec(sql),
      pragma: (q: string) => (db as unknown as { pragma: (s: string) => unknown }).pragma(q),
      close: () => db.close(),
    }
  } catch {
    return null
  }
}

function openWithBunSqlite(path: string, readonly: boolean): SqliteDb | null {
  try {
    const { Database } = require("bun:sqlite") as { Database: new (p: string, opts?: unknown) => unknown }
    const db = new Database(path, readonly ? { readonly: true } : { create: true }) as unknown as {
      query(sql: string): { all(...p: unknown[]): unknown[]; get(...p: unknown[]): unknown; run(...p: unknown[]): { changes: number } }
      exec(sql: string): void
      close(): void
    }
    return {
      name: path,
      prepare: (sql: string) => {
        const stmt = db.query(sql)
        return {
          all: (...params: unknown[]) => stmt.all(...(params as [])) as unknown[],
          get: (...params: unknown[]) => stmt.get(...(params as [])) as unknown,
          run: (...params: unknown[]) => stmt.run(...(params as [])) as { changes: number },
        }
      },
      exec: (sql: string) => db.exec(sql),
      pragma: (q: string) => db.exec(`PRAGMA ${q}`),
      close: () => db.close(),
    }
  } catch {
    return null
  }
}

export function openReadOnly(path: string): SqliteDb {
  if (!fs.existsSync(path)) throw new Error(`DB not found: ${path}`)
  if (isBunRuntime()) {
    const db = openWithBunSqlite(path, true)
    if (db) return db
    // fallback to better-sqlite3 even under bun if available (unlikely)
    const fallback = openWithBetterSqlite(path, true)
    if (fallback) return fallback
    throw new Error("No sqlite driver available (tried bun:sqlite and better-sqlite3)")
  } else {
    const db = openWithBetterSqlite(path, true)
    if (db) return db
    throw new Error("better-sqlite3 not available. Run with Node 22 and ensure native build exists.")
  }
}

export function openReadWrite(path: string): SqliteDb {
  if (isBunRuntime()) {
    const db = openWithBunSqlite(path, false)
    if (db) return db
    const fallback = openWithBetterSqlite(path, false)
    if (fallback) return fallback
    throw new Error("No sqlite driver available for read-write")
  } else {
    const db = openWithBetterSqlite(path, false)
    if (db) return db
    throw new Error("better-sqlite3 not available")
  }
}
