"use client"

import { useWorkspace } from "../context/workspace-context"
import { useReaderSettings } from "../hooks/use-reader-settings"
import { BiblePaneView } from "./bible-pane-view"
import { NotePaneView } from "./note-pane-view"
import { SermonPaneView } from "./sermon-pane-view"
import { WorkspaceTabs } from "./workspace-tabs"
import { WorkspaceToolbar } from "./workspace-toolbar"
import { WorkspaceGrid } from "./workspace-grid"
import { WorkspaceMobileBar } from "./workspace-mobile-bar"
import { ConfigButton } from "./config-button"
import { ReaderEmpty } from "@/features/bible-reader/components/reader-empty"
import type { BiblePaneState } from "../types"

/**
 * The workspace content area. On desktop (md+) a single header line combines
 * the tab list with the Abas/Grade toggle and the new-pane picker. On
 * mobile the tab bar moves to the bottom (near the global nav). Panes can be
 * Bible passages, notes, or sermons (Phase 3). When no pane exists, an
 * empty state with a call-to-action is shown.
 */
export function WorkspaceView() {
  const { activePane, openPane, panes, updatePaneState, layoutMode } = useWorkspace()
  const settings = useReaderSettings()

  const openFirstPane = () =>
    openPane({ type: "bible", bookId: "gen", chapter: 1, versionId: "ara" } as BiblePaneState)

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Desktop header — tabs + Abas/Grade toggle + picker on one line */}
      {panes.length > 0 && (
        <div className="hidden md:flex items-center gap-2 border-b border-border bg-muted/40 px-2 py-1.5 shrink-0">
          <WorkspaceTabs />
          <div className="flex-1" />
          <WorkspaceToolbar />
          <ConfigButton />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 h-full overflow-hidden pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-0">
        {panes.length === 0 ? (
          <ReaderEmpty onOpenSidebar={openFirstPane} />
        ) : layoutMode === "grid" ? (
          <WorkspaceGrid />
        ) : !activePane ? (
          <ReaderEmpty onOpenSidebar={openFirstPane} />
        ) : activePane.state.type === "bible" ? (
          <BiblePaneView
            key={activePane.id}
            pane={activePane}
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
        ) : activePane.state.type === "note" ? (
          <NotePaneView key={activePane.id} />
        ) : activePane.state.type === "sermon" ? (
          <SermonPaneView key={activePane.id} paneId={activePane.id} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Em breve
          </div>
        )}
      </div>

      {/* Mobile bottom bar — tabs + toggle + picker + settings, above MobileNav */}
      {panes.length > 0 && <WorkspaceMobileBar />}
    </div>
  )
}
