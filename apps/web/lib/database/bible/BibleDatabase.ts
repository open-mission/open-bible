import type { DatabaseManager } from "../DatabaseManager"
import type { Book, Verse } from "@/lib/types"
import { BOOK_META, BOOK_ID_TO_INT, testamentForBookInt } from "./book-meta"

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
