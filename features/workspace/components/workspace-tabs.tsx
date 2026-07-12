"use client"

import { Plus, X } from "lucide-react"
import { useWorkspace } from "../context/workspace-context"
import { cn } from "@/lib/utils"
import type { BiblePaneState } from "../types"

/**
 * Horizontal scrollable tab bar for the workspace — browser-style tabs along
 * the top, each showing the pane title with a close button (when more than one
 * pane is open), plus a "+" button to open a new Bible pane.
 */
export function WorkspaceTabs() {
  const { panes, activePaneId, activatePane, closePane, openPane } = useWorkspace()

  function handleNewTab() {
    const active = panes.find((p) => p.id === activePaneId)
    let newState: BiblePaneState
    if (active?.state.type === "bible") {
      // Duplicate the active pane's passage (common tab behavior).
      newState = {
        type: "bible",
        bookId: active.state.bookId,
        chapter: active.state.chapter,
        versionId: active.state.versionId,
      }
    } else {
      newState = { type: "bible", bookId: "gen", chapter: 1, versionId: "ara" }
    }
    openPane(newState)
  }

  return (
    <div className="flex items-center gap-1 border-b border-border bg-muted/40 px-2 py-1.5 overflow-x-auto custom-scrollbar shrink-0">
      {panes.map((pane) => {
        const active = pane.id === activePaneId
        return (
          <div
            key={pane.id}
            role="tab"
            tabIndex={0}
            aria-selected={active}
            onClick={() => activatePane(pane.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                activatePane(pane.id)
              }
            }}
            className={cn(
              "group flex items-center gap-2 rounded-md px-3 py-1.5 text-sm whitespace-nowrap cursor-pointer transition-colors select-none",
              active
                ? "bg-background text-foreground border border-border shadow-sm"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground border border-transparent",
            )}
          >
            <span className="max-w-[220px] truncate font-medium">{pane.title}</span>
            {panes.length > 1 && (
              <button
                type="button"
                aria-label="Fechar aba"
                onClick={(e) => {
                  e.stopPropagation()
                  closePane(pane.id)
                }}
                className="ml-1 rounded p-0.5 text-muted-foreground/70 opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100 focus:opacity-100 focus:outline-none"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )
      })}
      <button
        type="button"
        aria-label="Nova aba"
        onClick={handleNewTab}
        className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground shrink-0"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
