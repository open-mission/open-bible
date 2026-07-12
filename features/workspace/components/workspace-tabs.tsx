"use client"

import { X } from "lucide-react"
import { useWorkspace } from "../context/workspace-context"
import { cn } from "@/lib/utils"

/**
 * Horizontal scrollable tab list for the workspace — browser-style tabs along
 * the top, each showing the pane title with a close button (when more than one
 * pane is open). Rendered inside the desktop header (tabs + toggle on one
 * line) and the mobile bottom bar. The "+" picker lives in WorkspaceToolbar.
 */
export function WorkspaceTabs() {
  const { panes, activePaneId, activatePane, closePane } = useWorkspace()

  return (
    <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar min-w-0 flex-1">
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
    </div>
  )
}
