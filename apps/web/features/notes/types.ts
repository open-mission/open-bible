export interface NoteTarget {
  bible: string
  book: string
  chapter: number
  verseStart: number
  verseEnd?: number | null
}

export interface NoteWithRefs {
  note: import("@/lib/database/user/schema").Note
  references: import("@/lib/database/user/schema").NoteReference[]
}
