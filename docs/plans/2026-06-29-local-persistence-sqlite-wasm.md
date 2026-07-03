# Camada de Persistência Local (SQLite WASM + OPFS + Drizzle) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first persistence layer where every datum (Bibles + user data) lives in SQLite files inside OPFS, accessed through Drizzle ORM, and wire Bible reading to it while creating `app.db` ready for future notes/sync.

**Architecture:** A single dedicated **Web Worker** hosts the SQLite WASM module and installs the **OPFS SAHPool VFS** (no COOP/COEP headers required — critical because the app loads cross-origin scripts like Vercel Analytics that `require-corp` would block). The worker exposes an RPC protocol (`open`/`exec`/`importDb`/`removeDb`/`listFiles`). A main-thread `DatabaseManager` singleton wraps that RPC with a typed promise API. The user database (`app.db`) is driven by **Drizzle via the `sqlite-proxy` driver** (each query is an async RPC round-trip to the worker). Bible databases (`ara.db`, …) are opened read-only and queried through a thin `BibleDatabase` class. React never touches SQL — only `DatabaseManager`, repositories, and `BibleDatabase`.

**Tech Stack:** `@sqlite.org/sqlite-wasm` (OPFS SAHPool VFS), `drizzle-orm` (`sqlite-proxy`), `drizzle-kit` (dev-only, schema→SQL generation), TypeScript, Next.js 16 / React 19.

---

## Path adaptation note

The spec writes `src/lib/database/…`, but **this project has no `src/` directory** — all library code lives in `lib/` at the repo root (`@/*` → `./*`). This plan therefore uses **`lib/database/…`**. The internal structure matches the spec exactly:

```
lib/database/
  DatabaseManager.ts
  database.ts
  worker-types.ts          ← shared RPC message types (worker ↔ main)
  user/
    schema.ts
    drizzle.ts             ← sqlite-proxy connection bound to app.db
    migrator.ts            ← runtime migrator (browser-safe)
    migrations/
      index.ts             ← embedded migration SQL + journal
    repositories/
      notesRepository.ts
      noteReferencesRepository.ts
  bible/
    book-meta.ts           ← integer bookId (1-66) → app string id mapping
    BibleDatabase.ts

public/sqlite-wasm/
  open-bible.worker.js     ← the worker (plain JS, served statically)
  jswasm/                  ← copied from the npm package (sqlite3.mjs + .wasm)

public/bibles/
  ara.db                   ← copy of resources/bibles/ARA.sqlite

scripts/
  copy-sqlite-wasm.mjs     ← copies jswasm into public + ara.db
drizzle.config.ts          ← dev-only, for `drizzle-kit generate`
```

### Why the worker is served from `public/` (not bundled)

`FileSystemSyncAccessHandle` (required by every OPFS VFS, including SAHPool) is **only available inside a Web Worker**. Bundling sqlite-wasm + its `.wasm` through webpack/turbopack is fragile (wasm locating, `optimizeDeps`). Serving the official ESM build statically from `public/sqlite-wasm/jswasm/` and loading it from a hand-written ESM worker (`new Worker(url, { type: "module" })`) sidesteps the bundler entirely: `sqlite3.mjs` auto-locates `sqlite3.wasm` as a sibling URL. This is deterministic across Next dev/build and forward-compatible with Tauri (same static assets).

---

## Task 1: Dependencies + static SQLite WASM assets

**Files:**
- Modify: `package.json` (deps + scripts)
- Create: `scripts/copy-sqlite-wasm.mjs`

- [ ] **Step 1: Install runtime + dev dependencies**

Run:
```bash
pnpm add @sqlite.org/sqlite-wasm drizzle-orm
pnpm add -D drizzle-kit
```
Expected: all three resolve and install; `node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/sqlite3.mjs` exists.

- [ ] **Step 2: Verify the package's jswasm path**

Run:
```bash
ls node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/ | grep -E 'sqlite3\.(mjs|wasm)$'
```
Expected: prints `sqlite3.mjs` and `sqlite3.wasm`. If the path differs, note the actual path and use it in Step 3.

