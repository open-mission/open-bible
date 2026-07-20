"use client"

import { useState, useEffect, useCallback } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/features/navigation/components/app-sidebar"
import { CommandPalette } from "@/features/navigation/components/command-palette"
import { MobileTabBar } from "@/features/navigation/components/mobile-tab-bar"
import { ViewContainer } from "@/features/navigation/components/view-container"
import { useIsMobile } from "@/lib/use-media-query"
import { useWorkspaceMode } from "@/features/workspace/hooks/use-workspace-mode"

export default function Home() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const isMobile = useIsMobile()
  const { mode, loaded } = useWorkspaceMode()

  const openCommandPalette = useCallback(() => setCommandPaletteOpen(true), [])

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const isInput = document.activeElement instanceof HTMLInputElement
        || document.activeElement instanceof HTMLTextAreaElement
        || (document.activeElement as HTMLElement)?.isContentEditable
      if (isInput) return

      const isMod = e.metaKey || e.ctrlKey
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  if (!loaded) {
    return <div className="h-dvh bg-background" />
  }

  return (
    <>
      <SidebarProvider className="h-dvh">
        {!isMobile && <AppSidebar onOpenCommandPalette={openCommandPalette} />}
        <SidebarInset className="w-auto overflow-hidden h-full">
          <ViewContainer onOpenCommandPalette={openCommandPalette} />
        </SidebarInset>
      </SidebarProvider>

      {isMobile && <MobileTabBar />}

      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </>
  )
}
