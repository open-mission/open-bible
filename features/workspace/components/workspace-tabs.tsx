"use client"

import { X } from "lucide-react"
import { IconGripVertical } from "@tabler/icons-react"
import { useSortable, SortableContext, horizontalListSortingStrategy, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useWorkspace } from "../context/workspace-context"
import { cn } from "@/lib/utils"
import type { Pane } from "../types"

/**
 * Horizontal scrollable tab list for the workspace — browser-style tabs along
 * the top, each showing the pane title with a drag grip and a close button
 * (when more than one pane is open). Tabs can be reordered by dragging the
 * entire tab (like Chrome/VS Code). Rendered inside the desktop header and the
 * mobile bottom bar. The "+" picker lives in WorkspaceToolbar.
 */
export function WorkspaceTabs() {
  const { panes, activePaneId, activatePane, closePane, tabsOrientation } = useWorkspace()
  const strategy = tabsOrientation === "vertical" ? verticalListSortingStrategy : horizontalListSortingStrategy
  const paneIds = panes.map((p) => p.id)

  return (
    <SortableContext items={paneIds} strategy={strategy}>
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
    </SortableContext>
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: pane.id })

  // Lock Y-axis: tabs should only slide horizontally inside the tab strip.
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(
      transform ? { ...transform, y: 0 } : null,
    ),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      aria-selected={active}
      title={
        index < 9
          ? `${pane.title} — ⌘/Ctrl+${index + 1}`
          : pane.title
      }
      // The entire tab is the drag handle — listeners are on the wrapper.
      {...attributes}
      {...listeners}
      role="tab"
      tabIndex={0}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onActivate()
        }
      }}
      className={cn(
        "group relative flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm whitespace-nowrap transition-all select-none border",
        isDragging
          ? "opacity-40 scale-95 border-primary/30 bg-primary/5 shadow-none cursor-grabbing"
          : "cursor-grab active:cursor-grabbing",
        !isDragging && active
          ? "bg-background text-foreground shadow-sm border-border"
          : !isDragging
            ? "text-muted-foreground hover:bg-background/60 hover:text-foreground border-transparent"
            : "",
      )}
    >
      {/* Decorative grip icon — the whole tab is draggable */}
      {total > 1 && (
        <span className="flex items-center justify-center text-muted-foreground/40 shrink-0">
          <IconGripVertical className="h-3.5 w-3.5" />
        </span>
      )}

      {/* Active indicator — subtle bottom accent, only when multiple tabs */}
      {active && total > 1 && !isDragging && (
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
          // Prevent drag from triggering on the close button.
          onPointerDown={(e) => e.stopPropagation()}
          className="ml-1 rounded p-0.5 text-muted-foreground/70 opacity-50 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100 focus:opacity-100 focus:outline-none"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
