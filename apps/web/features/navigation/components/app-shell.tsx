"use client"

import { useState, useEffect, useCallback } from "react"
import { AppDock } from "./app-dock"
import { CommandPalette } from "./command-palette"
import { ViewContainer } from "./view-container"
import { useWorkspaceMode } from "@/features/workspace/hooks/use-workspace-mode"

/**
 * Shared application shell used by the reader (`/`), notes (`/notes`) and
 * highlights (`/highlights`) routes. Hosts the navigation dock, command
 * palette and the switchable view container, so every canonical URL renders
 * the same chrome and the URL stays the source of truth for the active view.
 */
export function AppShell() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [bookChapterSignal, setBookChapterSignal] = useState(0)
  const { loaded } = useWorkspaceMode()

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
      <div className="flex h-dvh flex-col overflow-hidden bg-background">
        <div className="flex flex-1 flex-col overflow-hidden pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
          <ViewContainer openBookChapterSignal={bookChapterSignal} />
        </div>
        <AppDock onOpenCommandPalette={() => setCommandPaletteOpen(true)} />
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onOpenBookChapterDialog={openBookChapter}
      />
    </>
  )
}
