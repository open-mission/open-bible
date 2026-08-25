/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useState, useEffect, useMemo } from "react"
import { useKeyboard } from "@opentui/react"
import { BibleManager } from "../db/bible-manager.js"
import { InstalledStore } from "../db/installed-store.js"
import { listRemoteVersions, downloadBible } from "../services/download.js"
import { filterBooks } from "../lib/filter-books.js"
import { parseReference } from "../lib/parse-reference.js"
import { NavigationState } from "../state/navigation-state.js"
import { BookPicker } from "./components/BookPicker.js"

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

  // download picker (existing, now on D)
  const [showDownloadPicker, setShowDownloadPicker] = useState(false)
  const [remoteVersions, setRemoteVersions] = useState<{ id: string; name: string }[]>([])
  const [pickerIdx, setPickerIdx] = useState(0)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [pickerError, setPickerError] = useState<string | null>(null)
  const [loadingRemote, setLoadingRemote] = useState(false)

  // book picker (new, on d) - spec 0005
  const [showBookPicker, setShowBookPicker] = useState(false)
  const [bookQuery, setBookQuery] = useState("")
  const [bookPickerChapter, setBookPickerChapter] = useState<number | null>(null)
  const [bookPickerVerse, setBookPickerVerse] = useState<number | null>(null)

  // global ref input (:) and history (h)
  const [showRefInput, setShowRefInput] = useState(false)
  const [refInput, setRefInput] = useState("")
  const [showHistory, setShowHistory] = useState(false)

  const manager = new BibleManager()
  const navState = useMemo(() => new NavigationState(), [])

  const refreshInstalled = () => {
    const store = new InstalledStore()
    const installed = store.list()
    store.close()
    setVersions(installed.map(v => ({ id: v.id, name: v.name })))
    if (installed.length > 0) {
      // restore last position if available
      const last = navState.lastBook && installed.some(v => v.id === navState.lastBook) ? navState.lastBook : installed[0].id
      // Actually lastBook is bookId, not version. For version, use first installed or lastBook's version? Simplify: use first installed
      if (!selectedVersion) setSelectedVersion(installed[0].id)
      // If navState has lastChapter for that book, restore chapter
      if (navState.lastChapter) setChapter(navState.lastChapter)
      setPanel("books")
    } else {
      setSelectedVersion(null)
    }
  }

  useEffect(() => {
    refreshInstalled()
    // restore books/chapter from navState if possible
    if (navState.lastBook) {
      // will be handled after books load
    }
  }, [])

  useEffect(() => {
    if (!selectedVersion) return
    const b = manager.getBooks(selectedVersion)
    setBooks(b as any)
    if (b.length > 0) {
      const idx = navState.lastBook ? b.findIndex(x => x.id === navState.lastBook) : 0
      setBookIdx(idx >= 0 ? idx : 0)
      if (navState.lastChapter) setChapter(navState.lastChapter)
      else setBookIdx(0)
    }
  }, [selectedVersion])

  useEffect(() => {
    if (!selectedVersion || books.length === 0) return
    const book = books[bookIdx]
    if (!book) return
    const vs = manager.getChapterVerses(selectedVersion, book.id, chapter)
    setVerses(vs)
    // persist history
    if (book && vs.length > 0) {
      navState.addHistory({ bookId: book.id, chapter, verse: vs[0].verse })
    }
  }, [selectedVersion, books, bookIdx, chapter])

  const openDownloadPicker = async () => {
    setShowDownloadPicker(true)
    setPickerError(null)
    setLoadingRemote(true)
    try {
      const remotes = await listRemoteVersions()
      setRemoteVersions(remotes)
      setPickerIdx(0)
    } catch (e) {
      setPickerError((e as Error).message)
    } finally {
      setLoadingRemote(false)
    }
  }

  const handleDownload = async (versionId: string) => {
    setDownloading(versionId)
    setPickerError(null)
    try {
      await downloadBible(versionId)
      refreshInstalled()
      setSelectedVersion(versionId)
      setPanel("books")
      setShowDownloadPicker(false)
      setError(null)
    } catch (e) {
      setPickerError((e as Error).message)
    } finally {
      setDownloading(null)
    }
  }

  const handleBookPickerSelect = (bookId: string, chap?: number, verse?: number) => {
    const idx = books.findIndex(b => b.id === bookId)
    if (idx >= 0) setBookIdx(idx)
    if (chap) setChapter(chap)
    // if verse provided, we could scroll to verse but for now just set chapter and let verses load, history will handle
    if (chap && verse) {
      navState.addHistory({ bookId, chapter: chap, verse })
    } else if (chap) {
      navState.addHistory({ bookId, chapter: chap })
    } else {
      navState.addHistory({ bookId, chapter: 1 })
    }
    setShowBookPicker(false)
    setPanel("verses")
  }

  useKeyboard((key) => {
    // history modal priority
    if (showHistory) {
      if (key.name === "escape" || key.name === "q" || key.name === "h") {
        setShowHistory(false)
        return
      }
      if (key.name === "up" || key.name === "down") {
        // simple: close and handle via picker? For now just close
      }
      return
    }
    // ref input priority
    if (showRefInput) {
      if (key.name === "escape") {
        setShowRefInput(false)
        setRefInput("")
        return
      }
      if (key.name === "return" || key.name === "enter") {
        const parsed = parseReference(refInput)
        if (parsed) {
          const idx = books.findIndex(b => b.id === parsed.bookId)
          if (idx >= 0) setBookIdx(idx)
          setChapter(parsed.chapter)
          navState.addHistory({ bookId: parsed.bookId, chapter: parsed.chapter, verse: parsed.verse })
          setPanel("verses")
          setShowRefInput(false)
          setRefInput("")
          setError(null)
        } else {
          setError(`Referência inválida: ${refInput} (ex: Gn 1:1)`)
        }
        return
      }
      // typing handled via input component? For now, we use simple text input via key.name
      // This is simplified: actual input would be via <input> component, but we handle via key events for demo
      if (key.sequence && key.sequence.length === 1 && !key.ctrl && !key.meta) {
        setRefInput(prev => prev + key.sequence)
      } else if (key.name === "backspace") {
        setRefInput(prev => prev.slice(0, -1))
      }
      return
    }
    // download picker priority (D)
    if (showDownloadPicker) {
      if (key.name === "escape" || key.name === "q") {
        setShowDownloadPicker(false)
        return
      }
      if (key.name === "up") setPickerIdx(i => Math.max(0, i - 1))
      if (key.name === "down") setPickerIdx(i => Math.min(remoteVersions.length - 1, i + 1))
      if ((key.name === "return" || key.name === "enter") && !downloading) {
        const v = remoteVersions[pickerIdx]
        if (v) handleDownload(v.id)
      }
      return
    }
    // book picker priority (d)
    if (showBookPicker) {
      if (key.name === "escape") {
        setShowBookPicker(false)
        return
      }
      // BookPicker handles its own filtering via its internal input, but we also handle Esc
      return
    }

    if (key.name === "q" || (key.ctrl && key.name === "c")) {
      process.exit(0)
    }
    if (key.name === "?" ) {
      setError("Atalhos: d picker livros, : referência Gn 1:1, h histórico, Tab painel, n/p capítulo, Esc volta, q sai")
      setTimeout(() => setError(null), 3000)
      return
    }
    if (key.name === ":") {
      setShowRefInput(true)
      setRefInput("")
      return
    }
    if (key.name === "h") {
      setShowHistory(true)
      return
    }
    if (key.name === "d") {
      setShowBookPicker(true)
      return
    }
    if (key.name === "D") {
      openDownloadPicker()
      return
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
      if (key.name === "backspace") {
        const hist = navState.history[1]
        if (hist) {
          const idx = books.findIndex(b => b.id === hist.bookId)
          if (idx >= 0) setBookIdx(idx)
          setChapter(hist.chapter)
        }
      }
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
  const installedIds = new Set(versions.map(v => v.id))

  return (
    <box flexDirection="column" width="100%" height="100%" backgroundColor="#0f172a">
      <box height={1} backgroundColor="#1e293b" paddingLeft={1} paddingRight={1}>
        <text>
          <strong>Open Bible TUI</strong>  {selectedVersion ? `| ${selectedVersion}` : ""} {currentBook ? `| ${currentBook.name} ${chapter}` : ""}  | Tab: painel  q: sair  n/p: cap  d: picker  ::ref  h:hist
        </text>
      </box>

      {showRefInput ? (
        <box flexDirection="column" flexGrow={1} padding={1} borderStyle="single" borderColor="cyan">
          <text><strong>Referência (ex: Gn 1:1, 1Jo 3:16) — Enter navega, Esc fecha</strong></text>
          <text>{refInput}_</text>
          {error && <text color="red">{error}</text>}
        </box>
      ) : showHistory ? (
        <box flexDirection="column" flexGrow={1} padding={1} borderStyle="single" borderColor="cyan">
          <text><strong>Histórico — h fechar, Backspace volta</strong></text>
          {navState.history.length === 0 ? <text>Nenhum histórico</text> : navState.history.map((h, i) => (
            <text key={i}>{h.bookId} {h.chapter}{h.verse ? `:${h.verse}` : ""}</text>
          ))}
        </box>
      ) : showDownloadPicker ? (
        <box flexDirection="column" flexGrow={1} padding={1} borderStyle="single" borderColor="cyan">
          <text><strong>Baixar versão — ↑↓ navegar  Enter baixar  Esc fechar</strong></text>
          {loadingRemote ? (
            <text>Carregando versões remotas...</text>
          ) : (
            <box flexDirection="column" flexGrow={1}>
              {remoteVersions.map((v, idx) => {
                const selected = idx === pickerIdx
                const installed = installedIds.has(v.id)
                const isDownloading = downloading === v.id
                return (
                  <text key={v.id} backgroundColor={selected ? "blue" : undefined}>
                    {selected ? "› " : "  "}{v.id} — {v.name} {installed ? "(instalada)" : ""} {isDownloading ? "⏳ baixando..." : ""}
                  </text>
                )
              })}
            </box>
          )}
          {pickerError && <text color="red">{pickerError}</text>}
          {downloading && <text>Baixando {downloading}... aguarde</text>}
        </box>
      ) : showBookPicker ? (
        <BookPicker books={books} onSelect={handleBookPickerSelect} onClose={() => setShowBookPicker(false)} />
      ) : versions.length === 0 ? (
        <box flexDirection="column" flexGrow={1} justifyContent="center" alignItems="center">
          <text>Nenhuma versão instalada.</text>
          <text>Pressione D para baixar (picker) ou d para picker livros</text>
          <text dimColor>ou: open-bible-tui download ara</text>
          {error && <text color="red">{error}</text>}
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
        <text dimColor>↑↓ navegar  Enter selecionar  Esc voltar  Tab painel  n/p próximo/anterior cap  d picker  : ref  h hist  ? ajuda  q sair</text>
      </box>
    </box>
  )
}
