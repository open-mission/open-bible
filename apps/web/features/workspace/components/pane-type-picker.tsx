"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer"
import { useWorkspace } from "../context/workspace-context"
import { PANE_TYPE_OPTIONS } from "../lib/pane-type-options"
import { useIsMobile } from "@/lib/use-media-query"

export function PaneTypePicker({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  const { openPane } = useWorkspace()
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)

  if (isMobile) {
    return (
      <>
        <button
          type="button"
          aria-label="Nova aba"
          onClick={() => setDrawerOpen(true)}
          className={className ?? "flex items-center justify-center rounded-md size-10 text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring"}
        >
          {children || <Plus className="size-5" />}
        </button>
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="p-4 pb-safe">
            <DrawerHeader className="px-0 pt-0 pb-2">
              <DrawerTitle>Abrir nova aba</DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col gap-1">
              {PANE_TYPE_OPTIONS.map((opt) => (
                <DrawerClose key={opt.type} asChild>
                  <button
                    type="button"
                    onClick={() => openPane(opt.state)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <opt.icon />
                    <span>{opt.label}</span>
                  </button>
                </DrawerClose>
              ))}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Nova aba"
        className={className ?? "flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring"}
      >
        {children || <Plus className="h-4 w-4" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="bottom" sideOffset={4}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Abrir nova aba</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {PANE_TYPE_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.type}
              onClick={() => openPane(opt.state)}
            >
              <opt.icon />
              <span>{opt.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
