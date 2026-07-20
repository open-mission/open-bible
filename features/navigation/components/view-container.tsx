"use client"

import { useAppNavigation } from "../context/app-navigation-context"
import { useWorkspaceMode } from "@/features/workspace/hooks/use-workspace-mode"
import { SimpleHome } from "@/features/workspace/components/simple-home"
import { AdvancedHome } from "@/features/workspace/components/advanced-home"
import { IconNotebook, IconHighlight } from "@tabler/icons-react"

function NotesStubView() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
      <IconNotebook className="size-12 text-muted-foreground/30" />
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground mb-1">Notas</h2>
        <p className="text-sm max-w-[280px]">
          Em breve você poderá acessar todas as suas notas aqui.
        </p>
      </div>
    </div>
  )
}

function HighlightsStubView() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
      <IconHighlight className="size-12 text-muted-foreground/30" />
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground mb-1">Destaques</h2>
        <p className="text-sm max-w-[280px]">
          Em breve você poderá visualizar todos os seus destaques aqui.
        </p>
      </div>
    </div>
  )
}

export function ViewContainer() {
  const { activeView } = useAppNavigation()
  const { mode, loaded } = useWorkspaceMode()

  if (!loaded) {
    return <div className="h-full bg-background" />
  }

  switch (activeView) {
    case "reader":
      return mode === "advanced" ? <AdvancedHome /> : <SimpleHome />
    case "notes":
      return <NotesStubView />
    case "highlights":
      return <HighlightsStubView />
    default:
      return mode === "advanced" ? <AdvancedHome /> : <SimpleHome />
  }
}
