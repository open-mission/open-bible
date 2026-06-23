"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Verse } from "./types"
import { getVerses as getMockVerses } from "./bible-data"
import {
  type VersionMeta,
  type AvailableVersion,
  getInstalledVersions,
  isVersionInstalled as checkInstalled,
  fetchAvailableVersions,
  downloadAndInstallVersion as doDownload,
  getChapterVerses,
  getVersionMeta,
  removeVersion as doRemove,
} from "./bible-db"

const VERSION_STORAGE_KEY = "openbible:version"

interface BibleVersionContextValue {
  versionId: string
  setVersionId: (id: string) => void
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

function loadVersionId(): string {
  if (typeof window === "undefined") return "default"
  try {
    return localStorage.getItem(VERSION_STORAGE_KEY) || "default"
  } catch {
    return "default"
  }
}

function saveVersionId(id: string) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(VERSION_STORAGE_KEY, id)
  } catch { /* ignore */ }
}

export function BibleVersionProvider({ children }: { children: ReactNode }) {
  const [versionId, setVersionIdState] = useState(loadVersionId)
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

  const setVersionId = useCallback((id: string) => {
    setVersionIdState(id)
    saveVersionId(id)
  }, [])

  const getVerses = useCallback(
    async (bookId: string, chapter: number): Promise<Verse[]> => {
      if (versionId === "default") {
        return getMockVerses(bookId, chapter)
      }

      const installed = versionMetaCache[versionId]
      if (!installed) {
        return getMockVerses(bookId, chapter)
      }

      try {
        const verses = await getChapterVerses(versionId, bookId, chapter)
        if (verses && verses.length > 0) {
          return verses.map((v) => ({
            id: `${bookId}-${chapter}-${v.verse}`,
            bookId,
            chapter: v.chapter,
            verse: v.verse,
            text: v.text,
          }))
        }
      } catch { /* fall through to mock */ }

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
      setVersionId("default")
    }
  }, [refreshInstalled, versionId, setVersionId])

  return (
    <BibleVersionContext.Provider
      value={{
        versionId,
        setVersionId,
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
