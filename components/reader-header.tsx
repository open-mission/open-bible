"use client"

import { Minimize2, Maximize2 } from "lucide-react"
import { IconLayoutSidebarRight } from "@tabler/icons-react"
import { ButtonGroup } from "./ui/button-group"
import { Button } from "./ui/button"
import { ReaderVersionBadge } from "./reader-version-badge"

interface ReaderHeaderProps {
  book: { name: string }
  chapter: number
  readerMode: "wide" | "readable"
  isInspectorOpen: boolean
  onBookChapterClick: () => void
  onToggleReaderMode: () => void
  onInspectorToggle: () => void
  showMiniReference?: boolean
}

export function ReaderHeader({
  book,
  chapter,
  readerMode,
  isInspectorOpen,
  onBookChapterClick,
  onToggleReaderMode,
  onInspectorToggle,
  showMiniReference = false,
}: ReaderHeaderProps) {
  return (
    <>
      {/* Top Header - Sticky on desktop, sliding down on scroll on mobile */}
      <div
        className={`sticky top-0 z-20 bg-background/95 backdrop-blur flex items-center justify-between pb-3 pt-3 px-4 border-b border-border min-h-[57px] transition-all duration-300 ease-in-out md:translate-y-0 md:opacity-100 ${
          showMiniReference
            ? "translate-y-0 opacity-100"
            : "max-md:-translate-y-full max-md:opacity-0 max-md:pointer-events-none"
        }`}
      >
        {/* Desktop Book/Chapter Selector (Left-aligned) */}
        <div className="hidden md:flex items-center">
          <ButtonGroup>
            <Button onClick={onBookChapterClick} variant="outline" size="lg" className="h-9">
              <span className="text-sm font-semibold mx-1">{book.name}</span>
            </Button>
            <Button onClick={onBookChapterClick} variant="outline" size="lg" className="h-9">
              <span className="text-sm font-semibold mx-1">{chapter}</span>
            </Button>
            <ReaderVersionBadge />
          </ButtonGroup>
        </div>

        {/* Mobile Mini Reference (Centered when visible) */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 transition-all duration-300 md:hidden font-serif text-sm font-semibold text-foreground ${
            showMiniReference ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"
          }`}
        >
          {book.name} {chapter}
        </div>

        {/* Desktop Mini Reference and Tools (Right-aligned) */}
        <div className="hidden md:flex items-center gap-2">
          <div
            className={`transition-all duration-300 font-serif text-sm font-semibold mr-4 text-foreground ${
              showMiniReference ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"
            }`}
          >
            {book.name} {chapter}
          </div>

          <button
            onClick={onToggleReaderMode}
            className="hidden md:inline-flex items-center justify-center gap-2 rounded-md h-8 px-3 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            title={readerMode === "wide" ? "Modo legível" : "Modo largo"}
          >
            {readerMode === "wide" ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
            <span className="hidden lg:inline">
              {readerMode === "wide" ? "Legível" : "Largo"}
            </span>
          </button>

          <button
            onClick={onInspectorToggle}
            className={`h-8 w-8 hidden md:inline-flex items-center justify-center rounded-md transition-colors ${
              isInspectorOpen ? "bg-accent text-accent-foreground" : "hover:bg-accent text-muted-foreground"
            }`}
            title={isInspectorOpen ? "Fechar inspector" : "Abrir inspector"}
          >
            <IconLayoutSidebarRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Selector Group - Always visible and fixed at the bottom above MobileNav */}
      <nav className="md:hidden fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-30 flex justify-center pb-4 pt-8 bg-linear-to-t from-background via-background/95 to-transparent text-sm font-medium w-full">
        <ButtonGroup className="shadow-xl border border-border/80 bg-background">
          <Button onClick={onBookChapterClick} variant="outline" size="lg" className="h-10">
            <span className="text-sm font-semibold mx-1">{book.name}</span>
          </Button>
          <Button onClick={onBookChapterClick} variant="outline" size="lg" className="h-10">
            <span className="text-sm font-semibold mx-1">{chapter}</span>
          </Button>
          <ReaderVersionBadge />
        </ButtonGroup>
      </nav>
    </>
  )
}
