"use client"

import { Columns2, Rows2, X } from "lucide-react"
import { IconGripHorizontal } from "@tabler/icons-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { useWorkspace } from "../context/workspace-context"
import { useWorkspaceDnd } from "./workspace-view"
import { BiblePaneView } from "./bible-pane-view"
import { NotePaneView } from "./note-pane-view"
import { SermonPaneView } from "./sermon-pane-view"
import { useReaderSettings } from "../hooks/use-reader-settings"
import { PANE_TYPE_OPTIONS } from "../lib/pane-type-options"
import { cn } from "@/lib/utils"
import type { Pane, LayoutDirection } from "../types"

interface GridPaneProps {
  pane: Pane
  isActive: boolean
  onActivate: () => void
  /** Drag handle element (from the sortable wrapper) rendered top-left. */
  dragHandle?: React.ReactNode
  /** Whether another pane is being dragged over this one. */
  isDropTarget?: boolean
  /** Whether this pane is currently being dragged. */
  isDragging?: boolean
}

/**
 * A split control that opens a dropdown to pick the new pane's type (Bible,
 * Notes, Sermon) instead of always duplicating the current pane.
 */
function GridSplitButton({
  paneId,
  direction,
  label,
  icon,
}: {
  paneId: string
  direction: LayoutDirection
  label: string
  icon: React.ReactNode
}) {
  const { splitPane } = useWorkspace()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label}
        title={label}
        onMouseDown={(e) => e.stopPropagation()}
        className="flex items-center justify-center rounded-full size-7 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {icon}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" sideOffset={4}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Novo painel</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {PANE_TYPE_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.type}
              onClick={() => splitPane(paneId, direction, opt.state)}
            >
              <opt.icon />
              <span>{opt.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * A single pane rendered inside the tiling grid. Grid controls (split
 * horizontal/vertical, close) float at the top-right corner, aligned with the
 * reader header — saving the vertical space of a separate header bar. Each
 * pane has its own version scope and notes context (via BiblePaneView).
 */
export function GridPane({ pane, isActive, onActivate, dragHandle, isDropTarget, isDragging }: GridPaneProps) {
  const { closePane, updatePaneState, panes } = useWorkspace()
  const settings = useReaderSettings()
  const canClose = panes.length > 1

  return (
    <div
      className={cn(
        "relative flex flex-col h-full min-h-0 overflow-hidden bg-background transition-all ring-1 ring-inset border rounded",
        isDragging
          ? "opacity-30 scale-[0.97] border-primary/20 ring-primary/10"
          : isDropTarget
            ? "border-primary ring-primary/40 shadow-[inset_0_0_0_2px_hsl(var(--primary)/0.15)]"
            : isActive
              ? "border-primary/40 ring-primary/20"
              : "border-border ring-border",
      )}
      onMouseDown={onActivate}
    >
      {/* Drop target overlay — visible when another pane hovers over this one */}
      {isDropTarget && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-primary/5 backdrop-blur-[1px] pointer-events-none">
          <span className="rounded-full bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary">
            Soltar para trocar
          </span>
        </div>
      )}

      {/* Drag handle — top-left, reorder the grid pane */}
      {dragHandle}

      {/* Floating grid controls — top-right, aligned with reader header */}
      <div className="absolute top-2.5 right-2.5 z-30 flex items-center gap-0.5 rounded-full bg-background/85 backdrop-blur border border-border/60 p-0.5 shadow-sm">
        <GridSplitButton
          paneId={pane.id}
          direction="horizontal"
          label="Dividir lado a lado"
          icon={<Columns2 className="h-3.5 w-3.5" />}
        />
        <GridSplitButton
          paneId={pane.id}
          direction="vertical"
          label="Dividir empilhado"
          icon={<Rows2 className="h-3.5 w-3.5" />}
        />
        {canClose && (
          <button
            type="button"
            aria-label="Fechar painel"
            title="Fechar painel"
            onClick={(e) => {
              e.stopPropagation()
              closePane(pane.id)
            }}
            className="flex items-center justify-center rounded-full size-7 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Pane body */}
      <div className="flex-1 min-h-0 h-full overflow-hidden">
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
            isActive={isActive}
          />
        ) : pane.state.type === "note" ? (
          <NotePaneView key={pane.id} />
        ) : pane.state.type === "sermon" ? (
          <SermonPaneView key={pane.id} paneId={pane.id} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Em breve
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Wraps a GridPane with dnd-kit draggable + droppable behavior for swap-based
 * reordering. The grip handle (top-left) carries the drag listeners; the pane
 * itself is a droppable target. When a pane is dragged over another, they swap
 * positions in the layout tree (preserving panel sizes and tree shape).
 */
interface DraggableGridPaneProps {
  pane: Pane
  isActive: boolean
  onActivate: () => void
}

export function SortableGridPane({
  pane,
  isActive,
  onActivate,
}: DraggableGridPaneProps) {
  const { setActiveId } = useWorkspaceDnd()

  // Draggable — the grip handle is the activator.
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({ id: pane.id })

  // Droppable — the entire pane is a drop target.
  const {
    setNodeRef: setDropRef,
    isOver,
  } = useDroppable({ id: pane.id })

  const dragHandle = (
    <button
      type="button"
      aria-label="Reordenar painel"
      title="Arraste para reordenar"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => {
        e.stopPropagation()
        setActiveId(pane.id)
      }}
      ref={setDragRef}
      {...attributes}
      {...listeners}
      className={cn(
        "absolute top-2.5 left-2.5 z-30 flex items-center justify-center rounded-full bg-background/85 backdrop-blur border border-border/60 size-8 text-muted-foreground transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isDragging
          ? "cursor-grabbing bg-primary/10 border-primary/30 text-primary"
          : "cursor-grab hover:bg-muted hover:text-foreground hover:scale-110",
      )}
    >
      <IconGripHorizontal className="h-4 w-4" />
    </button>
  )

  return (
    <div ref={setDropRef} className="h-full min-h-0">
      <GridPane
        pane={pane}
        isActive={isActive}
        onActivate={onActivate}
        dragHandle={dragHandle}
        isDropTarget={isOver && !isDragging}
        isDragging={isDragging}
      />
    </div>
  )
}
