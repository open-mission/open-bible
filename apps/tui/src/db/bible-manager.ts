import * as fs from "node:fs"
import { BOOK_META, BOOK_ID_TO_INT, testamentForBookInt } from "../lib/book-meta.js"
import { biblePath } from "./paths.js"
import { openReadOnly, type SqliteDb } from "./sqlite.js"

export interface Book {
  id: string
  name: string
  abbreviation: string
  testament: "old" | "new"
  chapters: number
}

export interface Verse {
  id: string
  bookId: string
  chapter: number
  verse: number
  text: string
}

const SQLITE_HEADER = Buffer.from("SQLite format 3\0")

export function validateDbFile(filePath: string): boolean {
  try {
    const fd = fs.openSync(filePath, "r")
    const buf = Buffer.alloc(16)
    fs.readSync(fd, buf, 0, 16, 0)
    fs.closeSync(fd)
    return buf.equals(SQLITE_HEADER)
  } catch {
    return false
  }
}

export class BibleManager {
  private cache = new Map<string, SqliteDb>()

  private openDb(versionId: string): SqliteDb | null {
    const p = biblePath(versionId)
    if (!fs.existsSync(p)) return null
    if (this.cache.has(versionId)) return this.cache.get(versionId)!
    if (!validateDbFile(p)) return null
    try {
      const db = openReadOnly(p)
      this.cache.set(versionId, db)
      return db
    } catch {
      return null
    }
  }

  close(): void {
    for (const db of this.cache.values()) {
      try { db.close() } catch {}
    }
    this.cache.clear()
  }

  getBooks(versionId: string): Book[] {
    const db = this.openDb(versionId)
    if (!db) return []
    const rows = db.prepare(
      `SELECT b.id, MAX(v.chapter) AS chapters
       FROM book b JOIN verse v ON v.book_id = b.id
       GROUP BY b.id ORDER BY b.id`
    ).all() as { id: number; chapters: number }[]
    const books: Book[] = []
    for (const row of rows) {
      const meta = BOOK_META[row.id]
      if (!meta) continue
      books.push({
        id: meta.id,
        name: meta.name,
        abbreviation: meta.abbreviation,
        testament: testamentForBookInt(row.id),
        chapters: row.chapters,
      })
    }
    return books
  }

  getChapterVerses(versionId: string, bookId: string, chapter: number): Verse[] {
    const bookInt = BOOK_ID_TO_INT[bookId]
    if (!bookInt) return []
    const db = this.openDb(versionId)
    if (!db) return []
    const rows = db.prepare(
      `SELECT chapter, verse, text FROM verse WHERE book_id = ? AND chapter = ? ORDER BY verse`
    ).all(bookInt, chapter) as { chapter: number; verse: number; text: string }[]
    return rows.map(r => ({
      id: `${bookId}-${r.chapter}-${r.verse}`,
      bookId,
      chapter: r.chapter,
      verse: r.verse,
      text: r.text,
    }))
  }

  search(versionId: string, query: string, limit = 50): Verse[] {
    const db = this.openDb(versionId)
    if (!db) return []
    if (!query.trim()) return []
    const rows = db.prepare(
      `SELECT book_id, chapter, verse, text FROM verse WHERE text LIKE ? COLLATE NOCASE ORDER BY book_id, chapter, verse LIMIT ?`
    ).all(`%${query}%`, limit) as { book_id: number; chapter: number; verse: number; text: string }[]
    const verses: Verse[] = []
    for (const r of rows) {
      const meta = BOOK_META[r.book_id]
      if (!meta) continue
      verses.push({
        id: `${meta.id}-${r.chapter}-${r.verse}`,
        bookId: meta.id,
        chapter: r.chapter,
        verse: r.verse,
        text: r.text,
      })
    }
    return verses
  }

  getBibleName(versionId: string): string | null {
    const db = this.openDb(versionId)
    if (!db) return null
    try {
      const row = db.prepare(`SELECT value FROM metadata WHERE key = 'name' LIMIT 1`).get() as { value: string } | undefined
      return row?.value ?? versionId
    } catch {
      return versionId
    }
  }
}
