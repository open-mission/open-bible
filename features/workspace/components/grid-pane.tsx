"use client"

import { Columns2, Rows2, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useWorkspace } from "../context/workspace-context"
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
export function GridPane({ pane, isActive, onActivate }: GridPaneProps) {
  const { closePane, updatePaneState, panes } = useWorkspace()
  const settings = useReaderSettings()
  const canClose = panes.length > 1

  return (
    <div
      className={cn(
        "relative flex flex-col h-full min-h-0 overflow-hidden bg-background transition-shadow",
        isActive
          ? "ring-1 ring-inset ring-primary/30"
          : "ring-1 ring-inset ring-border",
      )}
      onMouseDown={onActivate}
    >
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
