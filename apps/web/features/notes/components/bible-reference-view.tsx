"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ExternalLink, LoaderCircle } from "lucide-react"
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react"
import { database } from "@/lib/database/database"
import {
  bibleReferenceHref,
  bibleReferenceLabel,
  formatMissingBibleMessage,
  type BibleReferenceAttributes,
} from "../lib/note-document"

export function BibleReferenceView({ node }: NodeViewProps) {
  const reference = node.attrs as BibleReferenceAttributes
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function loadPreview() {
      setLoading(true)
      try {
        await database.initialize()
        const bible = await database.openBible(reference.bible)
        const verses = await bible.getChapterVerses(reference.book, reference.chapter)
        const end = reference.verseEnd ?? reference.verseStart
        const text = verses
          .filter((verse) => verse.verse >= reference.verseStart && verse.verse <= end)
          .map((verse) => verse.text)
          .join(" ")
        if (!cancelled) setPreview(text || null)
      } catch {
        if (!cancelled) setPreview(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadPreview()
    return () => {
      cancelled = true
    }
  }, [reference.bible, reference.book, reference.chapter, reference.verseStart, reference.verseEnd])

  return (
    <NodeViewWrapper className="my-3">
      <Link
        href={bibleReferenceHref(reference)}
        className="group block rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 no-underline transition-colors hover:border-primary/40 hover:bg-primary/10"
        data-bible-reference="true"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-primary">
          <span>{bibleReferenceLabel(reference)}</span>
          <ExternalLink className="size-3.5 opacity-60 transition-transform group-hover:translate-x-0.5" />
        </span>
        {loading ? (
          <LoaderCircle className="mt-1 size-3.5 animate-spin text-muted-foreground" aria-label="Carregando prévia" />
        ) : (
          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
            {preview ?? formatMissingBibleMessage(reference.bible)}
          </span>
        )}
      </Link>
    </NodeViewWrapper>
  )
}
