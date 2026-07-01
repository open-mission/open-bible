"use client"

import { useState, useRef, useEffect } from "react"
import { Book, Check, Download, Trash2, Loader2, ChevronDown, X } from "lucide-react"
import { useBibleVersion } from "@/features/bible-reader/context/bible-version-context"
import { useIsMobile } from "@/lib/use-media-query"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { useToast } from "@/features/layout/hooks/use-toast"
import { DownloadVersionsDialog } from "./download-versions-dialog"

export function BibleVersionSelector() {
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
  const menuRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const { addToast, updateToast, removeToast } = useToast()
  const toastIdRef = useRef<string | null>(null)

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
          updateToast(toastIdRef.current, { message: `${installingName} disponível offline`, type: "success", progress: undefined })
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open && !isMobile) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open, isMobile])

  const currentName =
    versionId === "default"
      ? "Versão padrão"
      : installedVersions.find((v) => v.id === versionId)?.name ??
        availableVersions.find((v) => v.id === versionId)?.name ??
        versionId.toUpperCase()

  const optionsPanel = (
    <div className="p-1.5 space-y-0.5">
      {/* Default option */}
      <button
        onClick={() => {
          setVersionId("default")
          setOpen(false)
        }}
        className={`w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors ${
          versionId === "default"
            ? "bg-accent text-accent-foreground"
            : "hover:bg-secondary text-foreground"
        }`}
      >
        <span className="flex-1 font-medium">Versão padrão</span>
        {versionId === "default" && <Check className="h-3 w-3 shrink-0" />}
      </button>

      <div className="border-t border-border my-1" />

      {/* Installed versions */}
      {installedVersions.map((v) => (
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
            <span className="flex-1 font-medium truncate">{v.name}</span>
            <span className="text-[10px] text-muted-foreground/60 shrink-0">
              {v.books.length}  livros
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
    <div ref={!isMobile ? menuRef : undefined} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors w-full"
      >
        <Book className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate flex-1 text-left">{currentName}</span>
        <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
      </button>

      {open && !isMobile && (
        <div className="absolute bottom-full left-0 right-0 mb-1 max-h-80 overflow-y-auto rounded-lg border border-border bg-card shadow-lg z-50">
          {optionsPanel}
        </div>
      )}

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
