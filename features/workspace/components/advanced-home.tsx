"use client"

import { useRouter } from "next/navigation"
import { WorkspaceProvider } from "../context/workspace-context"
import { WorkspaceView } from "./workspace-view"
import { useAutoDownloadAra } from "@/features/bible-reader/hooks/use-auto-download-ara"
import { MobileNav } from "@/features/layout/components/mobile-nav"

/**
 * The "Advanced" reading mode — a workspace with browser-style tabs where the
 * user can open multiple Bible passages (and, in the future, notes and sermons)
 * simultaneously. Each pane has its own translation scope. The auto-download of
 * ARA on first visit is shared with Simple mode.
 */
export function AdvancedHome() {
  useAutoDownloadAra()
  const router = useRouter()

  return (
    <>
      <WorkspaceProvider>
        <div className="h-dvh overflow-hidden bg-background">
          <WorkspaceView />
        </div>
      </WorkspaceProvider>
      <MobileNav activeNav="home" onNavClick={() => router.push("/config")} />
    </>
  )
}

