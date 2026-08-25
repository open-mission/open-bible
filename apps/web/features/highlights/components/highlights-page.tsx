"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { AllHighlightsBrowser } from "./all-highlights-browser"
import { useHighlightMutations } from "../hooks/use-highlight-mutations"
import { getBookName } from "@/lib/books"
import { copyReference } from "../lib/copy"
import { OpfsStatusGate } from "@/features/layout/components/opfs-status-gate"

export function HighlightsPage() {
  const router = useRouter()
  const { updateHighlight, deleteHighlight } = useHighlightMutations()
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleEdit = async (id: string) => {
    setEditingId(id)
    // stub edit: cycle color for demo – real dialog would open
    toast.info("Edição de destaque — dialog em breve")
    setTimeout(() => setEditingId(null), 800)
  }

  const handleDelete = async (id: string) => {
    const ok = confirm("Excluir este destaque?")
    if (!ok) return false
    await deleteHighlight(id)
    toast.success("Destaque excluído")
    return true
  }

  const handleCopy = async (entry: any) => {
    const text = await copyReference(entry)
    if (text) toast.success("Referência copiada")
  }

  return (
    <OpfsStatusGate>
      <div className="mx-auto max-w-3xl w-full min-h-[60vh] p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Destaques</h1>
          <p className="text-sm text-muted-foreground">
            Todos os seus trechos destacados — filtre por cor, categoria ou referência e navegue ao versículo.
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 overflow-hidden bg-card shadow-sm min-h-[60vh]">
          <AllHighlightsBrowser
            onClose={() => router.push("/")}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showCloseButton={false}
          />
        </div>
      </div>
    </OpfsStatusGate>
  )
}

export default HighlightsPage
