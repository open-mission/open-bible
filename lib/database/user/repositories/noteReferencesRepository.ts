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
