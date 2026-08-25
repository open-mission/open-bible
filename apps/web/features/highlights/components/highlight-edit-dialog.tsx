"use client"

import { HighlightEditor } from "./highlight-editor"
import type { AllHighlightEntry } from "../hooks/use-all-highlights"
import type { HighlightCategory } from "@/lib/database/user/schema"

interface HighlightEditDialogProps {
  open: boolean
  highlight: AllHighlightEntry | null
  onClose: () => void
  onSave: (patch: { color: string; categoryId: string | null; content: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
  listCategories: () => Promise<HighlightCategory[]>
  createCategory: (name: string) => Promise<HighlightCategory>
}

export function createHighlightPatch(patch: { color: string; categoryId: string | null; content: string }) {
  return {
    color: patch.color,
    categoryId: patch.categoryId,
    content: patch.content.trim(),
  }
}

export function HighlightEditDialog({
  open,
  highlight,
  onClose,
  onSave,
  onDelete,
  listCategories,
  createCategory,
}: HighlightEditDialogProps) {
  return (
    <HighlightEditor
      open={open}
      highlight={highlight}
      onClose={onClose}
      onSave={(patch) => onSave(createHighlightPatch(patch))}
      onDelete={onDelete}
      listCategories={listCategories}
      createCategory={createCategory}
    />
  )
}

export default HighlightEditDialog
