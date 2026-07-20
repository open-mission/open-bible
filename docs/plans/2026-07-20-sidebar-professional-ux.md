# Implementation Plan — Sidebar & Navigation Professional UX

**Goal:** Transform Open Bible's sidebar, navigation, and shortcuts into a professional-grade experience inspired by Notion/Midday/Obsidian, supporting desktop (browser + Tauri), PWA standalone, and mobile.

**Architecture:** Client-side SPA navigation via Context, shadcn sidebar/command components, centralized keyboard shortcut system.

**Tech Stack:** Next.js 16, shadcn/ui (base-vega), Tailwind v4, cmdk (via existing `command.tsx`), @tabler/icons-react, CSS transitions.

---

## File Map

### New Files

| File | Responsibility |
|------|---------------|
| `features/navigation/context/app-navigation-context.tsx` | App-level navigation state provider (activeView, navigate, goBack, history) |
| `features/navigation/hooks/use-app-navigation.ts` | Consumer hook for app navigation context |
| `features/navigation/hooks/use-global-shortcuts.ts` | Centralized keyboard shortcut registrar |
| `features/navigation/components/command-palette.tsx` | Global command palette (cmdk) |
| `features/navigation/components/app-sidebar.tsx` | Professional sidebar (replaces both existing sidebars) |
| `features/navigation/components/mobile-tab-bar.tsx` | Native-style bottom tab bar for mobile |
| `features/navigation/components/view-container.tsx` | Renders the active view component |
| `features/navigation/types.ts` | Shared types for navigation system |

### Modified Files

| File | Change |
|------|--------|
| `app/layout.tsx` | Wrap children with `AppNavigationProvider` |
| `app/page.tsx` | Use `ViewContainer` instead of direct SimpleHome/AdvancedHome |
| `features/workspace/components/simple-home.tsx` | Remove Cmd+K handler (moved to global), remove MobileNav, accept navigation props |
| `features/workspace/components/advanced-home.tsx` | Remove MobileNav, integrate with app navigation |
| `features/workspace/components/workspace-view.tsx` | Remove duplicated keyboard shortcut logic (use global), integrate sidebar |
| `features/workspace/components/workspace-sidebar.tsx` | Add navigation section at top, visual polish |
| `features/layout/components/mobile-nav.tsx` | Will be replaced by `mobile-tab-bar.tsx` |

### Untouched (reference only)

| File | Why |
|------|-----|
| `components/ui/sidebar.tsx` | shadcn primitive — no changes needed |
| `components/ui/command.tsx` | shadcn primitive — no changes needed |
| `components/ui/kbd.tsx` | shadcn primitive — no changes needed |
| `features/bible-reader/components/book-chapter-dialog/` | Stays as-is, command palette triggers it |

---

## Tasks

### Phase 1: Foundation — Navigation Context & Types

#### Task 1.1 — Create navigation types
**File:** `features/navigation/types.ts` [NEW]

```typescript
export type AppView = "reader" | "notes" | "highlights"

export interface ViewHistoryEntry {
  view: AppView
  timestamp: number
}

export interface AppNavigationState {
  activeView: AppView
  history: ViewHistoryEntry[]
  canGoBack: boolean
}

export interface AppNavigationActions {
  navigate: (view: AppView) => void
  goBack: () => void
}

export type AppNavigationContextValue = AppNavigationState & AppNavigationActions

export interface ShortcutDefinition {
  /** Unique id for the shortcut */
  id: string
  /** Display label */
  label: string
  /** Key combo, e.g. "mod+k" where mod = Cmd (mac) / Ctrl (win/linux) */
  keys: string
  /** Action to execute */
  action: () => void
  /** Whether this shortcut is currently active */
  enabled?: boolean
  /** Group for display in command palette */
  group?: string
}
```

**Verify:** `pnpm lint`

---

#### Task 1.2 — Create AppNavigationProvider
**File:** `features/navigation/context/app-navigation-context.tsx` [NEW]

