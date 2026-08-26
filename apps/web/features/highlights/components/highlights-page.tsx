"use client"

import { OpfsStatusGate } from "@/features/layout/components/opfs-status-gate"
import { HighlightsMasterDetail } from "./highlights-master-detail"

export function HighlightsPage() {
  return (
    <>
      <OpfsStatusGate />
      <div className="h-full min-h-0">
        <HighlightsMasterDetail active onClose={() => window.history.pushState({}, "", "/")} />
      </div>
    </>
  )
}

export default HighlightsPage
