"use client"

import { useState } from "react"
import { database } from "@/lib/database/database"

export default function DatabaseTestPage() {
  const [log, setLog] = useState<string[]>([])
  const add = (m: string) => setLog((l) => [...l, m])

  async function run() {
    setLog([])
    try {
      add("initialize()…")
      await database.initialize()
      add("✓ initialized (app.db created + migrated)")

      // Notes round-trip
      const note = await database.notes.create({ title: "Salvação", content: "Tema de estudo" })
      add(`✓ note created: ${note.id}`)
      await database.noteReferences.add({ noteId: note.id, bible: "ara", book: "jhn", chapter: 3, verseStart: 16, verseEnd: null, order: 0 })
      await database.noteReferences.add({ noteId: note.id, bible: "ara", book: "rom", chapter: 8, verseStart: 1, verseEnd: 4, order: 1 })
      const refs = await database.noteReferences.listByNote(note.id)
      add(`✓ note has ${refs.length} references`)
      await database.notes.update(note.id, { content: "atualizado" })
      const list = await database.notes.list()
      add(`✓ notes list length: ${list.length}`)

      // Bible install + query
      add("installing ara.db…")
      const buf = await fetch("/bibles/ara.db").then((r) => r.arrayBuffer())
      await database.installBible("ara", buf)
      add(`✓ installed bibles: ${(await database.listInstalledBibles()).join(", ")}`)
      const bible = await database.openBible("ara")
      add(`✓ bible name: ${await bible.name()}`)
      const books = await bible.getBooks()
      add(`✓ books: ${books.length} (first: ${books[0]?.name})`)
      const verses = await bible.getChapterVerses("jhn", 3)
      add(`✓ John 3 verses: ${verses.length}; v16: ${verses.find((v) => v.verse === 16)?.text?.slice(0, 40)}…`)

      // Cleanup soft-deleted note
      await database.notes.delete(note.id)
      add(`✓ after soft-delete, notes list: ${(await database.notes.list()).length}`)
      add("ALL CHECKS PASSED")
    } catch (e) {
      add(`✗ ERROR: ${(e as Error).message}`)
    }
  }

  return (
    <div className="p-6 font-mono text-sm">
      <button onClick={run} className="rounded bg-blue-600 px-4 py-2 text-white">Run database checks</button>
      <pre className="mt-4 whitespace-pre-wrap">{log.join("\n")}</pre>
    </div>
  )
}
