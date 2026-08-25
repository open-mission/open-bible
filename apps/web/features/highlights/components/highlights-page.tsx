"use client"

import { useRouter } from "next/navigation"
import { AllHighlightsBrowser } from "./all-highlights-browser"
import { OpfsStatusGate } from "@/features/layout/components/opfs-status-gate"

export function HighlightsPage() {
  const router = useRouter()

  return (
    <>
      <OpfsStatusGate />
      <div className="mx-auto max-w-3xl w-full min-h-[60vh] p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Destaques</h1>
          <p className="text-sm text-muted-foreground">
            Todos os seus trechos destacados — filtre por cor, categoria ou referência e navegue ao versículo.
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 overflow-hidden bg-card shadow-sm min-h-[60vh]">
          <AllHighlightsBrowser
            active
            onClose={() => router.push("/")}
            showCloseButton={false}
          />
        </div>
      </div>
    </>
  )
}

export default HighlightsPage
