"use client"

import { APP_VERSION } from "@/lib/app-env"

interface MobileNavProps {
  activeNav?: string | null
  onNavClick?: (navId: string) => void
  hideConfig?: boolean
}

export function MobileNav({}: MobileNavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-background/80 backdrop-blur-xs pb-[env(safe-area-inset-bottom)] h-[calc(1.5rem+env(safe-area-inset-bottom))] flex items-center justify-center pointer-events-none select-none">
      <span className="text-[10px] text-muted-foreground/30 font-mono">
        v{APP_VERSION}
      </span>
    </div>
  )
}
