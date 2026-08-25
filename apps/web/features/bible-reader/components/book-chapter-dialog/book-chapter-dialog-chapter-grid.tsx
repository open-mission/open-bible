"use client"

import { ChevronLeft } from "lucide-react"
import type { Book } from "@/lib/types"

interface BookChapterDialogChapterGridProps {
  book: Book
  selectedChapter: number | null
  selectedBookId: string | null
  onSelectChapter: (ch: number) => void
  onBack: () => void
}

/**
 * Chapter selection grid with back button.
 */
export function BookChapterDialogChapterGrid({
  book,
  selectedChapter,
  selectedBookId,
  onSelectChapter,
  onBack,
}: BookChapterDialogChapterGridProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer bg-primary/5 hover:bg-primary/10 px-2.5 py-1.5 rounded-md"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar para Livros
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Selecionado:</span>
          <span className="text-xs font-bold text-foreground bg-accent border border-border px-2 py-1 rounded-md">
            {book.name}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Selecione o Capítulo
        </h3>

        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-px bg-border border border-border rounded-xl overflow-hidden shadow-xs">
          {Array.from({ length: book.chapters }, (_, i) => i + 1).map((ch) => {
            const isSelected = ch === selectedChapter && book.id === selectedBookId
            return (
              <button
                key={ch}
                onClick={() => onSelectChapter(ch)}
                className={`aspect-square flex items-center justify-center text-sm font-bold transition-all cursor-pointer ${isSelected
                  ? "bg-primary text-primary-foreground font-extrabold"
                  : "bg-background text-foreground hover:bg-accent/80"
                  }`}
              >
                {ch}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
