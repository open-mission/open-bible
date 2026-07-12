"use client"

import { BookOpen, Notebook, Presentation } from "lucide-react"
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { useWorkspace } from "../context/workspace-context"
import type { PaneState } from "../types"

const PANE_OPTIONS: {
  type: PaneState["type"]
  label: string
  icon: React.ComponentType
  state: PaneState
}[] = [
  {
    type: "bible",
    label: "Bíblia",
    icon: BookOpen,
    state: { type: "bible", bookId: "gen", chapter: 1, versionId: "ara" },
  },
  { type: "note", label: "Notas", icon: Notebook, state: { type: "note", noteId: "" } },
  {
    type: "sermon",
    label: "Sermões",
    icon: Presentation,
    state: { type: "sermon", sermonId: "" },
  },
]

/**
 * Empty state shown inside a pane (tab or grid item) when it has no content
 * yet — the Sermon pane is the main consumer, since sermons are a future
 * feature. Presents buttons to choose what to open: Bible, Notes, or Sermons.
 * Selecting an option replaces the current pane with that type. New pane
 * types can be added to PANE_OPTIONS in one place.
 */
export function EmptyPaneView({ paneId }: { paneId: string }) {
  const { updatePaneState } = useWorkspace()

  return (
    <div className="flex h-full items-center justify-center p-6">
      <Empty className="max-w-md border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Presentation />
          </EmptyMedia>
          <EmptyTitle>O que você quer abrir aqui?</EmptyTitle>
          <EmptyDescription>
            Escolha o conteúdo desta aba. Você pode misturar Bíblia, Notas e
            outros tipos no seu workspace.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            {PANE_OPTIONS.map((opt, i) => (
              <Button
                key={opt.type}
                variant={i === 0 ? "default" : "outline"}
                onClick={() => updatePaneState(paneId, opt.state)}
                className="flex-1"
              >
                <opt.icon data-icon="inline-start" />
                {opt.label}
              </Button>
            ))}
          </div>
        </EmptyContent>
      </Empty>
    </div>
  )
}
