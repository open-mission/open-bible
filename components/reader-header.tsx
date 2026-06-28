"use client"

import { Minimize2, Maximize2 } from "lucide-react"
import { IconLayoutSidebarRight } from "@tabler/icons-react"
import { ButtonGroup } from "./ui/button-group"
import { Button } from "./ui/button"
import { ReaderVersionBadge } from "./reader-version-badge"
import { SidebarTrigger } from "./ui/sidebar"

interface ReaderHeaderProps {
  book: { name: string }
  chapter: number
  readerMode: "wide" | "readable"
  isInspectorOpen: boolean
  onBookChapterClick: () => void
  onToggleReaderMode: () => void
  onInspectorToggle: () => void
}

export function ReaderHeader({
  book,
  chapter,
  readerMode,
  isInspectorOpen,
  onBookChapterClick,
  onToggleReaderMode,
  onInspectorToggle,
}: ReaderHeaderProps) {
  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur flex items-center justify-between pb-3 pt-3 px-4 border-b border-border">
      <nav className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-30 flex justify-center pb-5 pt-10 bg-linear-to-t from-background via-background/95 to-transparent md:relative md:bottom-auto md:left-auto md:right-auto md:z-auto md:flex md:justify-start md:pb-0 md:pt-0 md:bg-none text-sm font-medium w-full md:w-auto">
        <ButtonGroup className="shadow-lg md:shadow-none">
          <Button onClick={onBookChapterClick} variant="outline" size="lg">
            <span className="text-sm font-semibold mx-1">{book.name}</span>
          </Button>
          <Button onClick={onBookChapterClick} variant="outline" size="lg">
            <span className="text-sm font-semibold mx-1">{chapter}</span>
          </Button>
          <ReaderVersionBadge />
        </ButtonGroup>
      </nav>

      <div className="hidden md:flex items-center gap-2">
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
          className={`h-8 w-8 hidden md:inline-flex items-center justify-center rounded-md transition-colors ${isInspectorOpen
            ? "bg-accent text-accent-foreground"
            : "hover:bg-accent text-muted-foreground"
            }`}
          title={isInspectorOpen ? "Fechar inspector" : "Abrir inspector"}
        >
          <IconLayoutSidebarRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
