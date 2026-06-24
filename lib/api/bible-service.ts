import { readFile } from "fs/promises"
import { join } from "path"
import type { Version, VersionDetail, Verse } from "./schemas"

const DATA_DIR = join(process.cwd(), "public", "data", "bibles")
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

async function readJSON<T>(relativePath: string): Promise<T> {
  const cached = getCached<T>(relativePath)
  if (cached) return cached

  const filePath = join(DATA_DIR, relativePath)
  const content = await readFile(filePath, "utf-8")
  const data = JSON.parse(content) as T
  setCache(relativePath, data)
  return data
}

interface IndexEntry {
  id: string
  name: string
  totalBooks: number
}

interface RawBookMeta {
  id: string
  name: string
  abbreviation: string
  testament: "old" | "new"
  chapters: number
  chapterVerseCounts: number[]
}

interface RawChapterVerse {
  bookId: string
  chapter: number
  verse: number
  text: string
}

export async function listVersions(): Promise<Version[]> {
  return readJSON<IndexEntry[]>("index.json")
}

export async function getVersionDetail(versionId: string): Promise<VersionDetail | null> {
  try {
    const meta = await readJSON<{
      id: string
      name: string
      totalBooks: number
      books: RawBookMeta[]
    }>(`${versionId}/meta.json`)

    return {
      id: meta.id,
      name: meta.name,
      totalBooks: meta.totalBooks,
      books: meta.books.map((b) => ({
        id: b.id,
        name: b.name,
        abbreviation: b.abbreviation,
        testament: b.testament,
        chapters: b.chapters,
      })),
    }
  } catch {
    return null
  }
}

export async function getChapterVerses(
  versionId: string,
  bookId: string,
  chapter: number
): Promise<{ bookName: string; verses: Verse[] } | null> {
  try {
    const meta = await getVersionDetail(versionId)
    if (!meta) return null

    const book = meta.books.find((b) => b.id === bookId)
    if (!book) return null
    if (chapter < 1 || chapter > book.chapters) return null

    const chapterFile = `${versionId}/${bookId}-${chapter}.json`
    const rawVerses = await readJSON<RawChapterVerse[]>(chapterFile)

    return {
      bookName: book.name,
      verses: rawVerses.map((v) => ({
        bookId: v.bookId,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text,
      })),
    }
  } catch {
    return null
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
  try {
    const meta = await getVersionDetail(versionId)
    if (!meta) return null

    const lowerQuery = query.toLowerCase()
    const results: {
      bookName: string
      bookAbbreviation: string
      bookId: string
      chapter: number
      verse: number
      text: string
      reference: string
    }[] = []

    const fileQueue: { book: (typeof meta.books)[0]; chapter: number }[] = []
    for (const book of meta.books) {
      for (let ch = 1; ch <= book.chapters; ch++) {
        fileQueue.push({ book, chapter: ch })
      }
    }

    const BATCH_SIZE = 20
    for (let i = 0; i < fileQueue.length && results.length < limit; i += BATCH_SIZE) {
      const batch = fileQueue.slice(i, i + BATCH_SIZE)
      const batchResults = await Promise.allSettled(
        batch.map(async ({ book, chapter }) => {
          const chapterFile = `${versionId}/${book.id}-${chapter}.json`
          const verses = await readJSON<RawChapterVerse[]>(chapterFile)
          const bookName = book.name
          const bookAbbreviation = book.abbreviation

          return verses
            .filter((v) => v.text.toLowerCase().includes(lowerQuery))
            .map((v) => ({
              bookName,
              bookAbbreviation,
              bookId: v.bookId,
              chapter: v.chapter,
              verse: v.verse,
              text: v.text,
              reference: `${bookAbbreviation} ${chapter}:${v.verse}`,
            }))
        })
      )

      for (const result of batchResults) {
        if (result.status === "fulfilled") {
          for (const item of result.value) {
            if (results.length < limit) {
              results.push(item)
            } else {
              break
            }
          }
        }
        if (results.length >= limit) break
      }
    }

    return results
  } catch {
    return null
  }
}
