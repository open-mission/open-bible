"use client"

import { BottomSheet } from "@/components/ui/bottom-sheet"
import { useNotesContext } from "../context/notes-context"
import { NotesBrowser } from "./notes-browser"

export function NoteSheet() {
  const { open, target, closeNotePanel } = useNotesContext()

  return (
    <BottomSheet open={open} onClose={closeNotePanel}>
      <div className="flex h-[min(92dvh,720px)] flex-col">
        <NotesBrowser
          mode="target"
          target={target}
          active={open}
          embedded
          onRequestClose={closeNotePanel}
          className="h-full"
        />
      </div>
    </BottomSheet>
  )
}
