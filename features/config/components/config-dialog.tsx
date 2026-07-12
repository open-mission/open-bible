"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import { ConfigContent } from "./config-content"

interface ConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Settings surface: a centered Dialog on desktop and a full-height Drawer on
 * mobile. Replaces the standalone /config page navigation for a smoother,
 * PWA-safe experience (no new browser tab / route change).
 */
export function ConfigDialog({ open, onOpenChange }: ConfigDialogProps) {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return true
    return window.matchMedia("(min-width: 768px)").matches
  })

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)")
    const listener = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [])

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>Preferências</DialogTitle>
            <DialogDescription>
              Personalize a versão bíblica, o tema e o modo de leitura.
            </DialogDescription>
          </DialogHeader>
          <ConfigContent />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-dvh max-h-dvh rounded-none">
        <DrawerHeader className="text-left">
          <DrawerTitle>Preferências</DrawerTitle>
          <DrawerDescription>
            Personalize a versão bíblica, o tema e o modo de leitura.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-8">
          <ConfigContent />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
