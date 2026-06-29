"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Download, Loader2, X, Check } from "lucide-react"
import { useBibleVersion } from "@/lib/bible-version-context"
import { useIsMobile } from "@/lib/use-media-query"
import { BottomSheet } from "@/components/ui/bottom-sheet"

const VERSION_SIZES: Record<string, string> = {
  acf: "4.3 MB",
  alm1911: "4.3 MB",
  ara: "4.3 MB",
  arc: "4.3 MB",
  as21: "4.2 MB",
  blivre: "4.3 MB",
  jfaa: "4.3 MB",
  kja: "4.9 MB",
  kjf: "4.5 MB",
  mens: "4.5 MB",
  naa: "4.5 MB",
  nbv: "4.8 MB",
  ntlh: "5.1 MB",
  nvi: "4.3 MB",
  nvt: "4.4 MB",
  ol: "4.5 MB",
  tb: "4.3 MB",
  vfl: "4.6 MB",
}

interface DownloadVersionsDialogProps {
  open: boolean
  onClose: () => void
}

export function DownloadVersionsDialog({ open, onClose }: DownloadVersionsDialogProps) {
  const isMobile = useIsMobile()
  const {
    installedVersions,
    availableVersions,
    isInstalling,
    downloadProgress,
    installVersion,
  } = useBibleVersion()

  const [installingName, setInstallingName] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!open || !mounted) return null

  const content = (
    <div className="flex flex-col h-full bg-card p-5 relative max-h-[80vh] md:max-h-none overflow-hidden">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-secondary transition-colors cursor-pointer"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>

      <h3 className="text-sm font-semibold mb-3">Baixar Versões Bíblicas</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Baixe as versões abaixo para leitura offline. Os arquivos são salvos diretamente no seu dispositivo.
      </p>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {availableVersions.map((v) => {
          const isInstalled = installedVersions.some((iv) => iv.id === v.id)
          return (
            <div
              key={v.id}
              className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 hover:bg-secondary/40 transition-colors"
            >
              <div className="min-w-0 pr-2">
                <p className="text-xs font-medium truncate">{v.name}</p>
                <p className="text-[10px] text-muted-foreground/60">
                  {v.totalBooks}  livros • {VERSION_SIZES[v.id] || "4.5 MB"} • SQLite
                </p>
              </div>
              {isInstalled ? (
                <div className="flex items-center gap-1 text-emerald-500 font-semibold text-[10px] px-2.5 py-1.5 shrink-0 select-none">
                  <Check className="h-3.5 w-3.5" />
                  <span>Instalado</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setInstallingName(v.name)
                    installVersion(v.id)
                  }}
                  disabled={isInstalling}
                  className="rounded bg-primary text-primary-foreground text-[10px] px-2.5 py-1.5 font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1 shrink-0 transition-opacity cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  <span>Baixar</span>
                </button>
              )}
            </div>
          )
        })}
      </div>

      {isInstalling && downloadProgress && (
        <div className="mt-4 pt-3 border-t border-border shrink-0">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>
              Baixando {installingName}... {Math.round((downloadProgress.current / downloadProgress.total) * 100)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{
                width: `${(downloadProgress.current / downloadProgress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <BottomSheet open={open} onClose={onClose} size="95">
        <div className="flex flex-col h-[80vh]">
          {content}
        </div>
      </BottomSheet>
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="bg-background w-full max-w-4xl h-full max-h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-border animate-in fade-in zoom-in-95 duration-200">
        {content}
      </div>
    </div>,
    document.body
  )
}
