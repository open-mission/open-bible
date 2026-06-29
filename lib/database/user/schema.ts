import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core"
import { relations } from "drizzle-orm"

/**
 * notes — a user study/comment/annotation. NOT bound to a single verse;
 * verse links live in note_references. Soft-deletable for future sync.
 */
export const notes = sqliteTable("notes", {
  id: text("id").primaryKey(),
  title: text("title"),
  content: text("content").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
})

/**
 * note_references — N Bible references per note (cross-version, ranges allowed).
 */
export const noteReferences = sqliteTable(
  "note_references",
  {
    id: text("id").primaryKey(),
    noteId: text("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    bible: text("bible").notNull(), // version id, e.g. "ara"
    book: text("book").notNull(), // app string book id, e.g. "jhn"
    chapter: integer("chapter").notNull(),
    verseStart: integer("verse_start").notNull(),
    verseEnd: integer("verse_end"), // null = single verse
    order: integer("order").notNull().default(0),
  },
  (t) => [index("idx_note_references_note_id").on(t.noteId)]
)

export const notesRelations = relations(notes, ({ many }) => ({
  references: many(noteReferences),
}))

export const noteReferencesRelations = relations(noteReferences, ({ one }) => ({
  note: one(notes, { fields: [noteReferences.noteId], references: [notes.id] }),
}))

export type Note = typeof notes.$inferSelect
export type NewNote = typeof notes.$inferInsert
export type NoteReference = typeof noteReferences.$inferSelect
export type NewNoteReference = typeof noteReferences.$inferInsert

/**
 * installed_bibles — local SQLite WASM Bible databases that have been downloaded
 * and registered in app.db. Used to track versions for future updates.
 */
export const installedBibles = sqliteTable("installed_bibles", {
  id: text("id").primaryKey(), // e.g. "ara"
  name: text("name").notNull(), // e.g. "Almeida Revista e Atualizada"
  installedAt: integer("installed_at", { mode: "timestamp_ms" }).notNull(),
  versionCode: integer("version_code").notNull().default(1),
})

export type InstalledBible = typeof installedBibles.$inferSelect
export type NewInstalledBible = typeof installedBibles.$inferInsert

