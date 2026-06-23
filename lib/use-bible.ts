"use client"

import { useState, useEffect, useRef } from "react"
import type { Verse } from "./types"
import { useBibleVersion } from "./bible-version-context"

export function useBibleVerses(bookId: string | null, chapter: number | null) {
  const { getVerses } = useBibleVersion()
  const [verses, setVerses] = useState<Verse[]>([])
  const [loading, setLoading] = useState(false)
  const lastKey = useRef("")

  useEffect(() => {
    if (!bookId || !chapter) {
      setVerses([])
      return
    }

    const key = `${bookId}-${chapter}`
    if (key === lastKey.current && verses.length > 0) return
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
  }, [bookId, chapter, getVerses])

  return { verses, loading }
}
