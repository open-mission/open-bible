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
