"use client"

import { WorkspaceProvider } from "../context/workspace-context"
import { WorkspaceView } from "./workspace-view"
import { useAutoDownloadAra } from "@/features/bible-reader/hooks/use-auto-download-ara"

/**
 * The "Advanced" reading mode — a workspace with browser-style tabs where the
 * user can open multiple Bible passages (and, in the future, notes and sermons)
 * simultaneously. Each pane has its own translation scope. The auto-download of
 * ARA on first visit is shared with Simple mode.
 */
export function AdvancedHome() {
  useAutoDownloadAra()

  return (
    <WorkspaceProvider>
      <div className="h-full overflow-hidden bg-background">
        <WorkspaceView />
      </div>
    </WorkspaceProvider>
  )
}

