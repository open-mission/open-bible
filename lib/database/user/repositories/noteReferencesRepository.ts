import { eq, asc, and } from "drizzle-orm"
import type { UserDb } from "../drizzle"
import { noteReferences, type NoteReference, type NewNoteReference } from "../schema"

function uuid(): string {
  return crypto.randomUUID()
}

export interface NoteRangeQuery {
  bible: string
  book: string
  chapter: number
  verseStart: number
  verseEnd?: number | null
}

/** Inclusive overlap test between two verse ranges within one chapter. */
export function rangesOverlap(
  queryStart: number,
  queryEnd: number,
  refStart: number,
  refEnd: number,
): boolean {
  const qEnd = queryEnd || queryStart
  const rEnd = refEnd || refStart
  return refStart <= qEnd && rEnd >= queryStart
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

    /** References in a chapter that overlap the given verse range (inclusive). */
    async listForRange(input: NoteRangeQuery): Promise<NoteReference[]> {
      const refs = await db
        .select()
        .from(noteReferences)
        .where(
          and(
            eq(noteReferences.bible, input.bible),
            eq(noteReferences.book, input.book),
            eq(noteReferences.chapter, input.chapter),
          ),
        )

      return refs.filter((r) =>
        rangesOverlap(input.verseStart, input.verseEnd ?? input.verseStart, r.verseStart, r.verseEnd ?? r.verseStart),
      )
    },

    async remove(id: string): Promise<void> {
      await db.delete(noteReferences).where(eq(noteReferences.id, id))
    },

    async removeByNote(noteId: string): Promise<void> {
      await db.delete(noteReferences).where(eq(noteReferences.noteId, noteId))
    },
  }
}