- [ ] **Step 3: Create the asset-copy script**

Create `scripts/copy-sqlite-wasm.mjs`:
```js
// Copies the official sqlite-wasm ESM build into public/ so a Web Worker can
// load it statically, and copies the seed Bible (ARA) into public/bibles.
// Wired into predev/prebuild so the assets always exist before the app runs.
import { cp, mkdir, access } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = dirname(fileURLToPath(import.meta.url)) + "/.."

const SRC_JSWASM = join(root, "node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm")
const DST_JSWASM = join(root, "public/sqlite-wasm/jswasm")

const SRC_ARA = join(root, "resources/bibles/ARA.sqlite")
const DST_ARA = join(root, "public/bibles/ara.db")

async function exists(p) {
  try { await access(p); return true } catch { return false }
}

async function main() {
  if (!(await exists(SRC_JSWASM))) {
    throw new Error(`sqlite-wasm jswasm not found at ${SRC_JSWASM} — run pnpm install first`)
  }
  await mkdir(dirname(DST_JSWASM), { recursive: true })
  await cp(SRC_JSWASM, DST_JSWASM, { recursive: true })
  console.log(`Copied sqlite-wasm → ${DST_JSWASM}`)

  if (await exists(SRC_ARA)) {
    await mkdir(dirname(DST_ARA), { recursive: true })
    await cp(SRC_ARA, DST_ARA)
    console.log(`Copied ARA Bible → ${DST_ARA}`)
  } else {
    console.warn(`ARA seed not found at ${SRC_ARA} — skipping (install via UI later)`)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
```

- [ ] **Step 4: Wire the script into package.json scripts**

In `package.json`, change `dev`, `build`, and add `copy:wasm`:
```jsonc
"copy:wasm": "node scripts/copy-sqlite-wasm.mjs",
"predev": "node scripts/copy-sqlite-wasm.mjs",
"prebuild": "node scripts/copy-sqlite-wasm.mjs",
```
(Keep existing `dev`/`build` commands unchanged; `predev`/`prebuild` run automatically before them.)

- [ ] **Step 5: Ignore generated public assets**

Append to `.gitignore`:
```
# generated SQLite WASM assets + seed bibles (copied from node_modules/resources)
/public/sqlite-wasm/
/public/bibles/
```

- [ ] **Step 6: Run the copy script and verify assets**

Run:
```bash
pnpm copy:wasm && ls public/sqlite-wasm/jswasm/sqlite3.wasm public/bibles/ara.db
```
Expected: both paths print without error.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml scripts/copy-sqlite-wasm.mjs .gitignore
git commit -m "chore(database): add sqlite-wasm + drizzle deps and asset copy script"
```

---

## Task 2: Shared RPC message types

**Files:**
- Create: `lib/database/worker-types.ts`

- [ ] **Step 1: Define the worker RPC contract**

Create `lib/database/worker-types.ts`:
```ts
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
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors from `lib/database/worker-types.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/database/worker-types.ts
git commit -m "feat(database): add worker RPC message types"
```

---

## Task 3: The SQLite Web Worker (SAHPool VFS)

**Files:**
- Create: `public/sqlite-wasm/open-bible.worker.js`

- [ ] **Step 1: Write the worker**

Create `public/sqlite-wasm/open-bible.worker.js`:
```js
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
  sqlite3 = await sqlite3InitModule()
  pool = await sqlite3.installOpfsSAHPoolVfs({
    name: "open-bible-pool",
    directory: POOL_DIR,
    initialCapacity: 8,
  })
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
      getConn(req.path) // creates the file if missing
      return {}

    case "importDb": {
      await ensureInit()
      const p = fullPath(req.path)
      // Close any open handle before overwriting the file bytes.
      const existing = conns.get(p)
      if (existing) { existing.close(); conns.delete(p) }
      await pool.importDb(p, new Uint8Array(req.bytes))
      return {}
    }

    case "removeDb": {
      await ensureInit()
      const p = fullPath(req.path)
      const existing = conns.get(p)
      if (existing) { existing.close(); conns.delete(p) }
      // unlink removes the file from the pool
      pool.unlink ? pool.unlink(p) : pool.wipeFiles && null
      if (pool.unlink) pool.unlink(p)
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
```