```tsx
"use client"

import { createContext, useContext, useState, useCallback, useRef } from "react"
import type { AppView, AppNavigationContextValue, ViewHistoryEntry } from "../types"

const STORAGE_KEY = "openbible:active-view"
const MAX_HISTORY = 20

const AppNavigationContext = createContext<AppNavigationContextValue | null>(null)

function getInitialView(): AppView {
  if (typeof window === "undefined") return "reader"
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "notes" || stored === "highlights") return stored
  return "reader"
}

export function AppNavigationProvider({ children }: { children: React.ReactNode }) {
  const [activeView, setActiveView] = useState<AppView>(getInitialView)
  const historyRef = useRef<ViewHistoryEntry[]>([{ view: getInitialView(), timestamp: Date.now() }])

  const navigate = useCallback((view: AppView) => {
    setActiveView(view)
    localStorage.setItem(STORAGE_KEY, view)

    historyRef.current = [
      ...historyRef.current.slice(-MAX_HISTORY + 1),
      { view, timestamp: Date.now() },
    ]

    // Shallow URL update for deep-linking (does NOT trigger Next.js navigation)
    const url = view === "reader" ? "/" : `/${view}`
    window.history.pushState({ view }, "", url)
  }, [])

  const goBack = useCallback(() => {
    if (historyRef.current.length <= 1) return
    historyRef.current = historyRef.current.slice(0, -1)
    const prev = historyRef.current[historyRef.current.length - 1]
    setActiveView(prev.view)
    localStorage.setItem(STORAGE_KEY, prev.view)
  }, [])

  const canGoBack = historyRef.current.length > 1

  return (
    <AppNavigationContext.Provider value={{ activeView, history: historyRef.current, canGoBack, navigate, goBack }}>
      {children}
    </AppNavigationContext.Provider>
  )
}

export function useAppNavigation() {
  const ctx = useContext(AppNavigationContext)
  if (!ctx) throw new Error("useAppNavigation must be used within AppNavigationProvider")
  return ctx
}
```

**Verify:** `pnpm lint`

---

#### Task 1.3 — Create useGlobalShortcuts hook
**File:** `features/navigation/hooks/use-global-shortcuts.ts` [NEW]

This hook registers keyboard shortcuts on the window. It guards against inputs/textareas/contenteditable elements. It uses `useEffect` with a stable handler.

```typescript
"use client"

import { useEffect, useRef } from "react"
import type { ShortcutDefinition } from "../types"

function isInputFocused(): boolean {
  const el = document.activeElement as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable
}

function matchesKey(e: KeyboardEvent, keys: string): boolean {
  const parts = keys.toLowerCase().split("+").map((s) => s.trim())
  const isMac = navigator.platform.toUpperCase().includes("MAC")

  for (const part of parts) {
    switch (part) {
      case "mod":
        if (isMac ? !e.metaKey : !e.ctrlKey) return false
        break
      case "ctrl":
        if (!e.ctrlKey) return false
        break
      case "meta":
        if (!e.metaKey) return false
        break
      case "shift":
        if (!e.shiftKey) return false
        break
      case "alt":
        if (!e.altKey) return false
        break
      default:
        if (e.key.toLowerCase() !== part) return false
        break
    }
  }
  return true
}

export function useGlobalShortcuts(shortcuts: ShortcutDefinition[]) {
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (isInputFocused()) return

      for (const shortcut of shortcutsRef.current) {
        if (shortcut.enabled === false) continue
        if (matchesKey(e, shortcut.keys)) {
          e.preventDefault()
          e.stopPropagation()
          shortcut.action()
          return
        }
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])
}

export function formatShortcutDisplay(keys: string): string {
  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().includes("MAC")
  return keys
    .split("+")
    .map((k) => {
      const key = k.trim().toLowerCase()
      switch (key) {
        case "mod": return isMac ? "⌘" : "Ctrl"
        case "ctrl": return "Ctrl"
        case "meta": return "⌘"
        case "shift": return "⇧"
        case "alt": return isMac ? "⌥" : "Alt"
        case "backspace": return "⌫"
        case "enter": return "↵"
        case "tab": return "⇥"
        case "escape": return "Esc"
        case "\\": return "\\"
        default: return key.toUpperCase()
      }
    })
    .join("")
}
```

**Verify:** `pnpm lint`

---

### Phase 2: Command Palette

#### Task 2.1 — Create the CommandPalette component
**File:** `features/navigation/components/command-palette.tsx` [NEW]

This is the main global command palette. It uses the existing `components/ui/command.tsx` (cmdk).

```tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  IconBook,
  IconNotebook,
  IconHighlight,
  IconSearch,
  IconSettings,
  IconSun,
  IconMoon,
  IconPlus,
  IconX,
  IconLayoutGrid,
  IconLayoutRows,
} from "@tabler/icons-react"
import { useAppNavigation } from "../context/app-navigation-context"
import { useAppTheme } from "@/features/theme/components/theme-provider"
import { useBibleVersion } from "@/features/bible-reader/context/bible-version-context"
import { formatShortcutDisplay } from "../hooks/use-global-shortcuts"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenBookChapterDialog?: () => void
  /** Additional workspace actions (for advanced mode) */
  workspaceActions?: {
    openPane?: () => void
    closePane?: () => void
    setLayoutMode?: (mode: "tabs" | "grid") => void
  }
}

export function CommandPalette({
  open,
  onOpenChange,
  onOpenBookChapterDialog,
  workspaceActions,
}: CommandPaletteProps) {
  const { navigate } = useAppNavigation()
  const { isDark, setTheme } = useAppTheme()
  const { versionId, setVersionId, installedVersions } = useBibleVersion()
  const [search, setSearch] = useState("")

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) setSearch("")
  }, [open])

  const handleSelect = (action: () => void) => {
    action()
    onOpenChange(false)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Digite um comando ou busque..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        {/* Navigation Group */}
        <CommandGroup heading="Navegação">
          <CommandItem onSelect={() => handleSelect(() => onOpenBookChapterDialog?.())}>
            <IconSearch className="mr-2 size-4" />
            <span>Ir para livro/capítulo</span>
            <CommandShortcut>{formatShortcutDisplay("mod+k")}</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => navigate("reader"))}>
            <IconBook className="mr-2 size-4" />
            <span>Leitura</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => navigate("notes"))}>
            <IconNotebook className="mr-2 size-4" />
            <span>Notas</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => navigate("highlights"))}>
            <IconHighlight className="mr-2 size-4" />
            <span>Destaques</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Bible Version Group */}
        <CommandGroup heading="Versão da Bíblia">
          {installedVersions.map((v) => (
            <CommandItem
              key={v.id}
              onSelect={() => handleSelect(() => setVersionId(v.id))}
            >
              <IconBook className="mr-2 size-4" />
              <span>{v.abbreviation.toUpperCase()}</span>
              {v.id === versionId && (
                <span className="ml-auto text-xs text-primary">Ativa</span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Actions Group */}
        {workspaceActions && (
          <>
            <CommandGroup heading="Ações">
              {workspaceActions.openPane && (
                <CommandItem onSelect={() => handleSelect(workspaceActions.openPane!)}>
                  <IconPlus className="mr-2 size-4" />
                  <span>Nova aba</span>
                  <CommandShortcut>{formatShortcutDisplay("alt+t")}</CommandShortcut>
                </CommandItem>
              )}
              {workspaceActions.closePane && (
                <CommandItem onSelect={() => handleSelect(workspaceActions.closePane!)}>
                  <IconX className="mr-2 size-4" />
                  <span>Fechar aba</span>
                  <CommandShortcut>{formatShortcutDisplay("alt+w")}</CommandShortcut>
                </CommandItem>
              )}
              {workspaceActions.setLayoutMode && (
                <>
                  <CommandItem onSelect={() => handleSelect(() => workspaceActions.setLayoutMode!("tabs"))}>
                    <IconLayoutRows className="mr-2 size-4" />
                    <span>Modo Abas</span>
                  </CommandItem>
                  <CommandItem onSelect={() => handleSelect(() => workspaceActions.setLayoutMode!("grid"))}>
                    <IconLayoutGrid className="mr-2 size-4" />
                    <span>Modo Grade</span>
                  </CommandItem>
                </>
              )}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Appearance Group */}
        <CommandGroup heading="Aparência">
          <CommandItem onSelect={() => handleSelect(() => setTheme(isDark ? "light" : "dark"))}>
            {isDark ? <IconSun className="mr-2 size-4" /> : <IconMoon className="mr-2 size-4" />}
            <span>{isDark ? "Modo Claro" : "Modo Escuro"}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => navigate("reader"))}>
            <IconSettings className="mr-2 size-4" />
            <span>Configurações</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
```

**Verify:** `pnpm lint`

---

### Phase 3: Professional Sidebar

#### Task 3.1 — Create the professional AppSidebar
**File:** `features/navigation/components/app-sidebar.tsx` [NEW]

