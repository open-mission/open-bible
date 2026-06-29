"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface ReaderChapterNavProps {
  book: { name: string; chapters: number }
  chapter: number
  onPrevChapter: () => void
  onNextChapter: () => void
}

export function ReaderChapterNav({
  book,
  chapter,
  onPrevChapter,
  onNextChapter,
}: ReaderChapterNavProps) {
  return (
    <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
      <span className="text-xs italic text-muted-foreground">
        End of {book.name} {chapter}
      </span>
      <div className="flex gap-2">
        <button
          onClick={onPrevChapter}
          disabled={chapter <= 1}
          className="inline-flex items-center justify-center rounded-md h-9 w-9 border border-border hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={onNextChapter}
          disabled={chapter >= book.chapters}
          className="inline-flex items-center justify-center rounded-md h-9 w-9 border border-border hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