> Note on `removeDb`: the SAHPool util exposes `unlink(path)` in current builds. The double-guard above is defensive; the implementer should confirm `pool.unlink` exists in the installed version (`Object.keys(pool)` in the worker during Task 12 verification) and simplify to a single `pool.unlink(p)` call.

- [ ] **Step 2: Verify the file is served (after Task 4 wiring, re-checked in Task 12)**

No standalone run yet — the worker is exercised once `DatabaseManager` (Task 4) posts messages. Proceed to commit; runtime verification happens in Task 12.

- [ ] **Step 3: Commit**

```bash
git add public/sqlite-wasm/open-bible.worker.js
git commit -m "feat(database): add SQLite worker with OPFS SAHPool VFS"
```

---

## Task 4: DatabaseManager (main-thread RPC client)

**Files:**
- Create: `lib/database/DatabaseManager.ts`

- [ ] **Step 1: Implement DatabaseManager**

Create `lib/database/DatabaseManager.ts`:
```ts
import type { SqlMethod, WorkerRequest, WorkerResponse } from "./worker-types"

const WORKER_URL = "/sqlite-wasm/open-bible.worker.js"
const USER_DB = "app.db"

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

  /** Idempotent. Boots the worker + SAHPool VFS and ensures app.db exists. */
  async initialize(): Promise<void> {
    if (this.initialized) return
    if (this.initPromise) return this.initPromise
    this.initPromise = (async () => {
      if (typeof window === "undefined") throw new Error("DatabaseManager is client-only")
      this.worker = new Worker(WORKER_URL, { type: "module" })
      this.worker.addEventListener("message", this.onMessage)
      await this.rpc({ type: "init" })
      await this.rpc({ type: "open", path: USER_DB })
      this.initialized = true
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
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add lib/database/DatabaseManager.ts
git commit -m "feat(database): add DatabaseManager RPC client"
```

---

## Task 5: User schema (Drizzle) — notes + note_references

**Files:**
- Create: `lib/database/user/schema.ts`

- [ ] **Step 1: Define the Drizzle schema**

Create `lib/database/user/schema.ts`:
```ts
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core"
import { relations } from "drizzle-orm"

/**
 * notes — a user study/comment/annotation. NOT bound to a single verse;
 * verse links live in note_references. Soft-deletable for future sync.
 */
export const notes = sqliteTable("notes", {
  id: text("id").primaryKey(),
  title: text("title"),
  content: text("content").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
})

/**
 * note_references — N Bible references per note (cross-version, ranges allowed).
 */
export const noteReferences = sqliteTable(
  "note_references",
  {
    id: text("id").primaryKey(),
    noteId: text("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    bible: text("bible").notNull(), // version id, e.g. "ara"
    book: text("book").notNull(), // app string book id, e.g. "jhn"
    chapter: integer("chapter").notNull(),
    verseStart: integer("verse_start").notNull(),
    verseEnd: integer("verse_end"), // null = single verse
    order: integer("order").notNull().default(0),
  },
  (t) => [index("idx_note_references_note_id").on(t.noteId)]
)

export const notesRelations = relations(notes, ({ many }) => ({
  references: many(noteReferences),
}))

export const noteReferencesRelations = relations(noteReferences, ({ one }) => ({
  note: one(notes, { fields: [noteReferences.noteId], references: [notes.id] }),
}))

export type Note = typeof notes.$inferSelect
export type NewNote = typeof notes.$inferInsert
export type NoteReference = typeof noteReferences.$inferSelect
export type NewNoteReference = typeof noteReferences.$inferInsert
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add lib/database/user/schema.ts
git commit -m "feat(database): add Drizzle user schema (notes, note_references)"
```

---

## Task 6: Migrations (dev config + embedded SQL + runtime migrator)

**Files:**
- Create: `drizzle.config.ts`
- Create: `lib/database/user/migrations/index.ts`
- Create: `lib/database/user/migrator.ts`

