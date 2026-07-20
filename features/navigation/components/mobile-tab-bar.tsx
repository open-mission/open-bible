"use client"

import {
  IconBook,
  IconNotebook,
  IconHighlight,
} from "@tabler/icons-react"
import { useAppNavigation } from "../context/app-navigation-context"
import { cn } from "@/lib/utils"
import type { AppView } from "../types"
import { APP_VERSION } from "@/lib/app-env"

interface TabItem {
  id: AppView
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const TAB_ITEMS: TabItem[] = [
  { id: "reader", label: "Leitura", icon: IconBook },
  { id: "notes", label: "Notas", icon: IconNotebook },
  { id: "highlights", label: "Destaques", icon: IconHighlight },
]

export function MobileTabBar() {
  const { activeView, navigate } = useAppNavigation()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-background/85 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <nav className="flex items-center justify-around h-14 px-4">
        {TAB_ITEMS.map((item) => {
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1 rounded-lg transition-all duration-200",
                "active:scale-95",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className={cn(
                "size-5 transition-all duration-200",
                isActive && "drop-shadow-[0_0_4px_hsl(var(--primary)/0.4)]"
              )} />
              <span className={cn(
                "text-[10px] font-medium transition-all duration-200",
                isActive ? "opacity-100" : "opacity-60"
              )}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
      <div className="flex justify-center pb-0.5 -mt-0.5">
        <span className="text-[8px] text-muted-foreground/20 font-mono select-none">v{APP_VERSION}</span>
      </div>
    </div>
  )
}