This is the new unified sidebar that both simple and advanced modes share. It adds a navigation section, a search trigger, and proper visual polish. In advanced mode, it also shows the workspace tabs.

```tsx
"use client"

import { useState, useCallback } from "react"
import {
  IconBook,
  IconNotebook,
  IconHighlight,
  IconSearch,
  IconSettings,
  IconSun,
  IconMoon,
} from "@tabler/icons-react"
import { useAppTheme } from "@/features/theme/components/theme-provider"
import { useAppNavigation } from "../context/app-navigation-context"
import { ConfigDialog } from "@/features/config/components/config-dialog"
import { Kbd } from "@/components/ui/kbd"
import { APP_VERSION, APP_ENV, ENV_LABEL, isPreRelease } from "@/lib/app-env"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import type { AppView } from "../types"

interface NavItem {
  id: AppView | "search"
  icon: React.ComponentType<{ className?: string }>
  label: string
  shortcut?: string
  isAction?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { id: "reader", icon: IconBook, label: "Leitura" },
  { id: "notes", icon: IconNotebook, label: "Notas" },
  { id: "highlights", icon: IconHighlight, label: "Destaques" },
]

interface AppSidebarProps {
  onOpenCommandPalette: () => void
  /** Optional extra content rendered below the navigation section (e.g. workspace tabs) */
  workspaceContent?: React.ReactNode
}

export function AppSidebar({ onOpenCommandPalette, workspaceContent }: AppSidebarProps) {
  const { isDark, setTheme } = useAppTheme()
  const { activeView, navigate } = useAppNavigation()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const [configOpen, setConfigOpen] = useState(false)

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border">
      {/* Header — Logo */}
      <SidebarHeader className="border-b border-sidebar-border/40">
        <div className={cn(
          "flex items-center px-2 py-2.5",
          isCollapsed ? "justify-center" : "justify-start"
        )}>
          {isCollapsed ? (
            <img
              src="/logo-minimal-transparent.png"
              alt="Open Bible"
              className="h-6 w-auto select-none pointer-events-none dark:invert-0 invert transition-opacity duration-200"
            />
          ) : (
            <img
              src="/logo.svg"
              alt="Open Bible Logo"
              className="h-7 w-auto dark:invert-0 invert select-none pointer-events-none transition-opacity duration-200"
            />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Search Trigger */}
        <SidebarGroup className="py-2">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onOpenCommandPalette}
                  tooltip="Buscar (⌘K)"
                  className={cn(
                    "h-9 rounded-lg transition-all duration-150",
                    isCollapsed ? "justify-center" : "justify-between"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <IconSearch className="size-[18px] text-muted-foreground" />
                    {!isCollapsed && (
                      <span className="text-sm text-muted-foreground">Buscar...</span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <Kbd keys={["command"]} className="text-[10px] ml-auto">K</Kbd>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive = activeView === item.id
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => navigate(item.id as AppView)}
                      tooltip={item.label}
                      className={cn(
                        "h-9 rounded-lg transition-all duration-150",
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-2 border-primary"
                      )}
                    >
                      <item.icon className={cn(
                        "size-[18px] transition-colors duration-150",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span className="text-sm">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Workspace Content (advanced mode only — tab list goes here) */}
        {workspaceContent && (
          <>
            <SidebarSeparator />
            {workspaceContent}
          </>
        )}
      </SidebarContent>

      <SidebarSeparator />

      {/* Footer — Settings, Theme, Version */}
      <SidebarFooter className="p-2">
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setConfigOpen(true)}
              tooltip="Configurações"
              className="h-9 rounded-lg transition-all duration-150"
            >
              <IconSettings className="size-[18px]" />
              <span className="text-sm">Configurações</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setTheme(isDark ? "light" : "dark")}
              tooltip={isDark ? "Modo Claro" : "Modo Escuro"}
              className="h-9 rounded-lg transition-all duration-150"
            >
              {isDark ? (
                <IconSun className="size-[18px]" />
              ) : (
                <IconMoon className="size-[18px]" />
              )}
              <span className="text-sm">
                {isDark ? "Modo Claro" : "Modo Escuro"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Version indicator */}
        <div className="px-2.5 py-1.5 flex items-center justify-between border-t border-sidebar-border/20 mt-1 select-none group-data-[collapsible=icon]:hidden">
          <span className="text-[10px] text-muted-foreground/40 font-mono">
            Open Bible v{APP_VERSION}
          </span>
          {isPreRelease && ENV_LABEL[APP_ENV] && (
            <Badge variant="secondary" className="h-3.5 px-1 text-[8px] font-medium leading-none">
              {ENV_LABEL[APP_ENV]}
            </Badge>
          )}
        </div>
      </SidebarFooter>

      <ConfigDialog open={configOpen} onOpenChange={setConfigOpen} />
    </Sidebar>
  )
}
```

