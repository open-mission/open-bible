"use client"

import { useAppNavigation } from "../context/app-navigation-context"
import { useWorkspaceMode } from "@/features/workspace/hooks/use-workspace-mode"
import { SimpleHome } from "@/features/workspace/components/simple-home"
import { AdvancedHome } from "@/features/workspace/components/advanced-home"
import { IconNotebook, IconHighlight, IconArrowLeft } from "@tabler/icons-react"
import { useIsMobile } from "@/lib/use-media-query"
import { cn } from "@/lib/utils"

interface StubViewShellProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

function StubViewShell({ title, description, icon: Icon }: StubViewShellProps) {
  const { navigate } = useAppNavigation()
  const isMobile = useIsMobile()

  return (
    <div className={cn(
      "flex flex-col h-full",
      isMobile && "pb-[calc(4.875rem+env(safe-area-inset-bottom))]"
    )}>
      <header className="flex items-center gap-3 border-b border-border bg-background/95 backdrop-blur px-4 py-3 shrink-0">
        <button
          onClick={() => navigate("reader")}
          aria-label="Voltar"
          className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <IconArrowLeft className="size-4" />
        </button>
        <h1 className="font-sans text-base font-medium">{title}</h1>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground p-4">
        <Icon className="size-12 text-muted-foreground/30" />
        <div className="text-center">
          <p className="text-sm max-w-[280px]">{description}</p>
        </div>
      </div>
    </div>
  )
}

function NotesStubView() {
  return (
    <StubViewShell
      title="Notas"
      description="Em breve você poderá acessar todas as suas notas aqui."
      icon={IconNotebook}
    />
  )
}

function HighlightsStubView() {
  return (
    <StubViewShell
      title="Destaques"
      description="Em breve você poderá visualizar todos os seus destaques aqui."
      icon={IconHighlight}
    />
  )
}

export function ViewContainer({ onOpenCommandPalette, openBookChapterSignal }: {
  onOpenCommandPalette?: () => void
  openBookChapterSignal?: number
}) {
  const { activeView } = useAppNavigation()
  const { mode, loaded } = useWorkspaceMode()

  if (!loaded) {
    return <div className="h-full bg-background" />
  }

  if (mode === "advanced") {
    switch (activeView) {
      case "reader":
        return <AdvancedHome />
      case "notes":
        return <NotesStubView />
      case "highlights":
        return <HighlightsStubView />
      default:
        return <AdvancedHome />
    }
  }

  switch (activeView) {
    case "reader":
      return <SimpleHome openBookChapterSignal={openBookChapterSignal} />
    case "notes":
      return <NotesStubView />
    case "highlights":
      return <HighlightsStubView />
    default:
      return <SimpleHome openBookChapterSignal={openBookChapterSignal} />
  }
}
