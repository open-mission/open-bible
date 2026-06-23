"use client"

import { useState, useRef, useEffect } from "react"
import { Book, Check, ChevronDown } from "lucide-react"
import { useBibleVersion } from "@/lib/bible-version-context"
import { useIsMobile } from "@/lib/use-media-query"
import { BottomSheet } from "@/components/ui/bottom-sheet"

export function ReaderVersionBadge() {
  const { versionId, setVersionId, installedVersions } = useBibleVersion()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open && !isMobile) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open, isMobile])

  const currentAbbr =
    versionId === "default" ? "Padrão" : versionId.toUpperCase()

  const currentFullName =
    versionId === "default"
      ? "Versão padrão"
      : installedVersions.find((v) => v.id === versionId)?.name ?? versionId.toUpperCase()

  const allOptions = [
    { id: "default", name: "Versão padrão" },
    ...installedVersions.map((v) => ({ id: v.id, name: v.name })),
  ]

  const optionsList = (
    <div className="p-1 space-y-0.5">
      {allOptions.map((opt) => (
        <button
          key={opt.id}
          onClick={() => {
            setVersionId(opt.id)
            setOpen(false)
          }}
          className={`w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
            versionId === opt.id
              ? "bg-accent text-accent-foreground"
              : "hover:bg-secondary text-foreground"
          }`}
        >
          <Check
            className={`h-3 w-3 shrink-0 ${
              versionId === opt.id ? "opacity-100" : "opacity-0"
            }`}
          />
          <span className="font-medium truncate">{opt.name}</span>
        </button>
      ))}
    </div>
  )

  return (
    <div ref={!isMobile ? ref : undefined} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label="Selecionar versão da Bíblia"
        title={currentFullName}
      >
        <Book className="h-3.5 w-3.5 shrink-0" />
        <span>{currentAbbr}</span>
        <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
      </button>

      {open && !isMobile && (
        <div className="absolute right-0 top-full mt-1 min-w-40 rounded-lg border border-border bg-card shadow-lg z-50">
          {optionsList}
        </div>
      )}

      {open && isMobile && (
        <BottomSheet open={open} onClose={() => setOpen(false)}>
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-foreground">Selecionar versão</p>
          </div>
          {optionsList}
        </BottomSheet>
      )}
    </div>
  )
}
