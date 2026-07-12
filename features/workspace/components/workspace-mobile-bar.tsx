"use client"

import { useWorkspace } from "../context/workspace-context"
import { WorkspaceTabs } from "./workspace-tabs"
import { WorkspaceToolbar } from "./workspace-toolbar"
import { ConfigButton } from "./config-button"

/**
 * Mobile-only bottom bar for the workspace: the tab list (in tabs mode),
 * the Abas/Grade toggle, the new-pane picker, and a settings entry.
 * Sits just above the global MobileNav. Hidden on desktop (md+), where the
 * desktop header combines tabs + toggle on a single top line.
 */
export function WorkspaceMobileBar() {
  const { layoutMode } = useWorkspace()

  return (
    <div className="md:hidden fixed left-0 right-0 z-40 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] border-t border-border bg-background/95 backdrop-blur-md h-14 px-2 flex items-center gap-1">
      {layoutMode === "tabs" && <WorkspaceTabs />}
      <div className="flex-1" />
      <WorkspaceToolbar />
      <ConfigButton />
    </div>
  )
}