**Verify:** `pnpm lint`

---

#### Task 3.2 — Create Mobile Tab Bar
**File:** `features/navigation/components/mobile-tab-bar.tsx` [NEW]

Native-style bottom tab bar for mobile navigation.

```tsx
"use client"

import {
  IconBook,
  IconNotebook,
  IconHighlight,
  IconBookFilled,
  IconNotebookFilled,
  IconHighlightFilled,
} from "@tabler/icons-react"
import { useAppNavigation } from "../context/app-navigation-context"
import { cn } from "@/lib/utils"
import type { AppView } from "../types"
import { APP_VERSION } from "@/lib/app-env"

interface TabItem {
  id: AppView
  label: string
  icon: React.ComponentType<{ className?: string }>
  activeIcon: React.ComponentType<{ className?: string }>
}

const TAB_ITEMS: TabItem[] = [
  { id: "reader", label: "Leitura", icon: IconBook, activeIcon: IconBookFilled },
  { id: "notes", label: "Notas", icon: IconNotebook, activeIcon: IconNotebookFilled },
  { id: "highlights", label: "Destaques", icon: IconHighlight, activeIcon: IconHighlightFilled },
]

export function MobileTabBar() {
  const { activeView, navigate } = useAppNavigation()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-background/85 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <nav className="flex items-center justify-around h-14 px-4">
        {TAB_ITEMS.map((item) => {
          const isActive = activeView === item.id
          const Icon = isActive ? item.activeIcon : item.icon
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
              <Icon className={cn(
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
      {/* Subtle version */}
      <div className="flex justify-center pb-0.5 -mt-0.5">
        <span className="text-[8px] text-muted-foreground/20 font-mono select-none">v{APP_VERSION}</span>
      </div>
    </div>
  )
}
```

**Verify:** `pnpm lint`

---

#### Task 3.3 — Create ViewContainer
**File:** `features/navigation/components/view-container.tsx` [NEW]

Renders the currently active view. Lazy-loads future views (notes, highlights) with stubs.

```tsx
"use client"

import { useAppNavigation } from "../context/app-navigation-context"
import { useWorkspaceMode } from "@/features/workspace/hooks/use-workspace-mode"
import type { AppView } from "../types"

// Views are imported directly (no dynamic import for reader since it's the default).
// Notes and Highlights will be lazy-loaded stubs initially.
import { SimpleHome } from "@/features/workspace/components/simple-home"
import { AdvancedHome } from "@/features/workspace/components/advanced-home"
import { IconNotebook, IconHighlight } from "@tabler/icons-react"

function NotesStubView() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
      <IconNotebook className="size-12 text-muted-foreground/30" />
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground mb-1">Notas</h2>
        <p className="text-sm max-w-[280px]">
          Em breve você poderá acessar todas as suas notas aqui.
        </p>
      </div>
    </div>
  )
}

function HighlightsStubView() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
      <IconHighlight className="size-12 text-muted-foreground/30" />
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground mb-1">Destaques</h2>
        <p className="text-sm max-w-[280px]">
          Em breve você poderá visualizar todos os seus destaques aqui.
        </p>
      </div>
    </div>
  )
}

export function ViewContainer() {
  const { activeView } = useAppNavigation()
  const { mode, loaded } = useWorkspaceMode()

  if (!loaded) {
    return <div className="h-full bg-background" />
  }

  switch (activeView) {
    case "reader":
      return mode === "advanced" ? <AdvancedHome /> : <SimpleHome />
    case "notes":
      return <NotesStubView />
    case "highlights":
      return <HighlightsStubView />
    default:
      return mode === "advanced" ? <AdvancedHome /> : <SimpleHome />
  }
}
```

**Verify:** `pnpm lint`

---

### Phase 4: Integration — Wiring Everything Together

#### Task 4.1 — Update app/layout.tsx
**File:** `app/layout.tsx` [MODIFY]

