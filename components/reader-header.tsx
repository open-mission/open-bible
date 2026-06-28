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
    <div className="flex items-center justify-between px-4 md:px-6 pb-3 border-b border-border mb-8">
      <nav className="flex items-center space-x-1 text-sm font-medium">
        <ButtonGroup>
          <Button onClick={onBookChapterClick} variant="outline" size="lg">
            <span className="text-sm font-semibold mx-1">{book.name}</span>
          </Button>
          <Button onClick={onBookChapterClick} variant="outline" size="lg">
            <span className="text-sm font-semibold mx-1">{chapter}</span>
          </Button>
        </ButtonGroup>
        <ReaderVersionBadge />
      </nav>

      <div className="flex items-center gap-2">
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
          className={`h-8 w-8 inline-flex items-center justify-center rounded-md transition-colors ${
            isInspectorOpen
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
