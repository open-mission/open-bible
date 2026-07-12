"use client"

import { Plus, BookOpen, Notebook, Presentation } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useWorkspace } from "../context/workspace-context"
import type { PaneState } from "../types"

/**
 * A "+" button that opens a dropdown menu letting the user choose what type
 * of pane to open: Bible, Notes, or Sermons (placeholder). This replaces the
 * old behavior where "+" always opened a Bible pane.
 *
 * Used in both the tab bar and the toolbar. New pane types can be added here
 * in one place.
 */
export function PaneTypePicker() {
  const { openPane, activePane, panes } = useWorkspace()

  const options: {
    type: PaneState["type"]
    label: string
    icon: React.ReactNode
    state: PaneState
  }[] = [
    {
      type: "bible",
      label: "Bíblia",
      icon: <BookOpen />,
      state: { type: "bible", bookId: "gen", chapter: 1, versionId: "ara" },
    },
    {
      type: "note",
      label: "Notas",
      icon: <Notebook />,
      state: { type: "note", noteId: "" },
    },
    {
      type: "sermon",
      label: "Sermões",
      icon: <Presentation />,
      state: { type: "sermon", sermonId: "" },
    },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Nova aba"
        className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Plus className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="bottom" sideOffset={4}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Abrir nova aba</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {options.map((opt) => (
            <DropdownMenuItem
              key={opt.type}
              onClick={() => openPane(opt.state)}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}