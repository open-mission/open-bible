/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useState, useEffect } from "react"
import { useKeyboard } from "@opentui/react"
import { BibleManager } from "../db/bible-manager.js"
import { InstalledStore } from "../db/installed-store.js"
import { listRemoteVersions, downloadBible } from "../services/download.js"

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

  // picker (like web version picker)
  const [showPicker, setShowPicker] = useState(false)
  const [remoteVersions, setRemoteVersions] = useState<{ id: string; name: string }[]>([])
  const [pickerIdx, setPickerIdx] = useState(0)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [pickerError, setPickerError] = useState<string | null>(null)
  const [loadingRemote, setLoadingRemote] = useState(false)

  const manager = new BibleManager()

  const refreshInstalled = () => {
    const store = new InstalledStore()
    const installed = store.list()
    store.close()
    setVersions(installed.map(v => ({ id: v.id, name: v.name })))
    if (installed.length > 0 && !selectedVersion) {
      setSelectedVersion(installed[0].id)
      setPanel("books")
    } else if (installed.length === 0) {
      setSelectedVersion(null)
    }
  }

  useEffect(() => {
    refreshInstalled()
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

  const openPicker = async () => {
    setShowPicker(true)
    setPickerError(null)
    setLoadingRemote(true)
    try {
      const remotes = await listRemoteVersions()
      // filter out already installed? keep all but mark installed
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
      setShowPicker(false)
      setError(null)
    } catch (e) {
      setPickerError((e as Error).message)
    } finally {
      setDownloading(null)
    }
  }

  useKeyboard((key) => {
    // picker has priority
    if (showPicker) {
      if (key.name === "escape" || key.name === "q") {
        setShowPicker(false)
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

    if (key.name === "q" || (key.ctrl && key.name === "c")) {
      process.exit(0)
    }
    // open picker like web version picker
    if (key.name === "d") {
      openPicker()
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
          <strong>Open Bible TUI</strong>  {selectedVersion ? `| ${selectedVersion}` : ""} {currentBook ? `| ${currentBook.name} ${chapter}` : ""}  | Tab: painel  q: sair  n/p: cap  d: baixar
        </text>
      </box>

      {showPicker ? (
        <box flexDirection="column" flexGrow={1} padding={1} borderStyle="single" borderColor="cyan">
          <text><strong>Baixar versão (picker como na web) — ↑↓ navegar  Enter baixar  Esc fechar</strong></text>
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
          {downloading && <text>Baixando {downloading}... aguarde (R2 direto se API offline)</text>}
          <text dimColor>Picker usa API /api/bibles se disponível, senão lista estática R2 (16 versões). Fallback direto https://pub-2e657f.../bibles/FILE.sqlite</text>
        </box>
      ) : versions.length === 0 ? (
        <box flexDirection="column" flexGrow={1} justifyContent="center" alignItems="center">
          <text>Nenhuma versão instalada.</text>
          <text>Pressione d para abrir o picker e baixar (como na web)</text>
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
        <text dimColor>↑↓ navegar  Enter selecionar  Esc voltar  Tab painel  n/p próximo/anterior cap  d baixar versão  q sair</text>
      </box>
    </box>
  )
}
