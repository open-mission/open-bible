"use client"

import { useState, useEffect, useRef } from "react"
import type { Verse } from "@/lib/types"
import { useBibleVersion } from "@/features/bible-reader/context/bible-version-context"

export function useBibleVerses(bookId: string | null, chapter: number | null) {
  const { getVerses, versionId } = useBibleVersion()
  const [verses, setVerses] = useState<Verse[]>([])
  const [loading, setLoading] = useState(false)
  const lastKey = useRef("")

  useEffect(() => {
    if (!bookId || !chapter) {
      const timer = setTimeout(() => {
        setVerses([])
      }, 0)
      return () => clearTimeout(timer)
    }

    const key = `${versionId}-${bookId}-${chapter}`
    if (key === lastKey.current) return
    lastKey.current = key

    setLoading(true)
    getVerses(bookId, chapter)
      .then((result) => {
        setVerses(result)
        setLoading(false)
      })
      .catch(() => {
        setVerses([])
        setLoading(false)
      })
  }, [bookId, chapter, versionId, getVerses])

  return { verses, loading }
}
