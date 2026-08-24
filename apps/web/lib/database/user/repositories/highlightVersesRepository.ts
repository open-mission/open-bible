import { eq, and } from "drizzle-orm"
import type { UserDb } from "../drizzle"
import { highlightVerses, type HighlightVerse, type NewHighlightVerse } from "../schema"

function uuid(): string {
  return crypto.randomUUID()
}

export function highlightVersesRepository(db: UserDb) {
  return {
    async add(input: Omit<NewHighlightVerse, "id">): Promise<HighlightVerse> {
      const row: NewHighlightVerse = { id: uuid(), ...input }
      await db.insert(highlightVerses).values(row)
      return row as HighlightVerse
    },

    async removeByHighlight(highlightId: string): Promise<void> {
      await db
        .delete(highlightVerses)
        .where(eq(highlightVerses.highlightId, highlightId))
    },

    async findByHighlightId(highlightId: string): Promise<HighlightVerse[]> {
      return db
        .select()
        .from(highlightVerses)
        .where(eq(highlightVerses.highlightId, highlightId))
    },

    async listByChapter(book: string, chapter: number, bible: string): Promise<HighlightVerse[]> {
      return db
        .select()
        .from(highlightVerses)
        .where(
          and(
            eq(highlightVerses.book, book),
            eq(highlightVerses.chapter, chapter),
            eq(highlightVerses.bible, bible)
          )
        )
    },
  }
}
