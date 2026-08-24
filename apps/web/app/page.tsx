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
  const [bookChapterSignal, setBookChapterSignal] = useState(0)
  const isMobile = useIsMobile()
  const { mode, loaded } = useWorkspaceMode()

  const openCommandPalette = useCallback(() => setCommandPaletteOpen(true), [])
  const openBookChapter = useCallback(() => setBookChapterSignal((s) => s + 1), [])

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const target = document.activeElement as HTMLElement | null
      const isInput = target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || target?.isContentEditable
      if (isInput) return

      const isMod = e.metaKey || e.ctrlKey
      const key = e.key.toLowerCase()

      if (isMod && key === "k") {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }

      if (isMod && key === "o") {
        e.preventDefault()
        openBookChapter()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [openBookChapter])

  if (!loaded) {
    return <div className="h-dvh bg-background" />
  }

  return (
    <>
      <SidebarProvider className="h-dvh" defaultOpen={false} style={{ "--sidebar-width-icon": "3.5rem" } as React.CSSProperties}>
        {!isMobile && <AppSidebar onOpenCommandPalette={openCommandPalette} />}
        <SidebarInset className="w-auto overflow-hidden h-full">
          <ViewContainer openBookChapterSignal={bookChapterSignal} />
        </SidebarInset>
      </SidebarProvider>

      {isMobile && <MobileTabBar />}

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onOpenBookChapterDialog={openBookChapter}
      />
    </>
  )
}