- [ ] **Step 1: Add drizzle-kit config (dev-only, for regenerating SQL)**

Create `drizzle.config.ts`:
```ts
import { defineConfig } from "drizzle-kit"

// Dev-only: `npx drizzle-kit generate` produces SQL we hand-embed into
// lib/database/user/migrations/index.ts (the browser has no filesystem).
export default defineConfig({
  dialect: "sqlite",
  schema: "./lib/database/user/schema.ts",
  out: "./lib/database/user/migrations/sql",
})
```

- [ ] **Step 2: Generate the SQL and confirm it matches the embedded migration**

Run:
```bash
npx drizzle-kit generate --name init
cat lib/database/user/migrations/sql/*.sql
```
Expected: SQL creating `notes`, `note_references`, and the `idx_note_references_note_id` index. Compare it against the embedded SQL in Step 3 and reconcile any difference (column order/types) by editing Step 3's strings to match the generated output exactly.

- [ ] **Step 3: Embed migrations as a browser-safe module**

Create `lib/database/user/migrations/index.ts`:
```ts
// Embedded migrations. The browser has no filesystem, so generated SQL is
// inlined here. To add a migration: run `npx drizzle-kit generate --name <x>`,
// then append a new entry with a unique, monotonic `tag`.
export interface Migration {
  tag: string
  statements: string[]
}

export const MIGRATIONS: Migration[] = [
  {
    tag: "0000_init",
    statements: [
      `CREATE TABLE IF NOT EXISTS notes (
        id text PRIMARY KEY NOT NULL,
        title text,
        content text DEFAULT '' NOT NULL,
        created_at integer NOT NULL,
        updated_at integer NOT NULL,
        deleted_at integer
      )`,
      `CREATE TABLE IF NOT EXISTS note_references (
        id text PRIMARY KEY NOT NULL,
        note_id text NOT NULL,
        bible text NOT NULL,
        book text NOT NULL,
        chapter integer NOT NULL,
        verse_start integer NOT NULL,
        verse_end integer,
        "order" integer DEFAULT 0 NOT NULL,
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE cascade
      )`,
      `CREATE INDEX IF NOT EXISTS idx_note_references_note_id ON note_references (note_id)`,
    ],
  },
]
```

- [ ] **Step 4: Write the runtime migrator**

Create `lib/database/user/migrator.ts`:
```ts
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
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 6: Commit**

```bash
git add drizzle.config.ts lib/database/user/migrations lib/database/user/migrator.ts
git commit -m "feat(database): add user migrations and runtime migrator"
```

---

## Task 7: Drizzle connection (sqlite-proxy → worker)

**Files:**
- Create: `lib/database/user/drizzle.ts`

- [ ] **Step 1: Bind Drizzle to app.db through the proxy driver**

Create `lib/database/user/drizzle.ts`:
```ts
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
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add lib/database/user/drizzle.ts
git commit -m "feat(database): connect Drizzle to app.db via sqlite-proxy"
```

---

## Task 8: Repositories (notes + note_references)

**Files:**
- Create: `lib/database/user/repositories/notesRepository.ts`
- Create: `lib/database/user/repositories/noteReferencesRepository.ts`

- [ ] **Step 1: Notes repository**

Create `lib/database/user/repositories/notesRepository.ts`:
```ts
import { eq, isNull, desc, and } from "drizzle-orm"
import type { UserDb } from "../drizzle"
import { notes, type Note, type NewNote } from "../schema"

function uuid(): string {
  return crypto.randomUUID()
}

