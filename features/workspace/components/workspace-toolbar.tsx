"use client"

import { Rows3, LayoutGrid } from "lucide-react"
import { useWorkspace } from "../context/workspace-context"
import { PaneTypePicker } from "./pane-type-picker"
import { cn } from "@/lib/utils"

/**
 * The Abas/Grade layout-mode toggle plus the PaneTypePicker (+) to open new
 * panes of any type. Rendered inline — on the desktop header (tabs + toggle
 * on one line) and inside the mobile bottom bar.
 */
export function WorkspaceToolbar() {
  const { layoutMode, setLayoutMode } = useWorkspace()

  return (
    <div className="flex items-center gap-2 shrink-0">
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

      <PaneTypePicker />
    </div>
  )
}