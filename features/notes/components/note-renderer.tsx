"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Highlight from "@tiptap/extension-highlight"

interface NoteRendererProps {
  html: string
  className?: string
}

/** Read-only re-render of TipTap HTML using the same extensions. */
export function NoteRenderer({ html, className }: NoteRendererProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [StarterKit, Highlight],
    content: html || "",
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
