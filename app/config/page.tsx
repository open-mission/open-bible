"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { MobileNav } from "@/features/layout/components/mobile-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useIsTauriMacOS } from "@/features/layout/hooks/use-is-tauri-macos"
import { ConfigContent } from "@/features/config/components/config-content"
import { cn } from "@/lib/utils"

/**
 * Standalone settings route — kept as a fallback for direct URLs / PWA deep
 * links. The primary settings surface is now the ConfigDialog (Dialog on
 * desktop, Drawer on mobile) opened from the sidebar, mobile nav and workspace
 * header. Both render the shared ConfigContent.
 */
export default function ConfigPage() {
  const router = useRouter()
  const isTauriMacOS = useIsTauriMacOS()

  return (
    <SidebarProvider open={false} className="h-dvh">
      <SidebarInset className="w-auto overflow-hidden h-full flex flex-col bg-background text-foreground">
        {/* Header */}
        <header
          data-tauri-drag-region={isTauriMacOS ? "" : undefined}
          className={cn(
            "sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/95 backdrop-blur px-4 py-3",
            isTauriMacOS && "pl-[70px]",
          )}
        >
          <button
            onClick={() => router.back()}
            aria-label="Voltar"
            className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="font-serif text-base font-medium">Preferências</h1>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="mx-auto max-w-4xl px-4 py-8 pb-[calc(2.5rem+env(safe-area-inset-bottom))] md:pb-8">
            <ConfigContent />
          </div>
        </div>

        <MobileNav activeNav="config" onNavClick={() => {}} />
      </SidebarInset>
    </SidebarProvider>
  )
}
