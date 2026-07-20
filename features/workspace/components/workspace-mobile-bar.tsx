"use client"

import { useState, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { IconLayoutGrid } from "@tabler/icons-react"
import { useWorkspace } from "../context/workspace-context"
import { getBook } from "@/features/bible-reader/utils/bible-data"
import { PaneTypePicker } from "./pane-type-picker"
import { ConfigButton } from "./config-button"
import { WorkspaceTabOverview } from "./workspace-tab-overview"

export function WorkspaceMobileBar() {
  const { panes, activePane, updatePaneState } = useWorkspace()
  const [overviewOpen, setOverviewOpen] = useState(false)

  const isBible = activePane?.state.type === "bible"
  const bibleState = isBible ? activePane!.state as { bookId: string; chapter: number; versionId: string } : null
  const book = bibleState ? getBook(bibleState.bookId) : null

  const canGoPrev = bibleState ? bibleState.chapter > 1 : false
  const canGoNext = bibleState && book ? bibleState.chapter < book.chapters : false

  const prevChapter = useCallback(() => {
    if (bibleState && canGoPrev) {
      updatePaneState(activePane!.id, { chapter: bibleState.chapter - 1 })
    }
  }, [bibleState, canGoPrev, activePane, updatePaneState])

  const nextChapter = useCallback(() => {
    if (bibleState && canGoNext) {
      updatePaneState(activePane!.id, { chapter: bibleState.chapter + 1 })
    }
  }, [bibleState, canGoNext, activePane, updatePaneState])

  return (
    <>
      <div className="md:hidden fixed left-0 right-0 z-40 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] border-t border-border bg-background/95 backdrop-blur-md h-14 px-2 flex items-center gap-1">
        <button
          type="button"
          onClick={() => setOverviewOpen(true)}
          aria-label="Abas abertas"
          className="relative flex items-center justify-center rounded-md size-10 text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <IconLayoutGrid className="size-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
            {panes.length}
          </span>
        </button>

        {isBible && (
          <button
            type="button"
            onClick={prevChapter}
            disabled={!canGoPrev}
            aria-label="Capítulo anterior"
            className="flex items-center justify-center rounded-md size-10 text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="size-5" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setOverviewOpen(true)}
          className="flex min-w-0 flex-1 items-center justify-center rounded-md px-1.5 py-1.5 transition-colors hover:bg-background/60 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="truncate text-sm font-medium">
            {activePane?.title ?? "Open Bible"}
          </span>
        </button>

        {isBible && (
          <button
            type="button"
            onClick={nextChapter}
            disabled={!canGoNext}
            aria-label="Próximo capítulo"
            className="flex items-center justify-center rounded-md size-10 text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronRight className="size-5" />
          </button>
        )}

        <PaneTypePicker />
        <ConfigButton />
      </div>

      <WorkspaceTabOverview open={overviewOpen} onClose={() => setOverviewOpen(false)} />
    </>
  )
}
