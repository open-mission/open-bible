import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"
import * as os from "node:os"
import * as zlib from "node:zlib"
import Database from "better-sqlite3"
import { downloadBible, removeBible } from "../src/services/download.js"
import { InstalledStore } from "../src/db/installed-store.js"

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "tui-download-test-"))
}

function createFakeBibleBuffer(): Buffer {
  const tmpFile = path.join(os.tmpdir(), `tmp-bible-${Date.now()}.db`)
  const db = new Database(tmpFile)
  db.exec(`CREATE TABLE book (id INTEGER PRIMARY KEY); CREATE TABLE verse (book_id INTEGER, chapter INTEGER, verse INTEGER, text TEXT); CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT);`)
  db.exec(`INSERT INTO book (id) VALUES (1)`)
  db.exec(`INSERT INTO metadata (key, value) VALUES ('name', 'Test Bible')`)
  db.prepare(`INSERT INTO verse (book_id, chapter, verse, text) VALUES (?, ?, ?, ?)`).run(1, 1, 1, "Texto 1")
  db.close()
  const buf = fs.readFileSync(tmpFile)
  fs.rmSync(tmpFile, { force: true })
  return buf
}

let tmp: string

beforeEach(() => {
  tmp = makeTmpDir()
  process.env.OPEN_BIBLE_DATA_DIR = tmp
})

afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true })
  delete process.env.OPEN_BIBLE_DATA_DIR
  vi.restoreAllMocks()
})

describe("download", () => {
  it("SPECSFY: AC-003 download gzip válido cria db e registro", async () => {
    const sqliteBuf = createFakeBibleBuffer()
    const gz = zlib.gzipSync(sqliteBuf)
     
    const mockFetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      statusText: "OK",
      arrayBuffer: async () => gz.buffer.slice(gz.byteOffset, gz.byteOffset + gz.byteLength),
    } as any))

    await downloadBible("ara", { fetchImpl: mockFetch as any })

    const dest = path.join(tmp, "bibles", "ara.db")
    expect(fs.existsSync(dest)).toBe(true)
    const store = new InstalledStore()
    const entry = store.get("ara")
    store.close()
    expect(entry).not.toBeNull()
    expect(entry!.id).toBe("ara")
  })

  it("SPECSFY: AC-004 falha de rede não cria arquivo nem registro", async () => {
    const mockFetch = vi.fn(async () => ({
      ok: false,
      status: 404,
      statusText: "Not Found",
      arrayBuffer: async () => new ArrayBuffer(0),
    } as any))
    await expect(downloadBible("nvi", { fetchImpl: mockFetch as any })).rejects.toThrow()
    expect(fs.existsSync(path.join(tmp, "bibles", "nvi.db"))).toBe(false)
    const store = new InstalledStore()
    expect(store.get("nvi")).toBeNull()
    store.close()
  })

  it("SPECSFY: AC-004 gzip corrompido não deixa arquivo parcial", async () => {
    const bad = Buffer.from("not a gzip nor sqlite")
     
    const mockFetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      statusText: "OK",
      arrayBuffer: async () => bad.buffer.slice(bad.byteOffset, bad.byteOffset + bad.byteLength),
    } as any))
    await expect(downloadBible("bad", { fetchImpl: mockFetch as any })).rejects.toThrow()
    expect(fs.existsSync(path.join(tmp, "bibles", "bad.db"))).toBe(false)
    expect(fs.existsSync(path.join(tmp, "bibles", "bad.db.tmp"))).toBe(false)
  })

  it("SPECSFY: AC-004 reinstalação sobrescreve atomicamente", async () => {
    const sqliteBuf = createFakeBibleBuffer()
    const gz = zlib.gzipSync(sqliteBuf)
     
    const mockFetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      statusText: "OK",
      arrayBuffer: async () => gz.buffer.slice(gz.byteOffset, gz.byteOffset + gz.byteLength),
    } as any))
    await downloadBible("ara", { fetchImpl: mockFetch as any })
    await downloadBible("ara", { fetchImpl: mockFetch as any })
    expect(fs.existsSync(path.join(tmp, "bibles", "ara.db"))).toBe(true)
  })

  it("SPECSFY: AC-005 remove apaga arquivo e registro", async () => {
    const sqliteBuf = createFakeBibleBuffer()
    const gz = zlib.gzipSync(sqliteBuf)
     
    const mockFetch = vi.fn(async () => ({
      ok: true, status: 200, statusText: "OK",
      arrayBuffer: async () => gz.buffer.slice(gz.byteOffset, gz.byteOffset + gz.byteLength),
    } as any))
    await downloadBible("ara", { fetchImpl: mockFetch as any })
    const ok = await removeBible("ara")
    expect(ok).toBe(true)
    expect(fs.existsSync(path.join(tmp, "bibles", "ara.db"))).toBe(false)
    const store = new InstalledStore()
    expect(store.get("ara")).toBeNull()
    store.close()
  })
})
