"use client"

/**
 * Pane model for the workspace (tab/grid) system.
 *
 * A Pane is an open "document" in the workspace — today a Bible passage,
 * tomorrow a note or a sermon. Each pane carries its own state so multiple
 * passages (and translations) can be open simultaneously.
 */

export type PaneType = "bible" | "note" | "sermon"

/** A Bible passage pane — book/chapter are per-pane, versionId is per-pane. */
export interface BiblePaneState {
  type: "bible"
  bookId: string
  chapter: number
  versionId: string
}

/** A note pane (Phase 3). */
export interface NotePaneState {
  type: "note"
  noteId: string
}

/** A sermon pane (Phase 3 — placeholder). */
export interface SermonPaneState {
  type: "sermon"
  sermonId: string
}

export type PaneState = BiblePaneState | NotePaneState | SermonPaneState

export interface Pane {
  id: string
  title: string
  state: PaneState
}

/** Workspace layout mode. `grid` (tiling) arrives in Phase 2. */
export type LayoutMode = "tabs" | "grid"
