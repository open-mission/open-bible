"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from "react"
import type { Verse } from "@/lib/types"
import { API_ORIGIN } from "@/lib/api-base"
import { database } from "@/lib/database/database"

export interface VersionMeta {
  id: string
  name: string
  downloadedAt: string
  books: {
    id: string
    name: string
    abbreviation: string
    testament: "old" | "new"
    chapters: number
    chapterVerseCounts: number[]
  }[]
}

export interface AvailableVersion {
  id: string
  name: string
  totalBooks: number
}

export interface LocalAvailableVersion {
  id: string
  name: string
  filename: string
}

export const AVAILABLE_VERSIONS: LocalAvailableVersion[] = [
  { id: "acf", name: "Almeida Corrigida Fiel", filename: "ACF.sqlite" },
  { id: "ara", name: "Almeida Revista e Atualizada", filename: "ARA.sqlite" },
  { id: "arc", name: "Almeida Revista e Corrigida", filename: "ARC.sqlite" },
  { id: "as21", name: "Almeida Século 21", filename: "AS21.sqlite" },
  { id: "jfaa", name: "João Ferreira de Almeida Atualizada", filename: "JFAA.sqlite" },
  { id: "kja", name: "King James Atualizada", filename: "KJA.sqlite" },
  { id: "kjf", name: "King James Fiel", filename: "KJF.sqlite" },
  { id: "mens", name: "A Mensagem", filename: "MENS.sqlite" },
  { id: "naa", name: "Nova Almeida Atualizada", filename: "NAA.sqlite" },
  { id: "nbv", name: "Nova Bíblia Viva", filename: "NBV.sqlite" },
  { id: "ntlh", name: "Nova Tradução na Linguagem de Hoje", filename: "NTLH.sqlite" },
  { id: "nvi", name: "Nova Versão Internacional", filename: "NVI.sqlite" },
  { id: "nvt", name: "Nova Versão Transformadora", filename: "NVT.sqlite" },
  { id: "ol", name: "O Livro", filename: "OL.sqlite" },
  { id: "tb", name: "Tradução Brasileira", filename: "TB.sqlite" },
  { id: "vfl", name: "Versão Fácil de Ler", filename: "VFL.sqlite" },
]

export const AVAILABLE_VERSIONS_LIST: AvailableVersion[] = AVAILABLE_VERSIONS.map((v) => ({
  id: v.id,
  name: v.name,
  totalBooks: 66,
}))

const VERSION_STORAGE_KEY = "openbible:version"
const DEFAULT_VERSION_KEY = "openbible:default-version"
const FALLBACK_VERSION = "ara"

interface BibleVersionContextValue {
  versionId: string
  setVersionId: (id: string) => void
  defaultVersionId: string
  setDefaultVersionId: (id: string) => void
  installedVersions: VersionMeta[]
  availableVersions: AvailableVersion[]
  installVersion: (id: string) => Promise<void>
  uninstallVersion: (id: string) => Promise<void>
  getVerses: (bookId: string, chapter: number) => Promise<Verse[]>
  refreshInstalled: () => Promise<void>
  isVersionsLoaded: boolean
}

const BibleVersionContext = createContext<BibleVersionContextValue | null>(null)

// Per-pane version scope. Allows a subtree (e.g. a workspace pane) to override
// the active versionId/setVersionId while delegating install/listing/getVerses
// to the global provider. This enables parallel reading in different
// translations across workspace panes.
const VersionScopeContext = createContext<{
  versionId: string
  setVersionId: (id: string) => void
} | null>(null)

export function BibleVersionScopeProvider({
  versionId,
  setVersionId,
  children,
}: {
  versionId: string
  setVersionId: (id: string) => void
  children: ReactNode
}) {
  const value = useMemo(() => ({ versionId, setVersionId }), [versionId, setVersionId])
  return <VersionScopeContext.Provider value={value}>{children}</VersionScopeContext.Provider>
}

// Separate context for download progress to avoid re-rendering all BibleVersion consumers
interface DownloadProgressContextValue {
  isInstalling: boolean
  downloadProgress: { current: number; total: number } | null
}

const DownloadProgressContext = createContext<DownloadProgressContextValue>({
  isInstalling: false,
  downloadProgress: null,
})

export function useDownloadProgress() {
  return useContext(DownloadProgressContext)
}

function loadVersionId(fallback: string): string {
  if (typeof window === "undefined") return fallback
  try {
    return localStorage.getItem(VERSION_STORAGE_KEY) || fallback
  } catch {
    return fallback
  }
}

function saveVersionId(id: string) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(VERSION_STORAGE_KEY, id)
  } catch { /* ignore */ }
}

function loadDefaultVersionId(): string {
  if (typeof window === "undefined") return FALLBACK_VERSION
  try {
    return localStorage.getItem(DEFAULT_VERSION_KEY) || FALLBACK_VERSION
  } catch {
    return FALLBACK_VERSION
  }
}

