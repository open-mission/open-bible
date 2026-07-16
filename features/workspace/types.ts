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
  isNew?: boolean
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

/** Workspace layout mode — `tabs` (browser-style) or `grid` (tiling, tmux/i3wm). */
export type LayoutMode = "tabs" | "grid"

// ─── Layout tree (Phase 2 — tiling grid) ─────────────────────────────────────

export type LayoutDirection = "horizontal" | "vertical"

/** A leaf node — holds a single pane reference. */
export interface LayoutLeaf {
  type: "leaf"
  paneId: string
}

/** A split node — divides space among children in a direction, with relative sizes. */
export interface LayoutSplit {
  type: "split"
  id: string
  direction: LayoutDirection
  children: LayoutNode[]
  /** Relative sizes (percentages, sum = 100). Length matches children. */
  sizes: number[]
}

/** A node in the layout tree — either a leaf (pane) or a split (container). */
export type LayoutNode = LayoutLeaf | LayoutSplit
