"use client"

import { useState } from "react"
import {
  BookOpen,
  Highlighter,
  Moon,
  Notebook,
  Search,
  Settings,
  Sun,
} from "lucide-react"
import { useAppTheme } from "@/features/theme/components/theme-provider"
import { useAppNavigation } from "../context/app-navigation-context"
import { ConfigDialog } from "@/features/config/components/config-dialog"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { AppView } from "../types"
import { formatShortcutDisplay } from "../hooks/use-global-shortcuts"

type NavId = AppView

interface NavItem {
  id: NavId
  icon: React.ComponentType<{ className?: string }>
  label: string
  shortcut?: string
}

const NAV_ITEMS: NavItem[] = [
  { id: "reader", icon: BookOpen, label: "Leitura" },
  { id: "notes", icon: Notebook, label: "Notas" },
  { id: "highlights", icon: Highlighter, label: "Destaques" },
]

function DockRoot({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border border-border/60 bg-background/85 backdrop-blur-lg shadow-lg px-2 py-1.5",
        "max-w-[calc(100vw-1rem)] overflow-hidden",
        className
      )}
      role="toolbar"
      aria-label="Navegação principal"
    >
      {children}
    </div>
  )
}

function DockSeparator() {
  return <div className="h-5 w-px shrink-0 bg-border/40" aria-hidden="true" />
}

interface DockItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  shortcut?: string
  isActive?: boolean
  onClick?: () => void
  ariaLabel?: string
}

function DockItem({ icon: Icon, label, shortcut, isActive, onClick, ariaLabel }: DockItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={onClick}
            aria-label={ariaLabel ?? label}
            aria-current={isActive ? "page" : undefined}
            data-active={isActive || undefined}
            className={cn(
              "inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "hover:text-foreground hover:bg-accent/60",
              isActive
                ? "bg-accent text-accent-foreground shadow-xs"
                : "text-muted-foreground"
            )}
          >
            <Icon className="size-5 shrink-0" />
          </button>
        }
      />
      <TooltipContent side="top" sideOffset={8}>
        <span>{label}</span>
        {shortcut && (
          <Kbd className="ml-1.5">{formatShortcutDisplay(shortcut)}</Kbd>
        )}
      </TooltipContent>
    </Tooltip>
  )
}

interface AppDockProps {
  onOpenCommandPalette?: () => void
}

export function AppDock({ onOpenCommandPalette }: AppDockProps) {
  const { activeView, navigate } = useAppNavigation()
  const { isDark, setTheme } = useAppTheme()
  const [configOpen, setConfigOpen] = useState(false)

  return (
    <>
      <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 justify-center px-2 pb-[env(safe-area-inset-bottom)] pointer-events-none">
        <DockRoot className="pointer-events-auto">
          {NAV_ITEMS.map((item) => (
            <DockItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeView === item.id}
              onClick={() => navigate(item.id)}
            />
          ))}

          <DockSeparator />

          <DockItem
            icon={Search}
            label="Buscar"
            shortcut="mod+k"
            onClick={() => onOpenCommandPalette?.()}
            ariaLabel="Buscar (Command Palette)"
          />

          <DockItem
            icon={Settings}
            label="Configurações"
            onClick={() => setConfigOpen(true)}
          />

          <DockItem
            icon={isDark ? Sun : Moon}
            label={isDark ? "Modo Claro" : "Modo Escuro"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
          />
        </DockRoot>
      </div>

      <ConfigDialog open={configOpen} onOpenChange={setConfigOpen} />
    </>
  )
}

export { DockRoot as Dock, DockItem, DockSeparator }
