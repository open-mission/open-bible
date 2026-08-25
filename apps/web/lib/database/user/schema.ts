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

/**
 * highlight_categories — user-defined tags for organizing highlights.
 * Global (not tied to Bible version). Created on-demand via autocomplete.
 */
export const highlightCategories = sqliteTable("highlight_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
})

/**
 * highlights — a colored highlight applied to one or more verses.
 */
export const highlights = sqliteTable("highlights", {
  id: text("id").primaryKey(),
  color: text("color").notNull(),
  content: text("content").default("").notNull(),
  categoryId: text("category_id")
    .references(() => highlightCategories.id, { onDelete: "set null" }),
  noteId: text("note_id")
    .references(() => notes.id, { onDelete: "set null" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
})

/**
 * highlight_verses — maps a highlight to specific verses (N:N).
 */
export const highlightVerses = sqliteTable(
  "highlight_verses",
  {
    id: text("id").primaryKey(),
    highlightId: text("highlight_id")
      .notNull()
      .references(() => highlights.id, { onDelete: "cascade" }),
    book: text("book").notNull(),
    chapter: integer("chapter").notNull(),
    verse: integer("verse").notNull(),
    bible: text("bible").notNull(),
  },
  (t) => [
    index("idx_highlight_verses_lookup").on(t.book, t.chapter, t.verse, t.bible),
    index("idx_highlight_verses_highlight_id").on(t.highlightId),
  ]
)

// --- Relations ---

export const highlightCategoriesRelations = relations(highlightCategories, ({ many }) => ({
  highlights: many(highlights),
}))

export const highlightsRelations = relations(highlights, ({ one, many }) => ({
  category: one(highlightCategories, {
    fields: [highlights.categoryId],
    references: [highlightCategories.id],
  }),
  note: one(notes, {
    fields: [highlights.noteId],
    references: [notes.id],
  }),
  verses: many(highlightVerses),
}))

export const highlightVersesRelations = relations(highlightVerses, ({ one }) => ({
  highlight: one(highlights, {
    fields: [highlightVerses.highlightId],
    references: [highlights.id],
  }),
}))

// --- Types ---

export type HighlightCategory = typeof highlightCategories.$inferSelect
export type NewHighlightCategory = typeof highlightCategories.$inferInsert
export type Highlight = typeof highlights.$inferSelect
export type NewHighlight = typeof highlights.$inferInsert
export type HighlightVerse = typeof highlightVerses.$inferSelect
export type NewHighlightVerse = typeof highlightVerses.$inferInsert

