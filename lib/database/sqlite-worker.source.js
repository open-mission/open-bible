// Open Bible — SQLite worker.
// Hosts the SQLite WASM module and the OPFS SAHPool VFS (no COOP/COEP needed).
// Loaded statically as an ESM worker; index.mjs auto-locates sqlite3.wasm
// as a sibling URL (the default export is the "bundler-friendly" init fn).
// NOTE: sqlite-wasm v3.53 ships its ESM build as dist/index.mjs (copied to
// public/sqlite-wasm/jswasm/index.mjs) — NOT the older jswasm/sqlite3.mjs.
// Protocol: see lib/database/worker-types.ts (source of truth).
import sqlite3InitModule from "/sqlite-wasm/jswasm/index.mjs"

const POOL_DIR = "/open-bible"

let sqlite3 = null
let pool = null
/** @type {Map<string, any>} open DB connections keyed by path */
const conns = new Map()

async function ensureInit() {
  if (pool) return
  console.log("[worker] ensureInit: loading sqlite3 WASM...")
  sqlite3 = await sqlite3InitModule()
  console.log("[worker] ensureInit: sqlite3 loaded, installing SAHPool VFS...")
  pool = await sqlite3.installOpfsSAHPoolVfs({
    name: "open-bible-pool",
    directory: POOL_DIR,
    initialCapacity: 8,
  })
  console.log("[worker] ensureInit: pool ready, files:", pool.getFileNames())
}

function fullPath(path) {
  // Normalize "ara" | "ara.db" | "/open-bible/ara.db" → "/open-bible/ara.db"
  let name = path.replace(/^.*\//, "")
  if (!name.endsWith(".db")) name += ".db"
  return `${POOL_DIR}/${name}`
}

function getConn(path) {
  const p = fullPath(path)
  let db = conns.get(p)
  if (!db) {
    db = new pool.OpfsSAHPoolDb(p)
    conns.set(p, db)
  }
  return db
}

async function handle(req) {
  switch (req.type) {
    case "init":
      await ensureInit()
      return {}

    case "open":
      await ensureInit()
      const nameOnly = req.path.replace(/^.*\//, "").replace(/\.db$/, "")
      const p = fullPath(req.path)
      if (nameOnly !== "app" && !pool.getFileNames().includes(p)) {
        throw new Error(`File ${nameOnly}.db does not exist in pool`)
      }
      getConn(req.path) // creates the file if missing (only allowed for app.db here)
      return {}

    case "importDb": {
      console.log(`[worker] importDb start — path=${req.path} bytes=${req.bytes?.byteLength}`)
      await ensureInit()
      console.log(`[worker] importDb ensureInit done`)
      const p = fullPath(req.path)
      const existing = conns.get(p)
      if (existing) { existing.close(); conns.delete(p) }
      console.log(`[worker] importDb calling pool.importDb — pool=${!!pool}`)
      await pool.importDb(p, new Uint8Array(req.bytes))
      console.log(`[worker] importDb pool.importDb done`)
      return {}
    }

    case "removeDb": {
      await ensureInit()
      const p = fullPath(req.path)
      const existing = conns.get(p)
      if (existing) { existing.close(); conns.delete(p) }
      pool.unlink(p)
      return {}
    }

    case "listFiles":
      await ensureInit()
      return { files: pool.getFileNames() }

    case "exec": {
      await ensureInit()
      const db = getConn(req.dbPath)
      const rows = db.exec({
        sql: req.sql,
        bind: req.params && req.params.length ? req.params : undefined,
        rowMode: "array",
        returnValue: "resultRows",
      })
      return { rows }
    }

    case "close": {
      const p = fullPath(req.path)
      const existing = conns.get(p)
      if (existing) { existing.close(); conns.delete(p) }
      return {}
    }

    default:
      throw new Error(`Unknown request type: ${req.type}`)
  }
}

self.onmessage = async (e) => {
  const req = e.data
  try {
    const result = await handle(req)
    self.postMessage({ id: req.id, ok: true, ...result })
  } catch (err) {
    self.postMessage({ id: req.id, ok: false, error: String(err && err.message ? err.message : err) })
  }
}
