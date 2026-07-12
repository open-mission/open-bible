"use client"

import { Rows3, LayoutGrid, Notebook } from "lucide-react"
import { useWorkspace } from "../context/workspace-context"
import { cn } from "@/lib/utils"

/**
 * Toolbar shown at the top of the workspace when panes are open. Contains the
 * layout mode toggle (Abas/Grade) and a "Notas" button to open a notes pane.
 */
export function WorkspaceToolbar() {
  const { layoutMode, setLayoutMode, openPane } = useWorkspace()

  return (
    <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-2 py-1.5 shrink-0">
      <div className="flex items-center gap-0.5 rounded-lg bg-background border border-border p-0.5">
        <button
          type="button"
          aria-label="Modo abas"
          aria-pressed={layoutMode === "tabs"}
          onClick={() => setLayoutMode("tabs")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            layoutMode === "tabs"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Rows3 className="h-3.5 w-3.5" />
          Abas
        </button>
        <button
          type="button"
          aria-label="Modo grade"
          aria-pressed={layoutMode === "grid"}
          onClick={() => setLayoutMode("grid")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            layoutMode === "grid"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Grade
        </button>
      </div>

      <div className="flex-1" />

      <button
        type="button"
        aria-label="Abrir notas"
        onClick={() => openPane({ type: "note", noteId: "" })}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <Notebook className="h-3.5 w-3.5" />
        Notas
      </button>
    </div>
  )
}