export function notesRepository(db: UserDb) {
  return {
    async create(input: { title?: string | null; content?: string }): Promise<Note> {
      const now = new Date()
      const row: NewNote = {
        id: uuid(),
        title: input.title ?? null,
        content: input.content ?? "",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      }
      await db.insert(notes).values(row)
      return row as Note
    },

    async update(id: string, patch: { title?: string | null; content?: string }): Promise<void> {
      await db
        .update(notes)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(notes.id, id))
    },

    /** Soft delete (sets deleted_at) — preserves data for future sync. */
    async delete(id: string): Promise<void> {
      await db.update(notes).set({ deletedAt: new Date() }).where(eq(notes.id, id))
    },

    async findById(id: string): Promise<Note | null> {
      const rows = await db
        .select()
        .from(notes)
        .where(and(eq(notes.id, id), isNull(notes.deletedAt)))
      return rows[0] ?? null
    },

    async list(): Promise<Note[]> {
      return db
        .select()
        .from(notes)
        .where(isNull(notes.deletedAt))
        .orderBy(desc(notes.updatedAt))
    },
  }
}
```

- [ ] **Step 2: Note references repository**

Create `lib/database/user/repositories/noteReferencesRepository.ts`:
```ts
import { eq, asc } from "drizzle-orm"
import type { UserDb } from "../drizzle"
import { noteReferences, type NoteReference, type NewNoteReference } from "../schema"

function uuid(): string {
  return crypto.randomUUID()
}

