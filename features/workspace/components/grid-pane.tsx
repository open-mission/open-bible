"use client"

import { Columns2, Rows2, X } from "lucide-react"
import { useWorkspace } from "../context/workspace-context"
import { BiblePaneView } from "./bible-pane-view"
import { useReaderSettings } from "../hooks/use-reader-settings"
import { cn } from "@/lib/utils"
import type { Pane } from "../types"

interface GridPaneProps {
  pane: Pane
  isActive: boolean
  onActivate: () => void
}

/**
 * A single pane rendered inside the tiling grid. Shows a compact header with
 * the pane title plus split/close controls, and the Bible reader below. Each
 * pane has its own version scope and notes context (via BiblePaneView).
 */
export function GridPane({ pane, isActive, onActivate }: GridPaneProps) {
  const { splitPane, closePane, updatePaneState, panes } = useWorkspace()
  const settings = useReaderSettings()
  const canClose = panes.length > 1

  return (
    <div
      className={cn(
        "flex flex-col h-full min-h-0 overflow-hidden bg-background transition-shadow",
        isActive ? "ring-1 ring-inset ring-primary/30" : "ring-1 ring-inset ring-border",
      )}
      onMouseDown={onActivate}
    >
      {/* Compact header with split + close controls */}
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1 border-b shrink-0 transition-colors",
          isActive ? "border-primary/20 bg-primary/5" : "border-border bg-muted/40",
        )}
      >
        <span className="flex-1 truncate text-xs font-medium text-foreground">
          {pane.title}
        </span>
        <button
          type="button"
          aria-label="Dividir lado a lado"
          title="Dividir lado a lado"
          onClick={(e) => {
            e.stopPropagation()
            splitPane(pane.id, "horizontal")
          }}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Columns2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Dividir empilhado"
          title="Dividir empilhado"
          onClick={(e) => {
            e.stopPropagation()
            splitPane(pane.id, "vertical")
          }}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Rows2 className="h-3.5 w-3.5" />
        </button>
        {canClose && (
          <button
            type="button"
            aria-label="Fechar painel"
            title="Fechar painel"
            onClick={(e) => {
              e.stopPropagation()
              closePane(pane.id)
            }}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Pane body */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {pane.state.type === "bible" ? (
          <BiblePaneView
            key={pane.id}
            pane={pane}
            readerMode={settings.readerMode}
            onChangeReaderMode={settings.setReaderMode}
            fontSize={settings.fontSize}
            onChangeFontSize={settings.setFontSize}
            verseSpacing={settings.verseSpacing}
            onChangeVerseSpacing={settings.setVerseSpacing}
            readerFont={settings.readerFont}
            onChangeReaderFont={settings.setReaderFont}
            onPaneUpdate={updatePaneState}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Em breve
          </div>
        )}
      </div>
    </div>
  )
}