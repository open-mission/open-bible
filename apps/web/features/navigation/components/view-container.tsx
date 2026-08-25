"use client"

import { useAppNavigation } from "../context/app-navigation-context"
import { useWorkspaceMode } from "@/features/workspace/hooks/use-workspace-mode"
import { SimpleHome } from "@/features/workspace/components/simple-home"
import { AdvancedHome } from "@/features/workspace/components/advanced-home"
import { NotesBrowser } from "@/features/notes/components/notes-browser"
import { NotesProvider } from "@/features/notes/context/notes-context"
import { AllHighlightsBrowser } from "@/features/highlights/components/all-highlights-browser"

function HighlightsView({ active }: { active: boolean }) {
  const { navigate } = useAppNavigation()
  return (
    <AllHighlightsBrowser
      active={active}
      onClose={() => navigate("reader")}
    />
  )
}

function NotesView({ active }: { active: boolean }) {
  return (
    <NotesProvider
      bookId={null}
      chapter={null}
      versionId="ara"
      open={false}
      target={null}
      onOpen={() => {}}
      onClose={() => {}}
    >
      <NotesBrowser mode="all" active={active} />
    </NotesProvider>
  )
}

export function ViewContainer({ openBookChapterSignal }: {
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
        return <NotesView active={activeView === "notes"} />
      case "highlights":
        return <HighlightsView active={activeView === "highlights"} />
      default:
        return <AdvancedHome />
    }
  }

  switch (activeView) {
    case "reader":
      return <SimpleHome openBookChapterSignal={openBookChapterSignal} />
    case "notes":
      return <NotesView active={activeView === "notes"} />
    case "highlights":
      return <HighlightsView active={activeView === "highlights"} />
    default:
      return <SimpleHome openBookChapterSignal={openBookChapterSignal} />
  }
}
