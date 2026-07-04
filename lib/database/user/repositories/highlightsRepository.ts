import { eq } from "drizzle-orm"
import type { UserDb } from "../drizzle"
import { highlights, type Highlight, type NewHighlight } from "../schema"

function uuid(): string {
  return crypto.randomUUID()
}

export function highlightsRepository(db: UserDb) {
  return {
    async create(input: { color: string; categoryId?: string | null; noteId?: string | null }): Promise<Highlight> {
      const now = new Date()
      const row: NewHighlight = {
        id: uuid(),
        color: input.color,
        categoryId: input.categoryId ?? null,
        noteId: input.noteId ?? null,
        createdAt: now,
        updatedAt: now,
      }
      await db.insert(highlights).values(row)
      return row as Highlight
    },

    async update(id: string, patch: { color?: string; categoryId?: string | null; noteId?: string | null }): Promise<void> {
      await db
        .update(highlights)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(highlights.id, id))
    },

    async delete(id: string): Promise<void> {
      await db.delete(highlights).where(eq(highlights.id, id))
    },

    async findById(id: string): Promise<Highlight | null> {
      const rows = await db
        .select()
        .from(highlights)
        .where(eq(highlights.id, id))
      return rows[0] ?? null
    },

    /** TODO: implement via raw SQL in Task 5 (useHighlights hook) — requires JOIN through highlightVerses. */
    async listByVerse(_book: string, _chapter: number, _verse: number, _bible: string): Promise<Highlight[]> {
      return []
    },
  }
}
