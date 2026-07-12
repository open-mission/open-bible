"use client"

import { useState } from "react"
import { IconSettings } from "@tabler/icons-react"
import { ConfigDialog } from "@/features/config/components/config-dialog"

/**
 * A PWA-safe settings entry point. Opens the settings Dialog (desktop) /
 * Drawer (mobile) instead of navigating to a route, so it never opens a new
 * browser tab when running as an installed PWA.
 */
export function ConfigButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        aria-label="Configurações"
        onClick={() => setOpen(true)}
        className={
          className ??
          "flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        }
      >
        <IconSettings className="h-4 w-4" />
      </button>
      <ConfigDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
