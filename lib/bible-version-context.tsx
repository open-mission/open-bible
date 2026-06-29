"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Verse } from "./types"
import { getVerses as getMockVerses } from "./bible-data"
import { fetchChapterVerses as apiFetchChapterVerses } from "./api-client"
import { database } from "./database/database"

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
  { id: "alm1911", name: "Almeida 1911", filename: "ALM1911.sqlite" },
  { id: "ara", name: "Almeida Revista e Atualizada", filename: "ARA.sqlite" },
  { id: "arc", name: "Almeida Revista e Corrigida", filename: "ARC.sqlite" },
  { id: "as21", name: "Almeida Século 21", filename: "AS21.sqlite" },
  { id: "blivre", name: "Bíblia Livre", filename: "BLIVRE.sqlite" },
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
  isInstalling: boolean
  downloadProgress: { current: number; total: number } | null
  installVersion: (id: string) => Promise<void>
  uninstallVersion: (id: string) => Promise<void>
  getVerses: (bookId: string, chapter: number) => Promise<Verse[]>
  refreshInstalled: () => Promise<void>
  isVersionsLoaded: boolean
}

const BibleVersionContext = createContext<BibleVersionContextValue | null>(null)

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
  const [availableVersions, setAvailableVersions] = useState<AvailableVersion[]>(AVAILABLE_VERSIONS_LIST)
  const [isInstalling, setIsInstalling] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number } | null>(null)
  const [versionMetaCache, setVersionMetaCache] = useState<Record<string, VersionMeta>>({})
  const [isVersionsLoaded, setIsVersionsLoaded] = useState(false)

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
      const cache: Record<string, VersionMeta> = {}
      for (const v of installed) {
        cache[v.id] = v
      }
      setVersionMetaCache((prev) => ({ ...prev, ...cache }))
      setIsVersionsLoaded(true)
    } catch (e) {
      console.error("Failed to load installed SQLite bibles:", e)
      setIsVersionsLoaded(true)
    }
  }, [])

  // Load available versions and refresh installed on mount
  useEffect(() => {
    refreshInstalled()
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
      if (isSavedInstalled) {
        setVersionIdState(saved)
      } else {
        setVersionIdState(installedVersions[0].id)
      }
    }
  }, [defaultVersionId, installedVersions, isVersionsLoaded])

  // If only one offline version and no default was set, use it
  useEffect(() => {
    if (installedVersions.length === 1 && !hasDefaultVersionBeenSet()) {
      const only = installedVersions[0]
      setDefaultVersionIdState(only.id)
      saveDefaultVersionId(only.id)
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

        // Avoid querying if the version is not fully loaded/installed offline yet
        const isInstalled = installedVersions.some((v) => v.id === currentVersion)
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
    [versionId, defaultVersionId, installedVersions]
  )

  const installVersion = useCallback(async (id: string) => {
    const ver = AVAILABLE_VERSIONS.find((v) => v.id === id)
    if (!ver) throw new Error(`Versão ${id} não suportada`)

    setIsInstalling(true)
    setDownloadProgress({ current: 0, total: 100 })
    try {
      const url = `/api/bibles/download/${id}`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Falha ao baixar versão ${id}: ${response.statusText}`)

      const originalLength = response.headers.get("x-original-content-length")
      const contentLength = response.headers.get("content-length")
      const totalBytes = originalLength 
        ? parseInt(originalLength, 10) 
        : (contentLength ? parseInt(contentLength, 10) : 0)

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
            current: receivedBytes,
            total: totalBytes,
          })
        } else {
          setDownloadProgress({
            current: receivedBytes,
            total: receivedBytes + 1000000,
          })
        }
      }

      const buffer = new Uint8Array(receivedBytes)
      let offset = 0
      for (const chunk of chunks) {
        buffer.set(chunk, offset)
        offset += chunk.length
      }

      await database.installBible(id, buffer.buffer)
      await refreshInstalled()
    } finally {
      setIsInstalling(false)
      setDownloadProgress(null)
    }
  }, [refreshInstalled])

  const uninstallVersion = useCallback(async (id: string) => {
    await database.removeBible(id)
    setVersionMetaCache((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    await refreshInstalled()
    if (versionId === id) {
      setVersionId(defaultVersionId)
    }
  }, [refreshInstalled, versionId, setVersionId, defaultVersionId])

  return (
    <BibleVersionContext.Provider
      value={{
        versionId,
        setVersionId,
        defaultVersionId,
        setDefaultVersionId,
        installedVersions,
        availableVersions,
        isInstalling,
        downloadProgress,
        installVersion,
        uninstallVersion,
        getVerses,
        refreshInstalled,
        isVersionsLoaded,
      }}
    >
      {children}
    </BibleVersionContext.Provider>
  )
}

export function useBibleVersion() {
  const ctx = useContext(BibleVersionContext)
  if (!ctx) throw new Error("useBibleVersion must be used within BibleVersionProvider")
  return ctx
}
