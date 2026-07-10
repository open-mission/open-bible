"use client"

import type { NoteWithRefs } from "../types"
import { NoteCard } from "./note-card"

export function NoteList({
  entries,
  loading,
  onChanged,
}: {
  entries: NoteWithRefs[]
  loading?: boolean
  onChanged?: () => void
}) {
  if (loading) {
    return <p className="text-xs text-muted-foreground">Carregando notas…</p>
  }
  if (entries.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Nenhuma nota para este versículo ainda.
      </p>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {entries.map((e) => (
        <NoteCard key={e.note.id} entry={e} onChanged={onChanged} />
      ))}
    </div>
  )
}
