"use client"

import { useCallback, useState } from "react"
import { NotesProvider } from "@/features/notes/context/notes-context"
import { NotesBrowser } from "@/features/notes/components/notes-browser"
import type { NoteTarget } from "@/features/notes/types"

/**
 * A workspace pane that shows the full notes browser (all notes, search,
 * detail, edit, compose) embedded in a tab or grid pane. Uses a minimal
 * NotesProvider wrapper so that useNoteMutations (which calls
 * useNotesContext().refresh) works without a real Bible chapter context.
 */
export function NotePaneView() {
  // Dummy state for NotesProvider — the note pane is not tied to a specific
  // chapter, so these stay null/false. The browser loads all notes via
  // useAllNotes independently.
  const [notesTarget, setNotesTarget] = useState<NoteTarget | null>(null)
  const [notesOpen] = useState(false)

  const handleOpen = useCallback((t: NoteTarget) => setNotesTarget(t), [])
  const handleClose = useCallback(() => setNotesTarget(null), [])

  return (
    <NotesProvider
      bookId={null}
      chapter={null}
      versionId="ara"
      open={notesOpen}
      target={notesTarget}
      onOpen={handleOpen}
      onClose={handleClose}
    >
      <div className="h-full">
        <NotesBrowser
          mode="all"
          active
          embedded
          className="h-full"
        />
      </div>
    </NotesProvider>
  )
}