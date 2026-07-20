"use client"

import { useState } from "react"
import { IconLayoutGrid } from "@tabler/icons-react"
import { useWorkspace } from "../context/workspace-context"
import { PaneTypePicker } from "./pane-type-picker"
import { ConfigButton } from "./config-button"
import { WorkspaceTabOverview } from "./workspace-tab-overview"

/**
 * Mobile-only bottom bar for the workspace: a compact, Safari-style control that
 * shows the open-tab count (badged) plus the active tab's title, and opens the
 * full-screen tab overview when tapped. The new-pane picker (+) and settings
 * entry sit on the right. Hidden on desktop (md+), where the desktop header
 * combines tabs + Abas/Grade toggle on a single top line.
 *
 * Sits just above the global MobileNav.
 */
export function WorkspaceMobileBar() {
  const { panes, activePane } = useWorkspace()
  const [overviewOpen, setOverviewOpen] = useState(false)

  return (
    <>
      <div className="md:hidden fixed left-0 right-0 z-40 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] border-t border-border bg-background/95 backdrop-blur-md h-14 px-2 flex items-center gap-1">
        {/* Tab switcher: count + active title → opens the overview */}
        <button
          type="button"
          onClick={() => setOverviewOpen(true)}
          aria-label="Abas abertas"
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1.5 text-left transition-colors hover:bg-background/60 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="relative flex shrink-0 items-center justify-center">
            <IconLayoutGrid className="h-5 w-5 text-muted-foreground" />
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
              {panes.length}
            </span>
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium flex items-center gap-2">
            {!activePane && (
              <img
                src="/logo-minimal-transparent.png"
                alt="Open Bible"
                className="h-4 w-auto dark:invert-0 invert select-none pointer-events-none"
              />
            )}
            <span>{activePane?.title ?? "Open Bible"}</span>
          </span>
        </button>

        <PaneTypePicker />
        <ConfigButton />
      </div>

      <WorkspaceTabOverview open={overviewOpen} onClose={() => setOverviewOpen(false)} />
    </>
  )
}
