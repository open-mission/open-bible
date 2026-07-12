"use client"

import { EmptyPaneView } from "./empty-pane-view"

/**
 * Pane for sermons (future feature). Shows the empty pane picker so the user
 * can open Bible/Notes here (or Sermons, which remains a placeholder until the
 * feature ships).
 */
export function SermonPaneView({ paneId }: { paneId: string }) {
  return <EmptyPaneView paneId={paneId} />
}