export function noteReferencesRepository(db: UserDb) {
  return {
    async add(input: Omit<NewNoteReference, "id">): Promise<NoteReference> {
      const row: NewNoteReference = { id: uuid(), ...input }
      await db.insert(noteReferences).values(row)
      return row as NoteReference
    },

    async listByNote(noteId: string): Promise<NoteReference[]> {
      return db
        .select()
        .from(noteReferences)
        .where(eq(noteReferences.noteId, noteId))
        .orderBy(asc(noteReferences.order))
    },

    async remove(id: string): Promise<void> {
      await db.delete(noteReferences).where(eq(noteReferences.id, id))
    },

    async removeByNote(noteId: string): Promise<void> {
      await db.delete(noteReferences).where(eq(noteReferences.noteId, noteId))
    },
  }
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add lib/database/user/repositories
git commit -m "feat(database): add notes and note_references repositories"
```

---

## Task 9: BibleDatabase (read-only query layer)

**Files:**
- Create: `lib/database/bible/book-meta.ts`
- Create: `lib/database/bible/BibleDatabase.ts`

- [ ] **Step 1: Extract the integer→string book id mapping**

The source SQLite uses integer `book.id` (1-66). The app uses string ids (`"gen"`, `"jhn"`, …). This is the same `BOOK_META` array already in `scripts/import-bibles.mjs` (index 0 = `null`). Copy all 66 entries verbatim from `scripts/import-bibles.mjs` (lines 15-82) into TypeScript.

Create `lib/database/bible/book-meta.ts`:
```ts
import type { Testament } from "@/lib/types"

export interface BookMetaEntry {
  id: string
  name: string
  abbreviation: string
}

// Index = integer book id from the source SQLite (1-66). Index 0 is null.
// Copied verbatim from scripts/import-bibles.mjs BOOK_META.
export const BOOK_META: (BookMetaEntry | null)[] = [
  null,
  { id: "gen", name: "Gênesis", abbreviation: "Gn" },
  // ... PASTE all 66 entries from scripts/import-bibles.mjs lines 17-82 ...
  { id: "rev", name: "Apocalipse", abbreviation: "Ap" },
]

// Reverse map: string id → integer id.
export const BOOK_ID_TO_INT: Record<string, number> = (() => {
  const m: Record<string, number> = {}
  BOOK_META.forEach((b, i) => { if (b) m[b.id] = i })
  return m
})()

// Protestant 66-book canon: ids 1-39 are Old Testament, 40-66 New Testament.
export function testamentForBookInt(bookInt: number): Testament {
  return bookInt <= 39 ? "old" : "new"
}
```

> The implementer MUST copy all 66 entries — do not leave the `...` placeholder. Run `sed -n '15,82p' scripts/import-bibles.mjs` to get the exact list.

- [ ] **Step 2: Implement BibleDatabase**

Create `lib/database/bible/BibleDatabase.ts`:
```ts
import type { DatabaseManager } from "../DatabaseManager"
import type { Book, Verse } from "@/lib/types"
import { BOOK_META, BOOK_ID_TO_INT, testamentForBookInt } from "./book-meta"

interface VerseRow {
  chapter: number
  verse: number
  text: string
}

/**
 * Read-only query layer over an installed Bible SQLite file (e.g. ara.db).
 * Translates between the source integer book ids and the app's string ids.
 * Never mutates the Bible — it is a public read-only package.
 */
export class BibleDatabase {
  constructor(
    private manager: DatabaseManager,
    private dbPath: string,
    private versionId: string
  ) {}

  /** Display name from the Bible's own metadata table. */
  async name(): Promise<string> {
    const rows = await this.manager.exec(
      this.dbPath,
      `SELECT value FROM metadata WHERE key = 'name' LIMIT 1`,
      [],
      "all"
    )
    return (rows[0] as unknown[])?.[0] as string ?? this.versionId
  }

  /** All books, in app shape, with chapter counts. */
  async getBooks(): Promise<Book[]> {
    const rows = (await this.manager.exec(
      this.dbPath,
      `SELECT b.id, MAX(v.chapter) AS chapters
         FROM book b JOIN verse v ON v.book_id = b.id
        GROUP BY b.id ORDER BY b.id`,
      [],
      "all"
    )) as unknown[][]
    const books: Book[] = []
    for (const [bookInt, chapters] of rows as [number, number][]) {
      const meta = BOOK_META[bookInt]
      if (!meta) continue
      books.push({
        id: meta.id,
        name: meta.name,
        abbreviation: meta.abbreviation,
        testament: testamentForBookInt(bookInt),
        chapters,
      })
    }
    return books
  }

  /** Verses for a chapter, keyed by the app's string book id. */
  async getChapterVerses(bookId: string, chapter: number): Promise<Verse[]> {
    const bookInt = BOOK_ID_TO_INT[bookId]
    if (!bookInt) return []
    const rows = (await this.manager.exec(
      this.dbPath,
      `SELECT chapter, verse, text FROM verse
        WHERE book_id = ? AND chapter = ? ORDER BY verse`,
      [bookInt, chapter],
      "all"
    )) as unknown[][]
    return rows.map(([ch, vn, text]) => ({
      id: `${bookId}-${chapter}-${vn as number}`,
      bookId,
      chapter: ch as number,
      verse: vn as number,
      text: text as string,
    }))
  }

  /** Case-insensitive substring search (parity with current LIKE behaviour). */
  async search(query: string, limit = 100): Promise<Verse[]> {
    const rows = (await this.manager.exec(
      this.dbPath,
      `SELECT book_id, chapter, verse, text FROM verse
        WHERE text LIKE ? COLLATE NOCASE ORDER BY book_id, chapter, verse LIMIT ?`,
      [`%${query}%`, limit],
      "all"
    )) as unknown[][]
    return rows.flatMap(([bookInt, ch, vn, text]) => {
      const meta = BOOK_META[bookInt as number]
      if (!meta) return []
      return [{
        id: `${meta.id}-${ch as number}-${vn as number}`,
        bookId: meta.id,
        chapter: ch as number,
        verse: vn as number,
        text: text as string,
      }]
    })
  }
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add lib/database/bible
git commit -m "feat(database): add BibleDatabase read-only query layer"
```

---

## Task 10: database.ts singleton + facade

**Files:**
- Create: `lib/database/database.ts`

- [ ] **Step 1: Implement the singleton facade**

Create `lib/database/database.ts`:
```ts
import { DatabaseManager } from "./DatabaseManager"
import { createUserDb, type UserDb } from "./user/drizzle"
import { runUserMigrations } from "./user/migrator"
import { notesRepository } from "./user/repositories/notesRepository"
import { noteReferencesRepository } from "./user/repositories/noteReferencesRepository"
import { BibleDatabase } from "./bible/BibleDatabase"

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
  }

  async removeBible(name: string): Promise<void> {
    this.bibles.delete(name)
    await this.manager.removeBible(name)
  }

  listInstalledBibles(): Promise<string[]> {
    return this.manager.listInstalledBibles()
  }
}

