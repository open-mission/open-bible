"use client"

import { useState, useEffect, useCallback } from "react"
import { AppDock } from "@/features/navigation/components/app-dock"
import { CommandPalette } from "@/features/navigation/components/command-palette"
import { ViewContainer } from "@/features/navigation/components/view-container"
import { useWorkspaceMode } from "@/features/workspace/hooks/use-workspace-mode"

export default function Home() {
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
