"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { Editor } from "@tiptap/core"
import { EditorContent, useEditor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import StarterKit from "@tiptap/starter-kit"
import Highlight from "@tiptap/extension-highlight"
import { Bold, Highlighter, Italic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OpfsStatusGate } from "@/features/layout/components/opfs-status-gate"
import { BOOKS } from "@/features/bible-reader/utils/bible-data"
import { cn } from "@/lib/utils"
import { BibleReference } from "../extensions/bible-reference"
import {
  createEmptyNoteDocument,
  getSlashItems,
  NOTE_PLACEHOLDER,
  parseNoteContent,
  type NoteDocument,
  type SlashItem,
} from "../lib/note-document"

interface NoteEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
  autoFocus?: boolean
  className?: string
}

type SlashState = {
  query: string
  range: { from: number; to: number }
} | null

type ReferenceDraft = {
  bible: string
  book: string
  chapter: number
  verseStart: number
  verseEnd: number | null
}

const DEFAULT_REFERENCE: ReferenceDraft = {
  bible: "ara",
  book: "gen",
  chapter: 1,
  verseStart: 1,
  verseEnd: null,
}

function serialize(editor: Editor): string {
  return JSON.stringify(editor.getJSON())
}

function contentForEditor(value: string): NoteDocument | string {
  return parseNoteContent(value)
}

export function NoteEditor({
  value,
  onChange,
  placeholder = NOTE_PLACEHOLDER,
  autoFocus,
  className,
}: NoteEditorProps) {
  const editorRef = useRef<Editor | null>(null)
  const slashRef = useRef<SlashState>(null)
  const selectedIndexRef = useRef(0)
  const chooseSlashRef = useRef<(item: SlashItem) => void>(() => undefined)
  const [slash, setSlash] = useState<SlashState>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [referencePickerOpen, setReferencePickerOpen] = useState(false)
  const [reference, setReference] = useState<ReferenceDraft>(DEFAULT_REFERENCE)

  const updateSlash = (currentEditor: Editor) => {
    const { $from } = currentEditor.state.selection
    if (!$from.parent.isTextblock) {
      slashRef.current = null
      setSlash(null)
      return
    }

    const textBefore = $from.parent.textBetween(0, $from.parentOffset, "\n", "\ufffc")
    const match = /(^|\s)\/([^\s]*)$/.exec(textBefore)
    if (!match) {
      slashRef.current = null
      setSlash(null)
      return
    }

    const nextSlash: SlashState = {
      query: match[2],
      range: {
        from: $from.pos - match[0].length + match[1].length,
        to: $from.pos,
      },
    }
    if (slashRef.current?.query !== nextSlash.query) {
      selectedIndexRef.current = 0
      setSelectedIndex(0)
    }
    slashRef.current = nextSlash
    setSlash(nextSlash)
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Highlight, BibleReference],
    content: contentForEditor(value) || createEmptyNoteDocument(),
    autofocus: autoFocus ? "end" : false,
    editorProps: {
      attributes: {
        class: "note-rich-content min-h-[18rem] px-1 py-3 focus:outline-none sm:min-h-[24rem]",
        "data-placeholder": placeholder,
        "aria-label": "Conteúdo da nota",
      },
      handleKeyDown: (_view, event) => {
        const currentSlash = slashRef.current
        if (!currentSlash) return false
        const items = getSlashItems(currentSlash.query)
        if (event.key === "ArrowDown") {
          event.preventDefault()
          const next = Math.min(selectedIndexRef.current + 1, Math.max(items.length - 1, 0))
          selectedIndexRef.current = next
          setSelectedIndex(next)
          return true
        }
        if (event.key === "ArrowUp") {
          event.preventDefault()
          const next = Math.max(selectedIndexRef.current - 1, 0)
          selectedIndexRef.current = next
          setSelectedIndex(next)
          return true
        }
        if (event.key === "Enter" && items.length > 0) {
          event.preventDefault()
          chooseSlashRef.current(items[selectedIndexRef.current] ?? items[0])
          return true
        }
        if (event.key === "Escape") {
          event.preventDefault()
          slashRef.current = null
          setSlash(null)
          return true
        }
        return false
      },
    },
    onCreate: ({ editor: createdEditor }) => {
      editorRef.current = createdEditor
      updateSlash(createdEditor)
    },
    onUpdate: ({ editor: updatedEditor }) => {
      editorRef.current = updatedEditor
      updateSlash(updatedEditor)
      onChange(serialize(updatedEditor))
    },
    onSelectionUpdate: ({ editor: selectedEditor }) => updateSlash(selectedEditor),
  })

  useEffect(() => {
    if (!editor) return
    editorRef.current = editor
    const current = serialize(editor)
    if (value && value !== current) {
      editor.commands.setContent(contentForEditor(value), { emitUpdate: false })
    }
  }, [editor, value])

  const chooseSlashItem = useCallback((item: SlashItem) => {
    const currentEditor = editorRef.current
    const currentSlash = slashRef.current
    if (!currentEditor || !currentSlash) return

    currentEditor.chain().focus().deleteRange(currentSlash.range).run()
    slashRef.current = null
    setSlash(null)
    if (item.id === "bibleReference") {
      setReference(DEFAULT_REFERENCE)
      setReferencePickerOpen(true)
      return
    }
    const chain = currentEditor.chain().focus()
    if (item.id === "paragraph") chain.setParagraph()
    if (item.id === "heading") chain.toggleHeading({ level: 2 })
    if (item.id === "bulletList") chain.toggleBulletList()
    if (item.id === "orderedList") chain.toggleOrderedList()
    if (item.id === "blockquote") chain.toggleBlockquote()
    if (item.id === "codeBlock") chain.toggleCodeBlock()
    if (item.id === "horizontalRule") chain.setHorizontalRule()
    chain.run()
  }, [])

  useEffect(() => {
    chooseSlashRef.current = chooseSlashItem
  }, [chooseSlashItem])

  const insertReference = () => {
    const currentEditor = editorRef.current
    if (!currentEditor) return
    currentEditor.chain().focus().insertContent({ type: "bibleReference", attrs: reference }).run()
    setReferencePickerOpen(false)
  }

  if (!editor) return null

  const slashItems = getSlashItems(slash?.query ?? "")

  return (
    <div className={cn("relative bg-background", className)}>
      <OpfsStatusGate />
      <BubbleMenu
        editor={editor}
        shouldShow={({ from, to }) => from !== to}
        className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-popover p-1 shadow-lg"
      >
        <FormatButton label="Negrito" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="size-4" />
        </FormatButton>
        <FormatButton label="Itálico" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="size-4" />
        </FormatButton>
        <FormatButton label="Destaque" active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()}>
          <Highlighter className="size-4" />
        </FormatButton>
      </BubbleMenu>

      <EditorContent editor={editor} />
      {slash && slashItems.length > 0 && (
        <div className="absolute left-1 top-12 z-20 w-64 rounded-xl border border-border/70 bg-popover p-1.5 shadow-xl" role="listbox" aria-label="Comandos slash">
          {slashItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={index === selectedIndex}
              className={cn("flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left", index === selectedIndex && "bg-accent")}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => chooseSlashItem(item)}
            >
              <span className="text-sm font-medium text-foreground">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.description}</span>
            </button>
          ))}
        </div>
      )}

      {referencePickerOpen && (
        <ReferencePicker
          value={reference}
          onChange={setReference}
          onCancel={() => setReferencePickerOpen(false)}
          onConfirm={insertReference}
        />
      )}
    </div>
  )
}

function FormatButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button type="button" variant="ghost" size="icon-sm" aria-label={label} aria-pressed={active} onClick={onClick}>
      {children}
    </Button>
  )
}

function ReferencePicker({
  value,
  onChange,
  onCancel,
  onConfirm,
}: {
  value: ReferenceDraft
  onChange: (value: ReferenceDraft) => void
  onCancel: () => void
  onConfirm: () => void
}) {
  const setNumber = (key: "chapter" | "verseStart" | "verseEnd", raw: string) => {
    onChange({ ...value, [key]: raw === "" ? null : Number(raw) })
  }

  return (
    <div className="absolute left-1 top-12 z-30 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-border/70 bg-popover p-3 shadow-xl" role="dialog" aria-label="Adicionar referência bíblica">
      <p className="mb-3 text-sm font-semibold text-foreground">Adicionar referência bíblica</p>
      <div className="grid grid-cols-2 gap-2">
        <label className="col-span-2 grid gap-1 text-xs text-muted-foreground">
          Tradução
          <select className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground" value={value.bible} onChange={(event) => onChange({ ...value, bible: event.target.value })}>
            <option value="ara">ARA</option>
            <option value="nvi">NVI</option>
            <option value="acf">ACF</option>
          </select>
        </label>
        <label className="col-span-2 grid gap-1 text-xs text-muted-foreground">
          Livro
          <select className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground" value={value.book} onChange={(event) => onChange({ ...value, book: event.target.value })}>
            {BOOKS.map((book) => <option key={book.id} value={book.id}>{book.name}</option>)}
          </select>
        </label>
        <NumberField label="Capítulo" value={value.chapter} onChange={(raw) => setNumber("chapter", raw)} />
        <NumberField label="Versículo" value={value.verseStart} onChange={(raw) => setNumber("verseStart", raw)} />
        <NumberField label="Até (opcional)" value={value.verseEnd ?? ""} onChange={(raw) => setNumber("verseEnd", raw)} />
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button type="button" size="sm" onClick={onConfirm}>Adicionar</Button>
      </div>
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | string
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1 text-xs text-muted-foreground">
      {label}
      <input className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground" type="number" min={1} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}