// Client-only singleton.
export const database = new Database()
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add lib/database/database.ts
git commit -m "feat(database): add Database singleton facade"
```

---

## Task 11: Verification page (manual, replaces a test runner)

Because the project has no test runner, this page exercises every required capability against real OPFS in the browser.

**Files:**
- Create: `app/database-test/page.tsx`

- [ ] **Step 1: Build the verification page**

Create `app/database-test/page.tsx`:
```tsx
"use client"

import { useState } from "react"
import { database } from "@/lib/database/database"

export default function DatabaseTestPage() {
  const [log, setLog] = useState<string[]>([])
  const add = (m: string) => setLog((l) => [...l, m])

  async function run() {
    setLog([])
    try {
      add("initialize()…")
      await database.initialize()
      add("✓ initialized (app.db created + migrated)")

      // Notes round-trip
      const note = await database.notes.create({ title: "Salvação", content: "Tema de estudo" })
      add(`✓ note created: ${note.id}`)
      await database.noteReferences.add({ noteId: note.id, bible: "ara", book: "jhn", chapter: 3, verseStart: 16, verseEnd: null, order: 0 })
      await database.noteReferences.add({ noteId: note.id, bible: "ara", book: "rom", chapter: 8, verseStart: 1, verseEnd: 4, order: 1 })
      const refs = await database.noteReferences.listByNote(note.id)
      add(`✓ note has ${refs.length} references`)
      await database.notes.update(note.id, { content: "atualizado" })
      const list = await database.notes.list()
      add(`✓ notes list length: ${list.length}`)

      // Bible install + query
      add("installing ara.db…")
      const buf = await fetch("/bibles/ara.db").then((r) => r.arrayBuffer())
      await database.installBible("ara", buf)
      add(`✓ installed bibles: ${(await database.listInstalledBibles()).join(", ")}`)
      const bible = await database.openBible("ara")
      add(`✓ bible name: ${await bible.name()}`)
      const books = await bible.getBooks()
      add(`✓ books: ${books.length} (first: ${books[0]?.name})`)
      const verses = await bible.getChapterVerses("jhn", 3)
      add(`✓ John 3 verses: ${verses.length}; v16: ${verses.find((v) => v.verse === 16)?.text?.slice(0, 40)}…`)

      // Cleanup soft-deleted note
      await database.notes.delete(note.id)
      add(`✓ after soft-delete, notes list: ${(await database.notes.list()).length}`)
      add("ALL CHECKS PASSED")
    } catch (e) {
      add(`✗ ERROR: ${(e as Error).message}`)
    }
  }

  return (
    <div className="p-6 font-mono text-sm">
      <button onClick={run} className="rounded bg-blue-600 px-4 py-2 text-white">Run database checks</button>
      <pre className="mt-4 whitespace-pre-wrap">{log.join("\n")}</pre>
    </div>
  )
}
```

- [ ] **Step 2: Run the dev server and execute the checks**

Run: `pnpm dev`
Then open `http://localhost:3000/database-test`, click **Run database checks**.
Expected: log ends with `ALL CHECKS PASSED`, books = 66, John 3 has 36 verses, v16 starts with "Porque Deus amou…".

- [ ] **Step 3: Confirm OPFS persistence across reload**

Reload the page, click **Run** again.
Expected: still passes; `listInstalledBibles()` shows `ara` immediately (proves OPFS persisted the file).

- [ ] **Step 4: Commit**

```bash
git add app/database-test/page.tsx
git commit -m "test(database): add manual verification page for persistence layer"
```

---

## Task 12: Wire Bible reading to the new layer

Replace the IndexedDB read path in `BibleVersionContext` with `BibleDatabase` for installed versions, keeping the existing API fallback. (Notes UI migration is intentionally deferred per scope.)

**Files:**
- Modify: `lib/bible-version-context.tsx`

- [ ] **Step 1: Initialize the database when the provider mounts**

In `lib/bible-version-context.tsx`, add an import and an init effect. Add near the other imports:
```tsx
import { database } from "./database/database"
```
Inside `BibleVersionProvider`, add after the existing mount effects:
```tsx
  // Boot the local SQLite layer once on mount (client-only).
  useEffect(() => {
    database.initialize().catch(() => { /* ignore — feature-detect failures */ })
  }, [])
```