Add `AppNavigationProvider` to the provider chain, **inside** `BibleVersionProvider` (navigation needs bible context for the command palette).

```diff
 import { BibleVersionProvider } from "@/features/bible-reader/context/bible-version-context"
+import { AppNavigationProvider } from "@/features/navigation/context/app-navigation-context"
 ...
         <BibleVersionProvider>
+          <AppNavigationProvider>
             <TooltipProvider>
               ...
             </TooltipProvider>
+          </AppNavigationProvider>
         </BibleVersionProvider>
```

**Lines to modify:** Around lines 93-101. Add `AppNavigationProvider` wrapping `TooltipProvider` and its children.

**Verify:** `pnpm lint && pnpm build`

---

#### Task 4.2 — Update app/page.tsx
**File:** `app/page.tsx` [MODIFY]

Replace the direct mode switching with the new layout that includes sidebar + command palette + mobile tab bar + view container.

```tsx
"use client"

import { useState, useCallback, useMemo } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/features/navigation/components/app-sidebar"
import { CommandPalette } from "@/features/navigation/components/command-palette"
import { MobileTabBar } from "@/features/navigation/components/mobile-tab-bar"
import { ViewContainer } from "@/features/navigation/components/view-container"
import { useAppNavigation } from "@/features/navigation/context/app-navigation-context"
import { useGlobalShortcuts } from "@/features/navigation/hooks/use-global-shortcuts"
import { useIsMobile } from "@/lib/use-media-query"
import type { ShortcutDefinition } from "@/features/navigation/types"

export default function Home() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const { navigate } = useAppNavigation()
  const isMobile = useIsMobile()

  const shortcuts: ShortcutDefinition[] = useMemo(() => [
    {
      id: "command-palette",
      label: "Abrir busca",
      keys: "mod+k",
      action: () => setCommandPaletteOpen(true),
      group: "global",
    },
  ], [])

  useGlobalShortcuts(shortcuts)

  return (
    <>
      <SidebarProvider className="h-dvh">
        {!isMobile && (
          <AppSidebar onOpenCommandPalette={() => setCommandPaletteOpen(true)} />
        )}
        <SidebarInset className="w-auto overflow-hidden h-full">
          <ViewContainer />
        </SidebarInset>
      </SidebarProvider>

      {isMobile && <MobileTabBar />}

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </>
  )
}
```

**Verify:** `pnpm lint && pnpm build`

---

#### Task 4.3 — Update SimpleHome to remove duplicated concerns
**File:** `features/workspace/components/simple-home.tsx` [MODIFY]

Remove:
1. The `MobileNav` import and render (replaced by `MobileTabBar`)
2. The `useEffect` for `Cmd+K` (moved to global `useGlobalShortcuts`)
3. The `SidebarProvider` wrapper (now in `app/page.tsx`)

The SimpleHome becomes purely the reader content without layout chrome.

Key changes:
- Remove lines 3 (`useRouter`), 16 (`MobileNav`), 17 (`useIsMobile`)
- Remove the `useEffect` for Cmd+K (lines 56-69)
- Remove `SidebarProvider`/`SidebarInset` wrapper (lines 109, 110, 168)
- Remove `MobileNav` render (line 173)
- Remove `isMobile` state usage
- Keep `BookChapterDialog` but expose `onOpenBookChapterDialog` as a callback prop so the command palette can trigger it
- Add bottom padding on mobile to account for the `MobileTabBar` (h-14 + safe-area)

**Verify:** `pnpm lint && pnpm build && pnpm dev` — test that simple mode renders correctly with the new layout

---

#### Task 4.4 — Update AdvancedHome to remove duplicated concerns
**File:** `features/workspace/components/advanced-home.tsx` [MODIFY]

Remove:
1. `MobileNav` import and render
2. The `useRouter` import (no longer needed)

The AdvancedHome becomes purely the workspace content.

**Verify:** `pnpm lint && pnpm build`

---

#### Task 4.5 — Update WorkspaceView keyboard shortcuts
**File:** `features/workspace/components/workspace-view.tsx` [MODIFY]

The workspace-specific shortcuts (Cmd+T, Cmd+W, Cmd+1-9, etc.) stay in WorkspaceView since they're workspace-scoped. But the tab switcher already uses its own custom overlay which is fine.

