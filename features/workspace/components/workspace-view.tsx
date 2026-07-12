"use client"

import { useWorkspace } from "../context/workspace-context"
import { useReaderSettings } from "../hooks/use-reader-settings"
import { BiblePaneView } from "./bible-pane-view"
import { WorkspaceTabs } from "./workspace-tabs"
import { ReaderEmpty } from "@/features/bible-reader/components/reader-empty"
import type { BiblePaneState } from "../types"

/**
 * Renders the active workspace pane inside a tab bar. When no pane exists yet,
 * shows an empty state with a call-to-action to open the first Bible passage.
 * Note/sermon pane types are handled in Phase 3.
 */
export function WorkspaceView() {
  const { activePane, openPane, panes, updatePaneState } = useWorkspace()
  const settings = useReaderSettings()

  return (
    <div className="flex flex-col h-full min-h-0">
      {panes.length > 0 && <WorkspaceTabs />}
      <div className="flex-1 min-h-0 overflow-hidden">
        {!activePane ? (
          <ReaderEmpty
            onOpenSidebar={() =>
              openPane({ type: "bible", bookId: "gen", chapter: 1, versionId: "ara" } as BiblePaneState)
            }
          />
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
        ) : (
          // note / sermon pane types — Phase 3
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Em breve
          </div>
        )}
      </div>
    </div>
  )
}
