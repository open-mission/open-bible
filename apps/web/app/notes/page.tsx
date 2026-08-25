"use client"

import { NotesProvider } from "@/features/notes/context/notes-context"
import { NotesWorkspace } from "@/features/notes/components/notes-workspace"

export default function NotesPage() {
  return (
    <NotesProvider
      bookId={null}
      chapter={null}
      versionId="ara"
      open
      target={null}
      onOpen={() => undefined}
      onClose={() => undefined}
    >
      <main className="min-h-[100dvh] bg-background px-4 py-6 sm:px-8 sm:py-10">
        <div className="mx-auto h-[calc(100dvh-3rem)] max-w-7xl overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm sm:h-[calc(100dvh-5rem)]">
          <NotesWorkspace />
        </div>
      </main>
    </NotesProvider>
  )
}