The only change: when `tabsOrientation === "vertical"`, instead of rendering `WorkspaceSidebar` as-is, render workspace tab content as a prop to `AppSidebar.workspaceContent`.

This is a **larger refactor** but the key idea:
- Remove the standalone `SidebarProvider` + `WorkspaceSidebar` rendering for vertical orientation
- Instead, let the workspace content flow through the `AppSidebar` via the `workspaceContent` prop
- The workspace pane list becomes a `SidebarGroup` rendered inside the app sidebar

**However:** Since the workspace sidebar has drag-to-resize and complex DnD, this integration should be done carefully. The simplest approach is:
1. When `tabsOrientation === "vertical"` in advanced mode, the `AppSidebar` renders the workspace tab list via `workspaceContent` prop
2. The existing `WorkspaceSidebar` tab list logic is extracted into a reusable `WorkspacePaneList` component

This is the most complex task and should be done carefully.

**Verify:** `pnpm lint && pnpm build && pnpm dev` — test advanced mode with vertical tabs

---

### Phase 5: Polish & Verification

#### Task 5.1 — Add CSS transitions for sidebar and views
**File:** `app/globals.css` [MODIFY]

Add subtle transition utilities:
```css
/* Sidebar transitions */
.sidebar-enter { animation: sidebar-enter 200ms ease-out; }
.sidebar-exit { animation: sidebar-exit 200ms ease-in; }

@keyframes sidebar-enter {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
}

/* View transitions */
.view-enter { animation: view-fade-in 150ms ease-out; }

@keyframes view-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Verify:** `pnpm dev` — visual check

---

#### Task 5.2 — Delete old MobileNav (or make it a re-export)
**File:** `features/layout/components/mobile-nav.tsx` [MODIFY]

The old `MobileNav` is a stub. Any remaining imports should be updated to use `MobileTabBar`. If there are imports that are hard to change, make `MobileNav` a thin wrapper:

```tsx
export { MobileTabBar as MobileNav } from "@/features/navigation/components/mobile-tab-bar"
```

**Verify:** `pnpm lint && pnpm build` — no broken imports

---

#### Task 5.3 — Test the Kbd component rendering
**File:** Verify `components/ui/kbd.tsx` renders correctly by checking the import in `app-sidebar.tsx`. The `Kbd` component from shadcn should accept `keys` prop for modifier display.

If `kbd.tsx` uses a different API, adapt the usage in `app-sidebar.tsx` accordingly. Check the actual component interface.

**Verify:** `pnpm dev` — visual check that ⌘K shows next to search

---

#### Task 5.4 — Final build and lint check

```bash
pnpm lint
pnpm build
```

Fix any issues. Run `pnpm dev` and manually test:
1. Desktop: sidebar visible, collapsible, navigation works
2. Desktop: Cmd+K opens command palette, fuzzy search works, actions execute
3. Desktop: Cmd+\ toggles sidebar
4. Mobile: bottom tab bar visible, navigation works, no sidebar
5. PWA standalone: navigation doesn't open new tabs
6. Simple mode: reader works as before
7. Advanced mode: workspace tabs work, sidebar integrates

---

#### Task 5.5 — Font consistency: remove `font-serif` from UI elements
**Rule:** `font-serif` (Lora) must ONLY be used inside the bible reader text area (controlled by the user's `readerFont` setting). All interface elements (headings, labels, buttons, navigation) must use `font-sans` (Inter).

**Files to modify — replace every `font-serif` with `font-sans`:**

1. **`features/config/components/config-content.tsx`** — all `<h2>` section headings
   - Lines ~298, 340, 375, 411, 466, 578, 650, 906, 970: change `font-serif` → `font-sans`
   - Search for `font-serif` in this file and replace all with `font-sans`

2. **`app/config/page.tsx`** — title "Preferências"
   - Line ~39: `<h1 className="font-serif text-base font-medium">` → `<h1 className="font-sans text-base font-medium">`

3. **`features/bible-reader/components/chapter-grid.tsx`** — book title in chapter grid
   - Line ~31: `<h2 className="font-serif text-base font-semibold ...">` → `<h2 className="font-sans text-base font-semibold ...">`

4. **`features/bible-reader/components/reader-empty.tsx`** — empty state quote
   - Line ~12: `<p className="font-serif text-xl ...">` → `<p className="font-sans text-xl ...">`

5. **`app/~offline/page.tsx`** — offline page title
   - Line ~17: `<h1 className="font-serif text-2xl ...">` → `<h1 className="font-sans text-2xl ...">`

**Do NOT change:**
- `features/bible-reader/components/reader.tsx` — the `readerFont` logic (lines ~288-292) that applies `font-serif`/`font-sans`/`font-mono` to the verse text area. This is the user-controlled reading font setting and must stay as-is.
- `features/bible-reader/components/reader-display-settings.tsx` — the font picker UI that shows Sans/Serif/Mono options. This controls the reader, not the interface.

**Verify:** `pnpm lint && pnpm build`. Then `pnpm dev` → visually confirm:
- Config page headings render in Inter (sans-serif)
- Chapter grid book title renders in Inter
- Reader empty state renders in Inter
- Bible text still renders in Lora (serif) by default (user can switch to sans/mono in display settings)

---

## Dependency Order

```
Phase 1 (no deps)
├── Task 1.1 types
├── Task 1.2 navigation context
└── Task 1.3 global shortcuts hook

