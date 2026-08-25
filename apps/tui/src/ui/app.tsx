/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useState, useEffect } from "react"
import { useKeyboard } from "@opentui/react"
import { BibleManager } from "../db/bible-manager.js"
import { InstalledStore } from "../db/installed-store.js"

type Panel = "versions" | "books" | "chapters" | "verses"

export function App() {
  const [versions, setVersions] = useState<{ id: string; name: string }[]>([])
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [books, setBooks] = useState<{ id: string; name: string; abbreviation: string; testament: string; chapters: number }[]>([])
  const [bookIdx, setBookIdx] = useState(0)
  const [chapter, setChapter] = useState(1)
  const [verses, setVerses] = useState<{ verse: number; text: string }[]>([])
  const [panel, setPanel] = useState<Panel>("versions")
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const manager = new BibleManager()

  useEffect(() => {
    const store = new InstalledStore()
    const installed = store.list()
    store.close()
    setVersions(installed.map(v => ({ id: v.id, name: v.name })))
    if (installed.length > 0) {
      setSelectedVersion(installed[0].id)
      setPanel("books")
    }
  }, [])

  useEffect(() => {
    if (!selectedVersion) return
    const b = manager.getBooks(selectedVersion)
    setBooks(b as any)
    if (b.length > 0) setBookIdx(0)
  }, [selectedVersion])

  useEffect(() => {
    if (!selectedVersion || books.length === 0) return
    const book = books[bookIdx]
    if (!book) return
    const vs = manager.getChapterVerses(selectedVersion, book.id, chapter)
    setVerses(vs)
  }, [selectedVersion, books, bookIdx, chapter])

  useKeyboard((key) => {
    if (key.name === "q" || (key.ctrl && key.name === "c")) {
      process.exit(0)
    }
    if (key.name === "tab") {
      setPanel(p => (p === "versions" ? "books" : p === "books" ? "chapters" : p === "chapters" ? "verses" : "versions"))
    }
    if (panel === "books") {
      if (key.name === "up") setBookIdx(i => Math.max(0, i - 1))
      if (key.name === "down") setBookIdx(i => Math.min(books.length - 1, i + 1))
      if (key.name === "return" || key.name === "enter") {
        setChapter(1)
        setPanel("chapters")
      }
    } else if (panel === "chapters") {
      if (key.name === "up" || key.name === "left") setChapter(c => Math.max(1, c - 1))
      if (key.name === "down" || key.name === "right") {
        const max = books[bookIdx]?.chapters ?? 1
        setChapter(c => Math.min(max, c + 1))
      }
      if (key.name === "return" || key.name === "enter") setPanel("verses")
      if (key.name === "escape") setPanel("books")
    } else if (panel === "verses") {
      if (key.name === "n") {
        const max = books[bookIdx]?.chapters ?? 1
        setChapter(c => Math.min(max, c + 1))
      }
      if (key.name === "p") setChapter(c => Math.max(1, c - 1))
      if (key.name === "escape") setPanel("chapters")
      if (key.name === "b") setPanel("books")
    }
    if (panel === "versions") {
      if (key.name === "up" || key.name === "down") {
        const idx = versions.findIndex(v => v.id === selectedVersion)
        const next = key.name === "up" ? Math.max(0, idx - 1) : Math.min(versions.length - 1, idx + 1)
        setSelectedVersion(versions[next]?.id ?? selectedVersion)
      }
      if (key.name === "return" || key.name === "enter") setPanel("books")
    }
  })

  const currentBook = books[bookIdx]

  return (
    <box flexDirection="column" width="100%" height="100%" backgroundColor="#0f172a">
      <box height={1} backgroundColor="#1e293b" paddingLeft={1} paddingRight={1}>
        <text>
          <strong>Open Bible TUI</strong>  {selectedVersion ? `| ${selectedVersion}` : ""} {currentBook ? `| ${currentBook.name} ${chapter}` : ""}  | Tab: painel  q: sair  n/p: cap
        </text>
      </box>

      {versions.length === 0 ? (
        <box flexGrow={1} justifyContent="center" alignItems="center">
          <text>Nenhuma versão instalada. Use: node dist/index.js download &lt;versão&gt;</text>
        </box>
      ) : (
        <box flexDirection="row" flexGrow={1}>
          <box flexDirection="column" width={28} borderStyle="single" borderColor={panel === "books" ? "cyan" : "gray"} padding={1}>
            <text><strong>Livros {panel === "books" ? "●" : ""}</strong></text>
            <box flexDirection="column" flexGrow={1}>
              {books.slice(Math.max(0, bookIdx - 10), bookIdx + 10).map((b, idx) => {
                const realIdx = Math.max(0, bookIdx - 10) + idx
                const selected = realIdx === bookIdx
                return (
                  <text key={b.id} backgroundColor={selected && panel === "books" ? "blue" : undefined}>
                    {selected ? "› " : "  "}{b.abbreviation} {b.name} ({b.chapters})
                  </text>
                )
              })}
            </box>
          </box>

          <box flexDirection="column" flexGrow={1} padding={1} borderStyle="single" borderColor={panel === "chapters" || panel === "verses" ? "cyan" : "gray"}>
            <box height={3} flexDirection="column">
              <text><strong>Capítulos {panel === "chapters" ? "●" : ""}</strong> {currentBook ? `(${currentBook.name} - ${currentBook.chapters} caps)` : ""}</text>
              <box flexDirection="row" flexWrap="wrap">
                {currentBook && Array.from({ length: currentBook.chapters }, (_, i) => i + 1).slice(0, 30).map(n => (
                  <text key={n} backgroundColor={n === chapter ? "blue" : undefined} paddingLeft={1} paddingRight={1}>
                    {n}
                  </text>
                ))}
              </box>
            </box>

            <box flexDirection="column" flexGrow={1} borderStyle="single" borderColor={panel === "verses" ? "cyan" : undefined} padding={1}>
              <text><strong>{currentBook?.name} {chapter} {panel === "verses" ? "●" : ""}</strong></text>
              <box flexDirection="column" flexGrow={1}>
                {verses.length === 0 ? (
                  <text dimColor>Sem versículos ou capítulo inválido</text>
                ) : (
                  verses.map(v => (
                    <text key={v.verse}>
                      <strong>{v.verse}</strong> {v.text}
                    </text>
                  ))
                )}
              </box>
              {error && <text color="red">{error}</text>}
            </box>
          </box>
        </box>
      )}

      <box height={1} backgroundColor="#1e293b" paddingLeft={1}>
        <text dimColor>↑↓ navegar  Enter selecionar  Esc voltar  Tab painel  n/p próximo/anterior cap  / busca  d download</text>
      </box>
    </box>
  )
}
