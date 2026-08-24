import { drizzle } from "drizzle-orm/sqlite-proxy"
import type { DatabaseManager } from "../DatabaseManager"
import * as schema from "./schema"

/**
 * Drizzle instance for app.db. Every query becomes an async RPC to the worker.
 * The sqlite-proxy callback returns { rows } where rows are arrays of column
 * values (rowMode "array"); for method "get" Drizzle expects a single row.
 */
export function createUserDb(manager: DatabaseManager) {
  const path = manager.userDbPath
  return drizzle(
    async (sql, params, method) => {
      const rows = await manager.exec(path, sql, params, method)
      return { rows: method === "get" ? ((rows[0] as unknown[]) ?? []) : (rows as unknown[]) }
    },
    { schema }
  )
}

export type UserDb = ReturnType<typeof createUserDb>
