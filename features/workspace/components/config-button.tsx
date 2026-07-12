"use client"

import { useRouter } from "next/navigation"
import { IconSettings } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

/**
 * A PWA-safe settings entry point. Uses client-side router navigation
 * (router.push) instead of a plain <a>, so it never opens a new browser
 * tab when running as an installed PWA.
 */
export function ConfigButton({ className }: { className?: string }) {
  const router = useRouter()
  return (
    <button
      type="button"
      aria-label="Configurações"
      onClick={() => router.push("/config")}
      className={
        className ??
        "flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      }
    >
      <IconSettings className="h-4 w-4" />
    </button>
  )
}
