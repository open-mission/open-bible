import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"
import * as os from "node:os"
import Database from "better-sqlite3"
import { BibleManager, validateDbFile } from "../src/db/bible-manager.js"
import { InstalledStore } from "../src/db/installed-store.js"

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "tui-test-"))
}

function createFakeBible(dbPath: string) {
  const db = new Database(dbPath)
  db.exec(`
    CREATE TABLE book (id INTEGER PRIMARY KEY);
    CREATE TABLE verse (book_id INTEGER, chapter INTEGER, verse INTEGER, text TEXT);
    CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT);
  `)
  db.exec(`INSERT INTO book (id) VALUES (1), (2)`)
  db.exec(`INSERT INTO metadata (key, value) VALUES ('name', 'Fake Bible')`)
  const stmt = db.prepare(`INSERT INTO verse (book_id, chapter, verse, text) VALUES (?, ?, ?, ?)`)
  // gen 1: 3 verses, gen 2: 2 verses, exo 1: 1 verse
  stmt.run(1, 1, 1, "No princípio criou Deus os céus e a terra.")
  stmt.run(1, 1, 2, "E a terra era sem forma e vazia.")
  stmt.run(1, 1, 3, "E disse Deus: Haja luz; e houve luz.")
  stmt.run(1, 2, 1, "Cap 2 verso 1")
  stmt.run(1, 2, 2, "Cap 2 verso 2")
  stmt.run(2, 1, 1, "Êxodo cap 1 verso 1 texto de amor")
  db.close()
}

let tmp: string
let manager: BibleManager

beforeAll(() => {
  tmp = makeTmpDir()
  process.env.OPEN_BIBLE_DATA_DIR = tmp
  const biblesDir = path.join(tmp, "bibles")
  fs.mkdirSync(biblesDir, { recursive: true })
  createFakeBible(path.join(biblesDir, "ara.db"))
  manager = new BibleManager()
})

afterAll(() => {
  manager.close()
  fs.rmSync(tmp, { recursive: true, force: true })
  delete process.env.OPEN_BIBLE_DATA_DIR
})

describe("BibleManager", () => {
  it("SPECSFY: AC-001 getBooks retorna livros com chapters corretos", () => {
    const books = manager.getBooks("ara")
    expect(books.length).toBe(2)
    const gen = books.find(b => b.id === "gen")
    expect(gen).toBeDefined()
    expect(gen!.chapters).toBe(2)
    expect(gen!.name).toBe("Gênesis")
    const exo = books.find(b => b.id === "exo")
    expect(exo!.chapters).toBe(1)
  })

  it("SPECSFY: AC-001 getChapterVerses retorna versículos ordenados", () => {
    const verses = manager.getChapterVerses("ara", "gen", 1)
    expect(verses.length).toBe(3)
    expect(verses[0].verse).toBe(1)
    expect(verses[0].text).toContain("No princípio")
    expect(verses[2].verse).toBe(3)
  })

  it("SPECSFY: AC-002 livro inválido retorna vazio sem throw", () => {
    const verses = manager.getChapterVerses("ara", "zzz", 1)
    expect(verses).toEqual([])
  })

  it("SPECSFY: AC-002 capítulo inexistente retorna vazio", () => {
    const verses = manager.getChapterVerses("ara", "gen", 999)
    expect(verses).toEqual([])
  })

  it("SPECSFY: AC-002 versão não instalada retorna vazio", () => {
    const books = manager.getBooks("nvi")
    expect(books).toEqual([])
    const verses = manager.getChapterVerses("nvi", "gen", 1)
    expect(verses).toEqual([])
  })

  it("SPECSFY: AC-005 search LIKE case-insensitive", () => {
    const results = manager.search("ara", "amor", 10)
    expect(results.length).toBe(1)
    expect(results[0].text).toContain("amor")
    const upper = manager.search("ara", "AMOR", 10)
    expect(upper.length).toBe(1)
  })

  it("SPECSFY: search com limite", () => {
    const results = manager.search("ara", "a", 2)
    expect(results.length).toBeLessThanOrEqual(2)
  })

  it("SPECSFY: AC-006 driver nativo - arquivo validado e sem wasm", async () => {
    const p = path.join(tmp, "bibles", "ara.db")
    expect(validateDbFile(p)).toBe(true)
    const src = fs.readFileSync("src/db/bible-manager.ts", "utf-8")
    expect(src).toContain("better-sqlite3")
    expect(src).not.toContain("sqlite-wasm")
    expect(src).not.toContain("OPFS")
  })
})
