// Message contract shared between the main thread (DatabaseManager) and the
// SQLite worker. Kept in a standalone module so both sides stay in sync.
// NOTE: the worker itself is plain JS (public/sqlite-wasm/open-bible.worker.js)
// and references these shapes only via JSDoc — this file is the source of truth.

export type SqlMethod = "all" | "get" | "run" | "values"

export interface WorkerRequest {
  id: number
  type: "init" | "open" | "exec" | "importDb" | "removeDb" | "listFiles" | "close"
  // open / importDb / removeDb / close
  path?: string
  // importDb
  bytes?: ArrayBuffer
  // exec
  dbPath?: string
  sql?: string
  params?: unknown[]
  method?: SqlMethod
}

export interface WorkerResponse {
  id: number
  ok: boolean
  error?: string
  // exec → array of row-arrays (rowMode: "array")
  rows?: unknown[]
  // listFiles → file paths in the SAHPool
  files?: string[]
}