- [ ] **Step 2: Add a SQLite read branch to getVerses**

In `getVerses` (in `lib/bible-version-context.tsx`), insert a new branch **between** the API branch (step 1) and the IndexedDB branch (step 2), so installed SQLite Bibles are read locally:
```tsx
      // 1.5 Try local SQLite (installed Bible db) before legacy IndexedDB
      try {
        const installed = await database.listInstalledBibles()
        if (installed.includes(versionId)) {
          const bible = await database.openBible(versionId)
          const sqliteVerses = await bible.getChapterVerses(bookId, chapter)
          if (sqliteVerses.length > 0) return sqliteVerses
        }
      } catch { /* fall through to legacy paths */ }
```
(Leave the existing IndexedDB and mock fallbacks in place — they remain valid until a later migration removes IndexedDB entirely.)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Manually verify reading from SQLite**

Run: `pnpm dev`
1. Open `/database-test`, click Run (installs `ara.db` into OPFS).
2. Open the main reader (`/`), select a book/chapter that exists in ARA.
Expected: verses render. In DevTools, confirm a request to `/bibles/ara.db` happened once (install) and chapter loads come from the worker (no `/api/bibles` call when offline). Toggle DevTools "Offline" and confirm the chapter still loads.

- [ ] **Step 5: Commit**

```bash
git add lib/bible-version-context.tsx
git commit -m "feat(reader): read installed Bibles from local SQLite layer"
```

---

## Self-Review

**Spec coverage:**
- SQLite WASM + OPFS, no IndexedDB directly → Tasks 1-4 (SAHPool VFS in worker). ✓
- Drizzle ORM for all user persistence → Tasks 5-8. ✓
- DatabaseManager with the exact interface (`initialize`, `installBible`, `openBible`, `openUserDatabase`, `removeBible`, `listInstalledBibles`) → Task 4. **Gap:** spec names `openUserDatabase()`. This plan exposes the user db through `database.notes`/`database.noteReferences` + `manager.userDbPath` instead, since Drizzle owns app.db. **Resolution:** add a thin `openUserDatabase()` returning the `UserDb` on the facade — see addendum below.
- `app.db` auto-created on first run → Tasks 4 + 6 + 10 (`initialize` opens + migrates). ✓
- `notes` + `note_references` (1→N, multi-reference, ranges, order, soft delete) → Tasks 5, 8, verified in Task 11. ✓
- Import `ara.db`, register, open, query, read-only, unchanged structure → Tasks 9-12. ✓
- `database.openBible("ara")` + `bible.query(...)` equivalent → Task 9 (`getChapterVerses`/`search`/`getBooks`). ✓
- Architecture ready for future tables (bookmarks, highlights, …) without implementing them → folder structure + migrations array make adding a table a schema edit + new migration entry. ✓
- No sync now, but only app.db would sync later; Bibles never sync → soft-delete + timestamps on user tables; Bibles opened read-only. ✓
- Works for Next.js now, minimal changes for Tauri later → static worker + standard SQLite files; Tauri can swap the VFS/driver behind `DatabaseManager`. ✓

**Addendum (resolves the `openUserDatabase` gap) — fold into Task 10, Step 1:** add this method to the `Database` class:
```ts
  /** Direct access to the Drizzle user db (app.db). */
  openUserDatabase(): UserDb {
    return this.requireUserDb()
  }
```

**Placeholder scan:** The only intentional placeholder is the 66-entry `BOOK_META` paste in Task 9 Step 1, explicitly flagged with the exact `sed` command to obtain it. No "TODO"/"add error handling"/vague steps remain.

**Type consistency:** `manager.exec(dbPath, sql, params, method)` signature is identical across DatabaseManager (Task 4), drizzle proxy (Task 7), migrator (Task 6), and BibleDatabase (Task 9). `UserDb` type flows from Task 7 → 8 → 10. `Book`/`Verse`/`Testament` reuse `@/lib/types`. Repository method names match the spec (`create`/`update`/`delete`/`findById`/`list`).
