"use client"

import { useState, useEffect } from "react"
import { IconX, IconTrash, IconDeviceFloppy } from "@tabler/icons-react"
import { toast } from "sonner"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { HighlightColorPicker } from "./highlight-color-picker"
import { HighlightCategoryInput } from "./highlight-category-input"
import type { HighlightData } from "../context/highlights-context"
import type { HighlightColor } from "../utils/highlight-colors"
import type { HighlightCategory } from "@/lib/database/user/schema"

interface HighlightEditorProps {
  open: boolean
  onClose: () => void
  highlight: HighlightData | null
  onSave: (patch: { color: string; categoryId: string | null; content: string }) => Promise<void>
  onCreate: (patch: { color: string; categoryId: string | null; content: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
  listCategories: () => Promise<HighlightCategory[]>
  createCategory: (name: string) => Promise<HighlightCategory>
}

function HighlightEditorContent({
  highlight,
  onSave,
  onCreate,
  onDelete,
  listCategories,
  createCategory,
  onClose,
}: {
  highlight: HighlightData | null
  onSave: (patch: { color: string; categoryId: string | null; content: string }) => Promise<void>
  onCreate: (patch: { color: string; categoryId: string | null; content: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
  listCategories: () => Promise<HighlightCategory[]>
  createCategory: (name: string) => Promise<HighlightCategory>
  onClose: () => void
}) {
  const isCreateMode = highlight === null
  const [color, setColor] = useState<HighlightColor>(
    isCreateMode ? "amber" : highlight.highlight.color,
  )
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [content, setContent] = useState<string>(
    isCreateMode ? "" : highlight.highlight.content ?? "",
  )
  const [saving, setSaving] = useState(false)

  // Initialize selected category IDs
  useEffect(() => {
    if (!isCreateMode && highlight.category) {
      setCategoryIds([highlight.category.id])
    } else {
      setCategoryIds([])
    }
  }, [isCreateMode, highlight])

  async function handleSave() {
    setSaving(true)
    try {
      if (isCreateMode) {
        if (categoryIds.length === 0) {
          await onCreate({ color, categoryId: null, content })
        } else {
          for (const catId of categoryIds) {
            await onCreate({ color, categoryId: catId, content })
          }
        }
      } else {
        // Edit mode
        if (categoryIds.length === 0) {
          await onSave({ color, categoryId: null, content })
        } else {
          // Update original highlight with the first tag
          await onSave({ color, categoryId: categoryIds[0], content })
          
          // Create additional highlights for the other tags
          for (let i = 1; i < categoryIds.length; i++) {
            await onCreate({ color, categoryId: categoryIds[i], content })
          }
        }
      }
      onClose()
    } catch {
      toast.error(isCreateMode ? "Falha ao criar o destaque." : "Falha ao salvar o destaque.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!highlight) return
    if (!window.confirm("Tem certeza que deseja excluir este destaque?")) return
    try {
      await onDelete(highlight.highlight.id)
      onClose()
    } catch {
      toast.error("Falha ao excluir o destaque.")
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Premium Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0 bg-muted/20">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base font-semibold text-foreground">
            {isCreateMode ? "Criar Destaque" : "Editar Destaque"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isCreateMode ? "Destaque e organize versículos na Bíblia." : "Ajuste as opções do destaque selecionado."}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground shrink-0"
        >
          <IconX className="size-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 no-scrollbar">
        {/* Color Section */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Cor de Destaque
          </label>
          <div className="p-1 rounded-xl border border-border/40 bg-muted/10">
            <HighlightColorPicker value={color} onChange={setColor} />
          </div>
        </div>

        {/* Tags / Categories Section */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tags / Categorias
          </label>
          <HighlightCategoryInput
            values={categoryIds}
            onChange={setCategoryIds}
            listCategories={listCategories}
            createCategory={createCategory}
          />
          <p className="text-[10px] text-muted-foreground/80 leading-normal pl-1">
            Digite e pressione Enter ou clique em Adicionar para criar várias categorias.
          </p>
        </div>

        {/* Annotations Section */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Anotações Pessoais
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Adicione reflexões, notas ou comentários sobre o versículo..."
            rows={4}
            className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm placeholder:text-muted-foreground/50 text-foreground shadow-xs focus-visible:outline-hidden focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-all resize-none min-h-[90px]"
          />
        </div>
      </div>

      {/* Premium Actions Footer */}
      <div className="p-5 border-t border-border bg-muted/20 flex items-center justify-between gap-3 shrink-0">
        {!isCreateMode ? (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 gap-1.5"
            onClick={handleDelete}
          >
            <IconTrash className="size-4" />
            <span className="text-xs font-semibold">Excluir</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="border border-border/80 text-muted-foreground hover:text-foreground text-xs font-semibold"
          >
            Cancelar
          </Button>
        )}

        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="ml-auto gap-1.5 px-5 font-semibold text-xs h-9 bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer shadow-sm rounded-lg"
        >
          <IconDeviceFloppy className="size-4" />
          {saving ? "Salvando..." : "Salvar Destaque"}
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
  onCreate,
  onDelete,
  listCategories,
  createCategory,
}: HighlightEditorProps) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <HighlightEditorContent
        highlight={highlight}
        onSave={onSave}
        onCreate={onCreate}
        onDelete={onDelete}
        listCategories={listCategories}
        createCategory={createCategory}
        onClose={onClose}
      />
    </BottomSheet>
  )
}
