"use client"

import { useCallback } from "react"
import { Plus, X, Notebook, Presentation } from "lucide-react"
import { useWorkspace } from "../context/workspace-context"
import { useBibleVerses } from "@/features/bible-reader/hooks/use-bible"
import { getBook } from "@/features/bible-reader/utils/bible-data"
import { BibleVersionScopeProvider } from "@/features/bible-reader/context/bible-version-context"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { PaneTypePicker } from "./pane-type-picker"
import { cn } from "@/lib/utils"
import type { Pane, PaneState } from "../types"

/**
 * Full-screen, Safari-style overview of every open workspace pane. Each pane is
 * rendered as a card with a live preview (Bible verses, or an "Em breve"
 * placeholder for notes/sermons). Tapping a card activates that pane; the `X`
 * closes it; the trailing dashed card opens a fresh Bible pane.
 *
 * Mobile-first: wrapped in `BottomSheet` (full-screen drawer on mobile, dialog
 * on desktop). Opened from the compact `WorkspaceMobileBar`.
 */
export function WorkspaceTabOverview({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { panes, activatePane, closePane } = useWorkspace()

  const handleSelect = useCallback(
    (id: string) => {
      activatePane(id)
      onClose()
    },
    [activatePane, onClose],
  )

  return (
    <BottomSheet open={open} onClose={onClose} size="full">
      <div className="flex h-full flex-col">
        {/* Sticky header: title + count, new-pane picker, done */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
          <div className="flex items-baseline gap-2">
            <h2 className="text-base font-semibold">Abas</h2>
            <span className="text-sm text-muted-foreground">{panes.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <PaneTypePicker />
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Concluído
            </button>
          </div>
        </div>

        {/* Card grid */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4">
          {panes.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <p className="text-sm">Nenhuma aba aberta</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {panes.map((pane, i) => (
                <TabOverviewCard
                  key={pane.id}
                  pane={pane}
                  index={i}
                  onSelect={handleSelect}
                  onCloseTab={closePane}
                />
              ))}
              <AddTabCard onClose={onClose} />
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  )
}


function TabOverviewCard({
  pane,
  index,
  onSelect,
  onCloseTab,
}: {
  pane: Pane
  index: number
  onSelect: (id: string) => void
  onCloseTab: (id: string) => void
}) {
  const { activePaneId } = useWorkspace()
  const isActive = pane.id === activePaneId
  const state = pane.state

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(pane.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect(pane.id)
        }
      }}
      style={{ animationDelay: `${index * 30}ms` }}
      className={cn(
        "group relative flex aspect-[3/4] cursor-pointer flex-col overflow-hidden rounded-xl border bg-card text-left outline-none animate-in fade-in zoom-in-95 duration-200",
        "focus-visible:ring-2 focus-visible:ring-ring",
        isActive ? "ring-2 ring-primary" : "border-border",
      )}
    >
      {/* Close button */}
      <button
        type="button"
        aria-label="Fechar aba"
        onClick={(e) => {
          e.stopPropagation()
          onCloseTab(pane.id)
        }}
        className="absolute right-1.5 top-1.5 z-10 flex items-center justify-center rounded-full bg-background/80 p-1 text-muted-foreground opacity-0 backdrop-blur transition-opacity hover:text-foreground group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {state.type === "bible" ? (
        <BiblePreview bookId={state.bookId} chapter={state.chapter} versionId={state.versionId} />
      ) : (
        <PlaceholderPreview type={state.type} />
      )}
    </div>
  )
}


function BiblePreview({
  bookId,
  chapter,
  versionId,
}: {
  bookId: string
  chapter: number
  versionId: string
}) {
  const book = getBook(bookId)
  const { verses, loading } = useBibleVerses(bookId, chapter)

  return (
    <BibleVersionScopeProvider versionId={versionId} setVersionId={() => {}}>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-1 border-b border-border/60 px-3 py-2">
          <span className="truncate text-sm font-semibold">{book?.name ?? bookId}</span>
          <span className="shrink-0 text-xs text-muted-foreground">Cap. {chapter}</span>
        </div>
        <div className="px-3 pt-1.5">
          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-secondary-foreground">
            {versionId}
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden px-3 py-2">
          {loading ? (
            <div className="space-y-1.5">
              {[0, 1, 2].map((n) => (
                <div key={n} className="h-2.5 w-full animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : verses.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sem versículos</p>
          ) : (
            <div className="space-y-1 text-xs leading-snug text-muted-foreground">
              {verses.slice(0, 6).map((v) => (
                <p key={v.id} className="line-clamp-1">
                  <span className="font-medium text-foreground/80">{v.verse}</span> {v.text}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </BibleVersionScopeProvider>
  )
}

function PlaceholderPreview({ type }: { type: PaneState["type"] }) {
  const Icon = type === "note" ? Notebook : Presentation
  const label = type === "note" ? "Nota" : "Sermão"
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/60 px-3 py-2">
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
        <Icon className="h-8 w-8" />
        <span className="text-xs">Em breve</span>
      </div>
    </div>
  )
}

function AddTabCard({ onClose }: { onClose: () => void }) {
  const { openPane } = useWorkspace()
  return (
    <button
      type="button"
      onClick={() => {
        openPane({ type: "bible", bookId: "gen", chapter: 1, versionId: "ara" })
        onClose()
      }}
      className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Plus className="h-8 w-8" />
      <span className="text-sm">Nova aba</span>
    </button>
  )
}
