"use client"

import { ChevronLeft } from "lucide-react"
import { getBook } from "@/features/bible-reader/utils/bible-data"

interface ChapterGridProps {
  bookId: string
  selectedChapter: number | null
  onSelectChapter: (chapter: number) => void
  onBack: () => void
}

export function ChapterGrid({ bookId, selectedChapter, onSelectChapter, onBack }: ChapterGridProps) {
  const book = getBook(bookId)
  if (!book) return null

  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1)

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 py-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
          aria-label="Voltar para a lista de livros"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h2 className="font-sans text-base font-semibold text-foreground truncate leading-tight">
            {book.name}
          </h2>
          <p className="text-xs text-muted-foreground leading-tight mt-0.5">
            {book.chapters} {book.chapters === 1 ? "capítulo" : "capítulos"}
          </p>
        </div>
      </div>

      {/* Chapter label */}
      <div className="px-4 pt-4 pb-2">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Capítulos
        </span>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-5 gap-2">
          {chapters.map((ch) => (
            <button
              key={ch}
              onClick={() => onSelectChapter(ch)}
              className={`aspect-square flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                selectedChapter === ch
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-accent hover:text-accent-foreground text-foreground"
              }`}
              aria-label={`Capítulo ${ch}`}
              aria-pressed={selectedChapter === ch}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
