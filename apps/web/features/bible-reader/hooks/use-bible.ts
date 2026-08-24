"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { Verse } from "@/lib/types"
import { useBibleVersion } from "@/features/bible-reader/context/bible-version-context"
import { getChapter } from "@open-bible/application-bible"
import { WebBibleReader } from "@open-bible/adapters-web"

export function useBibleVerses(bookId: string | null, chapter: number | null) {
  const { getVerses, versionId, installedVersions } = useBibleVersion()
  const [verses, setVerses] = useState<Verse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const lastKey = useRef("")

  const isVersionInstalled = installedVersions.some((v) => v.id === versionId)

  const reload = useCallback(() => {
    setRetryCount((n) => n + 1)
  }, [])

  useEffect(() => {
    if (!bookId || !chapter) {
      const timer = setTimeout(() => {
        setVerses([])
        setError(null)
      }, 0)
      return () => clearTimeout(timer)
    }

    const key = `${versionId}-${bookId}-${chapter}-${installedVersions.length}-${retryCount}`
    if (key === lastKey.current) return
    lastKey.current = key

    setLoading(true)
    setError(null)
    getChapter(
      new WebBibleReader((readerVersionId, readerBookId, readerChapter) =>
        getVerses(readerBookId, readerChapter, readerVersionId)
      ),
      versionId,
      bookId,
      chapter
    )
      .then((result) => {
        setVerses(result)
        setLoading(false)
      })
      .catch((err) => {
        setVerses([])
        setLoading(false)
        setError(err instanceof Error ? err.message : "Não foi possível carregar este capítulo.")
      })
  }, [bookId, chapter, versionId, getVerses, installedVersions, retryCount])

  return { verses, loading, error, reload, isVersionInstalled }
}
