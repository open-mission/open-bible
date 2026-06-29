"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Verse } from "./types"
import { getVerses as getMockVerses } from "./bible-data"
import { fetchChapterVerses as apiFetchChapterVerses } from "./api-client"
import {
  type VersionMeta,
  type AvailableVersion,
  getInstalledVersions,
  fetchAvailableVersions,
  downloadAndInstallVersion as doDownload,
  getChapterVerses as dbGetChapterVerses,
  getVersionMeta,
  removeVersion as doRemove,
} from "./bible-db"
import { database } from "./database/database"

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
  const [availableVersions, setAvailableVersions] = useState<AvailableVersion[]>([])
  const [isInstalling, setIsInstalling] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number } | null>(null)
  const [versionMetaCache, setVersionMetaCache] = useState<Record<string, VersionMeta>>({})

  const refreshInstalled = useCallback(async () => {
    try {
      await database.initialize()
      const sqliteBibles = await database.listInstalledBibles()
      const installed: VersionMeta[] = []
      for (const id of sqliteBibles) {
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
      }
      setInstalledVersions(installed)
      const cache: Record<string, VersionMeta> = {}
      for (const v of installed) {
        cache[v.id] = v
      }
      setVersionMetaCache((prev) => ({ ...prev, ...cache }))
    } catch (e) {
      console.error("Failed to load installed SQLite bibles:", e)
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

  // Init versionId after we know the default
  useEffect(() => {
    const saved = loadVersionId(defaultVersionId)
    setVersionIdState(saved)
  }, [defaultVersionId])

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
    setIsInstalling(true)
    setDownloadProgress({ current: 0, total: 66 })
    try {
      await doDownload(id, (current, total) => {
        setDownloadProgress({ current, total })
      })
      await refreshInstalled()
    } finally {
      setIsInstalling(false)
      setDownloadProgress(null)
    }
  }, [refreshInstalled])

  const uninstallVersion = useCallback(async (id: string) => {
    await doRemove(id)
    const meta = await getVersionMeta(id)
    if (!meta) {
      setVersionMetaCache((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
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
