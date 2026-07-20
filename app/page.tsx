"use client"

import { useState, useMemo } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/features/navigation/components/app-sidebar"
import { CommandPalette } from "@/features/navigation/components/command-palette"
import { MobileTabBar } from "@/features/navigation/components/mobile-tab-bar"
import { ViewContainer } from "@/features/navigation/components/view-container"
import { useGlobalShortcuts } from "@/features/navigation/hooks/use-global-shortcuts"
import { useIsMobile } from "@/lib/use-media-query"
import { useWorkspaceMode } from "@/features/workspace/hooks/use-workspace-mode"
import type { ShortcutDefinition } from "@/features/navigation/types"

export default function Home() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const isMobile = useIsMobile()
  const { mode, loaded } = useWorkspaceMode()
  const isAdvanced = mode === "advanced"

  const openCommandPalette = () => setCommandPaletteOpen(true)

  const shortcuts: ShortcutDefinition[] = useMemo(() => [
    {
      id: "command-palette",
      label: "Abrir busca",
      keys: "mod+k",
      action: openCommandPalette,
      group: "global",
    },
  ], [])

  useGlobalShortcuts(shortcuts)

  if (!loaded) {
    return <div className="h-dvh bg-background" />
  }

  if (isAdvanced) {
    return (
      <>
        <ViewContainer onOpenCommandPalette={openCommandPalette} />
        {isMobile && <MobileTabBar />}
        <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
      </>
    )
  }

  return (
    <>
      <SidebarProvider className="h-dvh">
        {!isMobile && <AppSidebar onOpenCommandPalette={openCommandPalette} />}
        <SidebarInset className="w-auto overflow-hidden h-full">
          <ViewContainer />
        </SidebarInset>
      </SidebarProvider>

      {isMobile && <MobileTabBar />}

      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </>
  )
}