function saveDefaultVersionId(id: string) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(DEFAULT_VERSION_KEY, id)
  } catch { /* ignore */ }
}

function hasDefaultVersionBeenSet(): boolean {
  if (typeof window === "undefined") return false
  try {
    return localStorage.getItem(DEFAULT_VERSION_KEY) !== null
  } catch {
    return false
  }
}

export function BibleVersionProvider({ children }: { children: ReactNode }) {
  const [defaultVersionId, setDefaultVersionIdState] = useState(loadDefaultVersionId)
  const [versionId, setVersionIdState] = useState<string>("")
  const [installedVersions, setInstalledVersions] = useState<VersionMeta[]>([])
  const availableVersions: AvailableVersion[] = AVAILABLE_VERSIONS_LIST
  const [isInstalling, setIsInstalling] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number } | null>(null)
  const [isVersionsLoaded, setIsVersionsLoaded] = useState(false)
  const [versionMetaCache, setVersionMetaCache] = useState<Record<string, VersionMeta>>({})

  // Ref to keep installedVersions stable for getVerses callback (Fix 7)
  const installedVersionsRef = useRef<VersionMeta[]>(installedVersions)
  useEffect(() => {
    installedVersionsRef.current = installedVersions
  }, [installedVersions])

  const refreshInstalled = useCallback(async () => {
    try {
      await database.initialize()
      const sqliteBibles = await database.listInstalledBibles()
      const vfsFiles = await database.manager.listInstalledBibles()
      const installed: VersionMeta[] = []
      for (const id of sqliteBibles) {
        if (!vfsFiles.includes(id)) {
          console.warn(`Installed Bible ${id} file is missing from VFS. Removing reference from metadata DB.`)
          await database.removeBible(id)
          continue
        }
        try {
          const bible = await database.openBible(id)
          const name = await bible.name()
          const books = await bible.getBooks()
          database.manager.closeBible(id).catch(() => {})
          installed.push({
            id,
            name,
            downloadedAt: new Date().toISOString(),
            books: books.map((b) => ({
              id: b.id,
              name: b.name,
              abbreviation: b.abbreviation,
              testament: b.testament,
              chapters: b.chapters,
              chapterVerseCounts: [],
            }))
          })
        } catch (e) {
          console.warn(`Installed Bible ${id} is missing or corrupt in VFS. Removing reference from metadata DB:`, e)
          await database.removeBible(id)
        }
      }
      setInstalledVersions(installed)
      setIsVersionsLoaded(true)
    } catch (e) {
      console.error("Failed to load installed SQLite bibles:", e)
      setIsVersionsLoaded(true)
    }
  }, [])

  // Load available versions and refresh installed on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshInstalled()
    }, 0)
    return () => clearTimeout(timer)
  }, [refreshInstalled])

  // Boot the local SQLite layer once on mount (client-only).
  useEffect(() => {
    database.initialize().catch(() => { /* ignore — feature-detect failures */ })
  }, [])

  // Init versionId after we know the default and installed versions
  useEffect(() => {
    if (isVersionsLoaded && installedVersions.length > 0) {
      const saved = loadVersionId(defaultVersionId)
      const isSavedInstalled = installedVersions.some((v) => v.id === saved)
      const timer = setTimeout(() => {
        if (isSavedInstalled) {
          setVersionIdState(saved)
        } else {
          setVersionIdState(installedVersions[0].id)
        }
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [defaultVersionId, installedVersions, isVersionsLoaded])

  // If only one offline version and no default was set, use it
  useEffect(() => {
    if (installedVersions.length === 1 && !hasDefaultVersionBeenSet()) {
      const only = installedVersions[0]
      const timer = setTimeout(() => {
        setDefaultVersionIdState(only.id)
        saveDefaultVersionId(only.id)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [installedVersions])

  const setVersionId = useCallback((id: string) => {
    setVersionIdState(id)
    saveVersionId(id)
  }, [])

  const setDefaultVersionId = useCallback((id: string) => {
    setDefaultVersionIdState(id)
    saveDefaultVersionId(id)
    setVersionIdState(id)
    saveVersionId(id)
  }, [])

  const getVerses = useCallback(
    async (bookId: string, chapter: number): Promise<Verse[]> => {
      try {
        await database.initialize()
        const currentVersion = versionId || defaultVersionId || "ara"

        // Use ref to avoid re-creating this callback when installedVersions changes
        const isInstalled = installedVersionsRef.current.some((v) => v.id === currentVersion)
        if (!isInstalled) {
          return []
        }

        const bible = await database.openBible(currentVersion)
        return await bible.getChapterVerses(bookId, chapter)
      } catch (e) {
        console.error("Error reading from SQLite WASM:", e)
        return []
      }
    },
    [versionId, defaultVersionId]
  )

  const installVersion = useCallback(async (id: string) => {
    const ver = AVAILABLE_VERSIONS.find((v) => v.id === id)
    if (!ver) throw new Error(`Versão ${id} não suportada`)

    setIsInstalling(true)
    setDownloadProgress({ current: 0, total: 100 })
    try {
      const url = `${API_ORIGIN}/api/bibles/download/${id}`
      console.log(`[install:${id}] iniciando fetch`)
      const response = await fetch(url)
      console.log(`[install:${id}] resposta recebida — status=${response.status} ok=${response.ok}`)
      if (!response.ok) throw new Error(`Falha ao baixar versão ${id}: ${response.statusText}`)

      const originalLength = response.headers.get("x-original-content-length")
      const contentLength = response.headers.get("content-length")
      const contentEncoding = response.headers.get("content-encoding")
      // The proxy gzips the DB: Content-Length is the COMPRESSED size, and the
      // browser transparently decompresses response.body, so the bytes we read are
      // uncompressed. Prefer X-Original-Content-Length (uncompressed). When it is
      // missing (a proxy strips it, or CORS did not expose it cross-origin), a
      // gzipped Content-Length would make progress exceed 100% — treat the total as
      // indeterminate instead.
      let totalBytes = 0
      if (originalLength) {
        totalBytes = parseInt(originalLength, 10)
      } else if (contentEncoding && /gzip/i.test(contentEncoding)) {
        totalBytes = 0
      } else if (contentLength) {
        totalBytes = parseInt(contentLength, 10)
      }

      console.log(`[install:${id}] headers — content-encoding=${contentEncoding} x-original-content-length=${originalLength} content-length=${contentLength} totalBytes=${totalBytes}`)

      const reader = response.body?.getReader()
      if (!reader) throw new Error("Não foi possível ler o corpo da resposta")

      let receivedBytes = 0
      const chunks: Uint8Array[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        chunks.push(value)
        receivedBytes += value.length

        if (totalBytes > 0) {
          setDownloadProgress({
            current: Math.min(receivedBytes, totalBytes),
            total: totalBytes,
          })
        } else {
          setDownloadProgress({
            current: receivedBytes,
            total: receivedBytes + 1000000,
          })
        }
      }

      console.log(`[install:${id}] stream concluído — receivedBytes=${receivedBytes} totalBytes=${totalBytes}`)

      const buffer = new Uint8Array(receivedBytes)
      let offset = 0
      for (const chunk of chunks) {
        buffer.set(chunk, offset)
        offset += chunk.length
      }

      console.log(`[install:${id}] buffer montado — byteLength=${buffer.byteLength}. Chamando installBible...`)
      await database.installBible(id, buffer.buffer)
      console.log(`[install:${id}] installBible concluído. Chamando refreshInstalled...`)
      await refreshInstalled()
      console.log(`[install:${id}] concluído com sucesso!`)
    } catch (err) {
      console.error(`[install:${id}] ERRO:`, err)
      throw err
    } finally {
      setIsInstalling(false)
      setDownloadProgress(null)
    }
  }, [refreshInstalled])

  const uninstallVersion = useCallback(async (id: string) => {
    await database.removeBible(id)
    await refreshInstalled()
    if (versionId === id) {
      setVersionId(defaultVersionId)
    }
  }, [refreshInstalled, versionId, setVersionId, defaultVersionId])

  const bibleContextValue = useMemo<BibleVersionContextValue>(
    () => ({
      versionId,
      setVersionId,
      defaultVersionId,
      setDefaultVersionId,
      installedVersions,
      availableVersions,
      installVersion,
      uninstallVersion,
      getVerses,
      refreshInstalled,
      isVersionsLoaded,
    }),
    [
      versionId,
      setVersionId,
      defaultVersionId,
      setDefaultVersionId,
      installedVersions,
      availableVersions,
      installVersion,
      uninstallVersion,
      getVerses,
      refreshInstalled,
      isVersionsLoaded,
    ]
  )

  const downloadProgressValue = useMemo<DownloadProgressContextValue>(
    () => ({
      isInstalling,
      downloadProgress,
    }),
    [isInstalling, downloadProgress]
  )

  return (
    <DownloadProgressContext.Provider value={downloadProgressValue}>
      <BibleVersionContext.Provider value={bibleContextValue}>
        {children}
      </BibleVersionContext.Provider>
    </DownloadProgressContext.Provider>
  )
}

export function useBibleVersion() {
  const scope = useContext(VersionScopeContext)
  const ctx = useContext(BibleVersionContext)
  if (!ctx) throw new Error("useBibleVersion must be used within BibleVersionProvider")
  // When inside a BibleVersionScopeProvider (e.g. a workspace pane), override
  // versionId/setVersionId with the scoped values; everything else (install,
  // listing, getVerses, defaultVersionId) still comes from the global provider.
  if (scope) {
    return { ...ctx, ...scope }
  }
  return ctx
}
