"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Reader } from "@/components/reader"

export default function Home() {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleSelectBook(bookId: string) {
    setSelectedBookId(bookId)
    setSelectedChapter(null)
  }

  function handleSelectChapter(chapter: number) {
    setSelectedChapter(chapter)
  }

  function handleChapterChange(chapter: number) {
    setSelectedChapter(chapter)
  }

  function handleJumpTo(bookId: string, chapter: number) {
    setSelectedBookId(bookId)
    setSelectedChapter(chapter)
  }

  return (
    <main className="h-dvh flex overflow-hidden bg-background">
      {/* Sidebar — handles both desktop and mobile drawer */}
      <Sidebar
        selectedBookId={selectedBookId}
        selectedChapter={selectedChapter}
        onSelectBook={handleSelectBook}
        onSelectChapter={handleSelectChapter}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onJumpTo={handleJumpTo}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border shrink-0 bg-sidebar">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
            className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>
          <span className="font-serif text-sm font-medium text-foreground">
            {selectedBookId && selectedChapter
              ? `${selectedBookId} · Cap. ${selectedChapter}`
              : "Open Bible"}
          </span>
        </div>

        {/* Reader or empty state */}
        <div className="flex-1 overflow-hidden">
          {selectedBookId && selectedChapter ? (
            <Reader
              bookId={selectedBookId}
              chapter={selectedChapter}
              onChapterChange={handleChapterChange}
              onBack={() => setSidebarOpen(true)}
            />
          ) : (
            <EmptyReader onOpenSidebar={() => setSidebarOpen(true)} />
          )}
        </div>
      </div>
    </main>
  )
}

function EmptyReader({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  return (
    <div className="flex flex-1 h-full flex-col items-center justify-center gap-4 p-8">
      <p className="font-serif text-xl text-muted-foreground/60 text-balance text-center">
        Selecione um livro e um capítulo para começar a ler.
      </p>
      <p className="text-xs text-muted-foreground/40 text-center text-balance">
        Clique em qualquer versículo para destacar ou adicionar uma nota.
      </p>
      {/* Mobile shortcut */}
      <button
        onClick={onOpenSidebar}
        className="md:hidden mt-2 rounded-md px-4 py-2 text-sm bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        Escolher livro
      </button>
    </div>
  )
}
