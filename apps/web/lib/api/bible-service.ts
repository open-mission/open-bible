import { turso } from "@/lib/turso"
import type { Version, VersionDetail, Verse } from "./schemas"

const CACHE_TTL = 5 * 60 * 1000

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<unknown>>()

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

function setCache<T>(key: string, data: T) {
  cache.set(key, { data, timestamp: Date.now() })
}

async function queryCached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const cached = getCached<T>(key)
  if (cached) return cached
  const data = await fn()
  setCache(key, data)
  return data
}

export async function listVersions(): Promise<Version[]> {
  return queryCached("versions", async () => {
    const result = await turso.execute(
      "SELECT id, name, total_books FROM bible_versions ORDER BY id"
    )
    return result.rows.map((row: [string, string, number]) => ({
      id: row[0],
      name: row[1],
      totalBooks: row[2],
    }))
  })
}

export async function getVersionDetail(versionId: string): Promise<VersionDetail | null> {
  return queryCached(`version:${versionId}`, async () => {
    const verResult = await turso.execute(
      "SELECT id, name, total_books FROM bible_versions WHERE id = ?",
      [versionId]
    )
    if (verResult.rows.length === 0) return null

    const booksResult = await turso.execute(
      "SELECT id, name, abbreviation, testament, chapters FROM bible_books WHERE version_id = ? ORDER BY rowid",
      [versionId]
    )

    const totalBooks = verResult.rows[0][2] as number
    const books = booksResult.rows.map((row: [string, string, string, string, number]) => ({
      id: row[0],
      name: row[1],
      abbreviation: row[2],
      testament: row[3] as "old" | "new",
      chapters: row[4],
    }))

    // Warn when version exists but has no books in bible_books table
    const warning = books.length === 0 && totalBooks > 0
      ? `Version ${versionId} exists in bible_versions (${totalBooks} books) but has no books in bible_books table. Data may need to be re-imported.`
      : undefined

    return {
      id: verResult.rows[0][0] as string,
      name: verResult.rows[0][1] as string,
      totalBooks,
      books,
      warning,
    }
  })
}

export async function getChapterVerses(
  versionId: string,
  bookId: string,
  chapter: number
): Promise<{ bookName: string; verses: Verse[] } | null> {
  const cacheKey = `chapter:${versionId}:${bookId}:${chapter}`
  return queryCached(cacheKey, async () => {
    const bookResult = await turso.execute(
      "SELECT id, name, chapters FROM bible_books WHERE version_id = ? AND id = ?",
      [versionId, bookId]
    )
    if (bookResult.rows.length === 0) return null

    const bookName = bookResult.rows[0][1] as string
    const maxChapters = bookResult.rows[0][2] as number
    if (chapter < 1 || chapter > maxChapters) return null

    const versesResult = await turso.execute(
      "SELECT book_id, chapter, verse, text FROM bible_verses WHERE version_id = ? AND book_id = ? AND chapter = ? ORDER BY verse",
      [versionId, bookId, chapter]
    )

    return {
      bookName,
      verses: versesResult.rows.map((row: [string, number, number, string]) => ({
        bookId: row[0],
        chapter: row[1],
        verse: row[2],
        text: row[3],
      })),
    }
  })
}

export async function listBooksForVersion(
  versionId: string
): Promise<{ version: string; books: { id: string; name: string; abbreviation: string; testament: "old" | "new"; chapters: number }[] } | null> {
  const detail = await getVersionDetail(versionId)
  if (!detail) return null
  return {
    version: versionId,
    books: detail.books.map((b) => ({
      id: b.id,
      name: b.name,
      abbreviation: b.abbreviation,
      testament: b.testament,
      chapters: b.chapters,
    })),
  }
}

export async function searchVerses(
  versionId: string,
  query: string,
  limit = 50
): Promise<
  | {
      bookName: string
      bookAbbreviation: string
      bookId: string
      chapter: number
      verse: number
      text: string
      reference: string
    }[]
  | null
> {
  const ver = await getVersionDetail(versionId)
  if (!ver) return null

  const searchKey = `search:${versionId}:${query}:${limit}`
  return queryCached(searchKey, async () => {
    const result = await turso.execute(
      `SELECT v.book_id, v.chapter, v.verse, v.text, b.name, b.abbreviation
       FROM bible_verses v
       JOIN bible_books b ON v.book_id = b.id AND v.version_id = b.version_id
       WHERE v.version_id = ? AND v.text LIKE ? COLLATE NOCASE
       LIMIT ?`,
      [versionId, `%${query}%`, limit]
    )

    return result.rows.map((row: [string, number, number, string, string, string]) => ({
      bookId: row[0],
      chapter: row[1],
      verse: row[2],
      text: row[3],
      bookName: row[4],
      bookAbbreviation: row[5],
      reference: `${row[5]} ${row[1]}:${row[2]}`,
    }))
  })
}
