"use client"

import { BottomSheet } from "@/components/ui/bottom-sheet"
import { useIsMobile } from "@/lib/use-media-query"
import { NotesBrowser } from "./notes-browser"

interface AllNotesSheetProps {
  open: boolean
  onClose: () => void
}

/**
 * Single all-notes shell for header, dock, and mobile FAB.
 * Desktop: full-screen overlay. Mobile: full-height bottom sheet.
 * Navigation: list → detail → edit (NotesBrowser).
 */
export function AllNotesSheet({ open, onClose }: AllNotesSheetProps) {
  const isMobile = useIsMobile()

  if (!open) return null

  const browser = (
    <NotesBrowser
      mode="all"
      active={open}
      onRequestClose={onClose}
      showCloseButton
      className="h-full"
    />
  )

  if (isMobile) {
    return (
      <BottomSheet open={open} onClose={onClose}>
        <div className="flex h-[min(92dvh,720px)] flex-col">{browser}</div>
      </BottomSheet>
    )
  }

  return (
    <div className="fixed inset-0 z-40 flex animate-in fade-in duration-200">
      <div className="flex h-full w-full flex-col bg-background">{browser}</div>
    </div>
  )
}
