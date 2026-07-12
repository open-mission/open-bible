"use client"

import { X } from "lucide-react"
import { IconGripVertical } from "@tabler/icons-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useWorkspace } from "../context/workspace-context"
import { useWorkspaceDnd } from "./workspace-view"
import { cn } from "@/lib/utils"
import type { Pane } from "../types"

/**
 * Horizontal scrollable tab list for the workspace — browser-style tabs along
 * the top, each showing the pane title with a drag grip and a close button
 * (when more than one pane is open). Tabs can be reordered by dragging the
 * grip. Rendered inside the desktop header and the mobile bottom bar. The "+"
 * picker lives in WorkspaceToolbar.
 */
export function WorkspaceTabs() {
  const { panes, activePaneId, activatePane, closePane } = useWorkspace()

  return (
    <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar min-w-0 flex-1 px-0.5 py-1">
      {panes.map((pane) => (
        <SortableTab
          key={pane.id}
          pane={pane}
          active={pane.id === activePaneId}
          onActivate={() => activatePane(pane.id)}
          onClose={() => closePane(pane.id)}
          index={panes.indexOf(pane)}
          total={panes.length}
        />
      ))}
    </div>
  )
}

function SortableTab({
  pane,
  active,
  onActivate,
  onClose,
  index,
  total,
}: {
  pane: Pane
  active: boolean
  onActivate: () => void
  onClose: () => void
  index: number
  total: number
}) {
  const { setActiveId } = useWorkspaceDnd()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: pane.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      role="tab"
      tabIndex={0}
      aria-selected={active}
      title={
        index < 9
          ? `${pane.title} — ⌘/Ctrl+${index + 1}`
          : pane.title
      }
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onActivate()
        }
      }}
      className={cn(
        "group relative flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm whitespace-nowrap cursor-pointer transition-colors select-none border",
        active
          ? "bg-background text-foreground shadow-sm border-border"
          : "text-muted-foreground hover:bg-background/60 hover:text-foreground border-transparent",
      )}
    >
      {/* Drag handle */}
      {total > 1 && (
        <button
          type="button"
          aria-label="Reordenar aba"
          title="Arraste para reordenar"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => {
            e.stopPropagation()
            setActiveId(pane.id)
          }}
          {...attributes}
          {...listeners}
          className="flex items-center justify-center rounded text-muted-foreground/50 hover:text-foreground cursor-grab active:cursor-grabbing outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <IconGripVertical className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Active indicator — subtle bottom accent, only when multiple tabs */}
      {active && total > 1 && (
        <span
          className="absolute inset-x-1.5 -bottom-[5px] h-0.5 rounded-full bg-muted-foreground/40"
          aria-hidden
        />
      )}
      <span className="max-w-[200px] truncate font-medium">{pane.title}</span>
      {total > 1 && (
        <button
          type="button"
          aria-label="Fechar aba"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="ml-1 rounded p-0.5 text-muted-foreground/70 opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100 focus:opacity-100 focus:outline-none"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
