"use client"

import { useEffect, useState } from "react"
import { Minus, Square, Copy, X } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { desktopRuntime, desktopRuntimeKind } from "@/lib/desktop-runtime"

const dragStyle = { WebkitAppRegion: "drag" } as React.CSSProperties
const noDragStyle = { WebkitAppRegion: "no-drag" } as React.CSSProperties

function WindowControls({ maximized }: { maximized: boolean }) {
  return (
    <div className="flex h-full items-center" style={noDragStyle}>
      <button
        type="button"
        aria-label="Minimizar janela"
        title="Minimizar"
        className="flex h-9 w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={() => void desktopRuntime.window.minimize()}
      >
        <Minus className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label={maximized ? "Restaurar janela" : "Maximizar janela"}
        title={maximized ? "Restaurar" : "Maximizar"}
        className="flex h-9 w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={() => void desktopRuntime.window.toggleMaximize()}
      >
        {maximized ? <Copy className="size-3" /> : <Square className="size-3" />}
      </button>
      <button
        type="button"
        aria-label="Fechar janela"
        title="Fechar"
        className="flex h-9 w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
        onClick={() => void desktopRuntime.window.close()}
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

export function DesktopTitlebar() {
  const router = useRouter()
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    if (desktopRuntimeKind !== "electron") return
    return desktopRuntime.onWindowState(setMaximized)
  }, [])

  if (desktopRuntimeKind !== "electron") return null

  const isMac = desktopRuntime.platform === "darwin"
  const menu = (
    <Menubar className="h-9 border-0 bg-transparent p-0 shadow-none" style={noDragStyle}>
      <MenubarMenu>
        <MenubarTrigger className="h-8 rounded-md px-2.5 text-xs font-medium">
          Open Bible
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => router.push("/config")}>
            Configurações
            <MenubarShortcut>{isMac ? "⌘," : "Ctrl+,"}</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={() => void desktopRuntime.window.close()}>
            Sair
            <MenubarShortcut>{isMac ? "⌘Q" : "Alt+F4"}</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )

  return (
    <header
      className="flex h-9 shrink-0 items-center border-b border-border/70 bg-background/95 text-foreground backdrop-blur"
      style={dragStyle}
    >
      {isMac && <WindowControls maximized={maximized} />}
      {menu}
      <div className="flex-1" />
      {!isMac && <WindowControls maximized={maximized} />}
    </header>
  )
}
