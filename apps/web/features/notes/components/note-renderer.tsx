"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Highlight from "@tiptap/extension-highlight"
import { BibleReference } from "../extensions/bible-reference"
import { createEmptyNoteDocument, parseNoteContent } from "../lib/note-document"

interface NoteRendererProps {
  content: string
  className?: string
}

/** Read-only re-render of the persisted TipTap JSON document. */
export function NoteRenderer({ content, className }: NoteRendererProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [StarterKit, Highlight, BibleReference],
    content: parseNoteContent(content) || createEmptyNoteDocument(),
    editorProps: {
      attributes: {
        class: "note-rich-content",
      },
    },
  })

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  )
}
