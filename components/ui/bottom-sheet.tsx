"use client"

import { useIsMobile } from "@/lib/use-media-query"
import { Drawer, DrawerContent } from "./drawer"
import { Dialog, DialogContent } from "./dialog"
import { cn } from "@/lib/utils"

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  fullScreen?: boolean
  size?: "default" | "95" | "full"
  children: React.ReactNode
}

export function BottomSheet({
  open,
  onClose,
  fullScreen,
  size = "default",
  children,
}: BottomSheetProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    const isFull = fullScreen || size === "full"
    const is95 = size === "95"

    return (
      <Drawer open={open} onOpenChange={(val) => !val && onClose()}>
        <DrawerContent
          className={cn(
            "p-0 border-none outline-none overflow-hidden bg-background",
            isFull
              ? "data-[vaul-drawer-direction=bottom]:h-dvh data-[vaul-drawer-direction=bottom]:max-h-dvh data-[vaul-drawer-direction=bottom]:rounded-t-none"
              : is95
                ? "data-[vaul-drawer-direction=bottom]:h-[95dvh] data-[vaul-drawer-direction=bottom]:max-h-[95dvh]"
                : "data-[vaul-drawer-direction=bottom]:max-h-[80vh]"
          )}
        >
          <div className="flex-1 overflow-y-auto overscroll-contain no-scrollbar">
            {children}
          </div>
          <div className="shrink-0 h-[env(safe-area-inset-bottom,16px)]" />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent showCloseButton={false} className="max-w-lg p-0 gap-0 overflow-hidden border border-border shadow-xl">
        <div className="overflow-y-auto max-h-[85vh] no-scrollbar">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