Phase 2 (depends on Phase 1)
└── Task 2.1 command palette

Phase 3 (depends on Phase 1)
├── Task 3.1 app sidebar
├── Task 3.2 mobile tab bar
└── Task 3.3 view container

Phase 4 (depends on Phase 2 + 3)
├── Task 4.1 update layout.tsx
├── Task 4.2 update page.tsx (depends on 4.1)
├── Task 4.3 update simple-home.tsx (depends on 4.2)
├── Task 4.4 update advanced-home.tsx (depends on 4.2)
└── Task 4.5 update workspace-view.tsx (depends on 4.3, 4.4)

Phase 5 (depends on Phase 4)
├── Task 5.1 CSS transitions
├── Task 5.2 cleanup old MobileNav
├── Task 5.3 Kbd verification
├── Task 5.4 final build + lint
└── Task 5.5 font consistency (can run in parallel with 5.1-5.4)
```

---

## Important Notes for Implementation

1. **Do NOT use `next/link` or `router.push` for view navigation.** Use the `navigate()` function from `useAppNavigation()` which updates state + shallow URL. This prevents PWA from opening new windows.

2. **The `components/ui/command.tsx` already exists** in the project. Do NOT reinstall cmdk. Just import from `@/components/ui/command`.

3. **The `components/ui/sidebar.tsx` already exists.** Use its primitives (`Sidebar`, `SidebarProvider`, etc.) directly.

4. **The `components/ui/kbd.tsx` already exists.** Check its actual API before using (it might differ from the shadcn standard).

5. **Icon library is `@tabler/icons-react`** (as set in `components.json`). Use Tabler icons consistently. Some files use `lucide-react` — that's okay for existing code, but new code should prefer Tabler.

6. **Tailwind v4** — no `tailwind.config.js`. Custom CSS goes in `globals.css` with `@import "tailwindcss"`. Use Tailwind v4 class syntax.

7. **All UI text in Portuguese** (pt-BR). Code/comments in English.

8. **`pnpm build` uses `next build --webpack`** (not turbopack). TypeScript errors are silently ignored (`ignoreBuildErrors: true`). Still run `pnpm lint` to catch issues.

9. **The project uses `pnpm`**, not `npm` or `yarn`.

10. **The `BookChapterDialog` should NOT be removed or replaced.** The command palette complements it — selecting "Ir para livro/capítulo" in the command palette opens the BookChapterDialog.

11. **Mobile bottom padding:** Views rendered on mobile need `pb-[calc(3.5rem+env(safe-area-inset-bottom))]` (56px tab bar + safe area) to avoid content being hidden behind the fixed tab bar.

12. **Two `useIsMobile` hooks exist:** `hooks/use-mobile.ts` (768px, used by sidebar.tsx) and `lib/use-media-query.ts` (767px, used by features). Use `lib/use-media-query.ts` (`useIsMobile`) for feature code.

13. **The `SidebarProvider` in the current `simple-home.tsx` uses `open={false}` explicitly.** The new architecture moves `SidebarProvider` to `app/page.tsx` where it defaults to open on desktop.

14. **`workspace-sidebar.tsx` has a bug** — it returns JSX on line 155 (the sidebar content) and has unreachable code after line 319 (a ContextMenu wrapper). The second `return` is dead code. When integrating, use only the sidebar content part.
