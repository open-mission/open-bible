"use client"

import { BottomSheet } from "@/components/ui/bottom-sheet"
import { useNotesContext } from "../context/notes-context"
import { NotesPanel } from "./notes-panel"

export function NoteSheet() {
  const { open, closeNotePanel } = useNotesContext()
  return (
    <BottomSheet open={open} onClose={closeNotePanel}>
      <NotesPanel embedded />
    </BottomSheet>
  )
}
