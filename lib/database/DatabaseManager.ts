import type { SqlMethod, WorkerRequest, WorkerResponse } from "./worker-types"

const WORKER_URL = "/sqlite-wasm/open-bible.worker.js"
const USER_DB = "app.db"

/**
 * Asks the browser not to evict OPFS under storage pressure. Without this,
 * downloaded Bibles can silently disappear after a long absence, forcing a
 * re-download. Best-effort: ignores unsupported browsers and denied requests.
 */
function requestPersistentStorage(): void {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) return
  navigator.storage.persist().catch(() => { /* ignore — best effort */ })
}

/**
 * Owns the single SQLite worker and exposes a typed, promise-based API.
 * All SQL execution funnels through here — React/repositories never touch
 * the worker directly. Client-only (requires Worker + OPFS).
 */
export class DatabaseManager {
  private worker: Worker | null = null
  private seq = 0
  private pending = new Map<number, { resolve: (r: WorkerResponse) => void; reject: (e: Error) => void }>()
  private initialized = false
  private initPromise: Promise<void> | null = null

  private rpc(req: Omit<WorkerRequest, "id">, transfer?: Transferable[]): Promise<WorkerResponse> {
    if (!this.worker) throw new Error("DatabaseManager not initialized")
    const id = ++this.seq
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.worker!.postMessage({ ...req, id }, transfer ?? [])
    })
  }

  private onMessage = (e: MessageEvent<WorkerResponse>) => {
    const res = e.data
    const entry = this.pending.get(res.id)
    if (!entry) return
    this.pending.delete(res.id)
    if (res.ok) entry.resolve(res)
    else entry.reject(new Error(res.error ?? "worker error"))
  }

  private onWorkerError = (e: ErrorEvent) => {
    console.error("[DatabaseManager] worker error:", e.message, e)
    const err = new Error(`SQLite worker crashed: ${e.message ?? "unknown error"}`)
    for (const { reject } of this.pending.values()) {
      reject(err)
    }
    this.pending.clear()
    // Allow re-initialization after a crash so the next RPC call boots a fresh worker.
    this.worker = null
    this.initialized = false
    this.initPromise = null
  }

  /** Idempotent. Boots the worker + SAHPool VFS and ensures app.db exists. */
  async initialize(): Promise<void> {
    if (this.initialized) return
    if (this.initPromise) return this.initPromise
    this.initPromise = (async () => {
      if (typeof window === "undefined") throw new Error("DatabaseManager is client-only")
      this.worker = new Worker(WORKER_URL, { type: "module" })
      this.worker.addEventListener("message", this.onMessage)
      this.worker.addEventListener("error", this.onWorkerError)
      await this.rpc({ type: "init" })
      await this.rpc({ type: "open", path: USER_DB })
      this.initialized = true
      requestPersistentStorage()
    })()
    return this.initPromise
  }

  /** Low-level exec used by the Drizzle proxy and BibleDatabase. */
  async exec(dbPath: string, sql: string, params: unknown[] = [], method: SqlMethod = "all"): Promise<unknown[]> {
    const res = await this.rpc({ type: "exec", dbPath, sql, params, method })
    return res.rows ?? []
  }

  /** Install a Bible from raw bytes (e.g. fetched ara.db). name like "ara". */
  async installBible(name: string, file: File | ArrayBuffer): Promise<void> {
    const bytes = file instanceof ArrayBuffer ? file : await file.arrayBuffer()
    await this.rpc({ type: "importDb", path: name, bytes }, [bytes])
  }

  /** Ensure a Bible db is open for querying. Returns its db path. */
  async openBible(name: string): Promise<string> {
    await this.rpc({ type: "open", path: name })
    return `${name}.db`
  }

  /** Path of the user database (for the Drizzle proxy). */
  get userDbPath(): string {
    return USER_DB
  }

  async removeBible(name: string): Promise<void> {
    await this.rpc({ type: "removeDb", path: name })
  }

  /** Names (without .db) of installed Bibles, excluding app.db. */
  async listInstalledBibles(): Promise<string[]> {
    const res = await this.rpc({ type: "listFiles" })
    return (res.files ?? [])
      .map((f) => String(f).replace(/^.*\//, "").replace(/\.db$/, ""))
      .filter((n) => n && n !== "app")
  }
}
