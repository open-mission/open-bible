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

const VERSION_STORAGE_KEY = "openbible:version"
const DEFAULT_VERSION_KEY = "openbible:default-version"
const FALLBACK_VERSION = "acf"

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
    const installed = await getInstalledVersions()
    setInstalledVersions(installed)
    const cache: Record<string, VersionMeta> = {}
    for (const v of installed) {
      cache[v.id] = v
    }
    setVersionMetaCache((prev) => ({ ...prev, ...cache }))
  }, [])

  // Load available versions and refresh installed on mount
  useEffect(() => {
    fetchAvailableVersions()
      .then(setAvailableVersions)
      .catch(() => { /* ignore — offline */ })
    refreshInstalled()
  }, [refreshInstalled])

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
      const toVerses = (raw: { chapter: number; verse: number; text: string }[]) =>
        raw.map((v) => ({
          id: `${bookId}-${chapter}-${v.verse}`,
          bookId,
          chapter: v.chapter,
          verse: v.verse,
          text: v.text,
        }))

      // 1. Try API (online)
      if (typeof navigator !== "undefined" && navigator.onLine) {
        try {
          const result = await apiFetchChapterVerses(versionId, bookId, chapter)
          if (result.verses.length > 0) {
            return toVerses(result.verses)
          }
        } catch { /* fall through */ }
      }

      // 2. Try IndexedDB (offline / installed)
      const installed = versionMetaCache[versionId]
      if (installed) {
        try {
          const verses = await dbGetChapterVerses(versionId, bookId, chapter)
          if (verses && verses.length > 0) {
            return toVerses(verses)
          }
        } catch { /* fall through */ }
      }

      // 3. Fallback to mock data
      return getMockVerses(bookId, chapter)
    },
    [versionId, versionMetaCache]
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
