"use client"

import { useState, useRef, useEffect } from "react"
import { Book, Check, Download, Trash2, Loader2, ChevronDown, X } from "lucide-react"
import { useBibleVersion } from "@/lib/bible-version-context"
import { useIsMobile } from "@/lib/use-media-query"
import { useToast } from "@/lib/use-toast"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Button } from "./ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { cn } from "@/lib/utils"
import { DownloadVersionsDialog } from "./download-versions-dialog"

export function ReaderVersionBadge({ className, variant = "outline" }: { className?: string; variant?: "default" | "outline" | "ghost" | "secondary" }) {
  const {
    versionId,
    setVersionId,
    installedVersions,
    availableVersions,
    isInstalling,
    downloadProgress,
    installVersion,
    uninstallVersion,
  } = useBibleVersion()

  const [open, setOpen] = useState(false)
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [installingName, setInstallingName] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const { addToast, updateToast, removeToast } = useToast()
  const toastIdRef = useRef<string | null>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open && !isMobile) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open, isMobile])

  useEffect(() => {
    if (isInstalling && downloadProgress) {
      if (downloadProgress.current === 1 && !toastIdRef.current) {
        toastIdRef.current = addToast({
          message: `Baixando ${installingName}...`,
          type: "loading",
          progress: downloadProgress,
        })
      } else if (toastIdRef.current) {
        updateToast(toastIdRef.current, { progress: downloadProgress })
        if (downloadProgress.current === downloadProgress.total) {
          updateToast(toastIdRef.current, {
            message: `${installingName} disponível offline`,
            type: "success",
            progress: undefined,
          })
          setTimeout(() => {
            if (toastIdRef.current) {
              removeToast(toastIdRef.current)
              toastIdRef.current = null
            }
          }, 4000)
        }
      }
    }
    if (!isInstalling && toastIdRef.current && (!downloadProgress || downloadProgress.current === downloadProgress.total)) {
      toastIdRef.current = null
    }
  }, [isInstalling, downloadProgress, installingName, addToast, updateToast, removeToast])

  const currentAbbr = versionId.toUpperCase()

  const currentFullName =
    installedVersions.find((v) => v.id === versionId)?.name ??
    availableVersions.find((v) => v.id === versionId)?.name ??
    versionId.toUpperCase()

  const allInstalled = installedVersions
  const notInstalled = availableVersions.filter(
    (av) => !installedVersions.find((iv) => iv.id === av.id)
  )

  const optionsPanel = (
    <div className="p-1.5 space-y-0.5">
      {/* Installed versions */}
      {allInstalled.map((v) => (
        <div key={v.id} className="group flex items-center justify-between gap-1 rounded-md hover:bg-secondary transition-colors p-0.5">
          <button
            onClick={() => {
              setVersionId(v.id)
              setOpen(false)
            }}
            className={`flex-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors min-w-0 ${
              versionId === v.id
                ? "bg-accent text-accent-foreground font-semibold"
                : "text-foreground"
            }`}
          >
            <Check
              className={`h-3 w-3 shrink-0 ${
                versionId === v.id ? "opacity-100" : "opacity-0"
              }`}
            />
            <span className="flex-1 font-semibold uppercase">{v.id}</span>
            <span className="text-[10px] text-muted-foreground/60 shrink-0">
              {v.books.length} livros
            </span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (confirm(`Remover "${v.name}" do dispositivo?`)) {
                uninstallVersion(v.id)
              }
            }}
            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0 p-1.5 hover:bg-accent rounded-md"
            aria-label={`Remover ${v.name}`}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ))}

      <div className="border-t border-border my-1" />
      <button
        onClick={() => {
          setOpen(false)
          setDownloadDialogOpen(true)
        }}
        className="w-full flex items-center justify-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium text-primary hover:bg-secondary transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Baixar mais versões</span>
      </button>
    </div>
  )

  return (
    <div className="relative" data-slot="button">
      <Popover open={!isMobile && open} onOpenChange={(val) => !isMobile && setOpen(val)}>
        <PopoverTrigger render={
          <Button
            onClick={() => isMobile && setOpen(true)}
            variant={variant}
            size="lg"
            className={cn(variant === "outline" && "border-l-0", "rounded-[inherit] h-9", className)}
            aria-label="Selecionar versão da Bíblia"
            title={currentFullName}
          />
        }>
          <span className="text-sm font-semibold mx-1">{currentAbbr}</span>
        </PopoverTrigger>

        <PopoverContent className="w-44 p-0 gap-0" align="end" sideOffset={4}>
          {optionsPanel}
        </PopoverContent>
      </Popover>

      {open && isMobile && (
        <BottomSheet open={open} onClose={() => setOpen(false)}>
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-foreground">Selecionar versão</p>
          </div>
          {optionsPanel}
        </BottomSheet>
      )}

      <DownloadVersionsDialog
        open={downloadDialogOpen}
        onClose={() => setDownloadDialogOpen(false)}
      />
    </div>
  )
}
