"use client"

import { useState } from "react"
import { IconX, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { HighlightColorPicker } from "./highlight-color-picker"
import { HighlightCategoryInput } from "./highlight-category-input"
import type { HighlightData } from "../context/highlights-context"
import type { HighlightColor } from "../utils/highlight-colors"

interface HighlightEditorProps {
  open: boolean
  onClose: () => void
  highlight: HighlightData | null
  onSave: (patch: { color: string; categoryId: string | null }) => Promise<void>
  onDelete: (id: string) => Promise<void>
  listCategories: () => Promise<any[]>
  createCategory: (name: string) => Promise<any>
}

function HighlightEditorContent({
  highlight,
  onSave,
  onDelete,
  listCategories,
  createCategory,
  onClose,
}: {
  highlight: HighlightData
  onSave: (patch: { color: string; categoryId: string | null }) => Promise<void>
  onDelete: (id: string) => Promise<void>
  listCategories: () => Promise<any[]>
  createCategory: (name: string) => Promise<any>
  onClose: () => void
}) {
  const [color, setColor] = useState<HighlightColor>(highlight.highlight.color)
  const [categoryId, setCategoryId] = useState<string | null>(highlight.category?.id ?? null)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await onSave({ color, categoryId })
      onClose()
    } catch {
      toast.error("Falha ao salvar o destaque.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      await onDelete(highlight.highlight.id)
      onClose()
    } catch {
      toast.error("Falha ao excluir o destaque.")
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-base font-semibold">Editar Destaque</h3>
        <Button type="button" variant="ghost" size="icon-xs" onClick={onClose}>
          <IconX />
        </Button>
      </div>
      <Separator />

      <div className="px-4 py-3">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">Cor</label>
        <HighlightColorPicker value={color} onChange={setColor} />
      </div>
      <Separator />

      <div className="px-4 py-3">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">Categoria</label>
        <HighlightCategoryInput
          value={categoryId}
          onChange={(id) => setCategoryId(id)}
          listCategories={listCategories}
          createCategory={createCategory}
        />
      </div>
      <Separator />

      <div className="px-4 py-3">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={handleDelete}
        >
          <IconTrash />
          Excluir Destaque
        </Button>
      </div>
      <Separator />

      <div className="px-4 py-3">
        <Button
          type="button"
          className="w-full"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  )
}

export function HighlightEditor({
  open,
  onClose,
  highlight,
  onSave,
  onDelete,
  listCategories,
  createCategory,
}: HighlightEditorProps) {
  if (!highlight) return null

  return (
    <BottomSheet open={open} onClose={onClose}>
      <HighlightEditorContent
        highlight={highlight}
        onSave={onSave}
        onDelete={onDelete}
        listCategories={listCategories}
        createCategory={createCategory}
        onClose={onClose}
      />
    </BottomSheet>
  )
}
