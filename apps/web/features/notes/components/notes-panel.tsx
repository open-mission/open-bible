"use client"

import { useNotesContext } from "../context/notes-context"
import { NotesBrowser } from "./notes-browser"
import { cn } from "@/lib/utils"

export function NotesPanel({ embedded = false }: { embedded?: boolean }) {
  const { target, open, closeNotePanel } = useNotesContext()

  if (!target) return null

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col bg-background",
        !embedded && "border-l border-border",
      )}
    >
      <NotesBrowser
        mode="target"
        target={target}
        active={open}
        embedded
        onRequestClose={closeNotePanel}
        showCloseButton={!embedded}
        className="h-full"
      />
    </div>
  )
}
