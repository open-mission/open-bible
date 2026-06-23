export type Testament = "old" | "new"

export interface Book {
  id: string
  name: string
  abbreviation: string
  testament: Testament
  chapters: number
}

export interface Verse {
  id: string
  bookId: string
  chapter: number
  verse: number
  text: string
}

export type HighlightColor = "amber" | "green" | "blue" | "rose"

export interface Highlight {
  id: string
  verseId: string
  color: HighlightColor
  createdAt: string
}

export interface Note {
  id: string
  verseId: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface BibleState {
  selectedBookId: string | null
  selectedChapter: number | null
}
