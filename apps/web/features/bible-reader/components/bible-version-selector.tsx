"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useBibleVersion } from "@/features/bible-reader/context/bible-version-context"
import { VersionPickerDialog } from "./version-picker/version-picker-dialog"

interface BibleVersionSelectorProps {
  className?: string
  variant?: "default" | "outline" | "ghost" | "secondary"
}

/**
 * Trigger compacto (abreviação da versão atual) que abre o VersionPickerDialog.
 * Mantém a assinatura do antigo ReaderVersionBadge para drop-in na pill do
 * header (livro | capítulo | versão).
 */
export function BibleVersionSelector({
  className,
  variant = "outline",
}: BibleVersionSelectorProps) {
  const { versionId, installedVersions, availableVersions } = useBibleVersion()
  const [open, setOpen] = useState(false)

  const currentAbbr = versionId.toUpperCase()
  const currentFullName =
    installedVersions.find((v) => v.id === versionId)?.name ??
    availableVersions.find((v) => v.id === versionId)?.name ??
    versionId.toUpperCase()

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant={variant}
        size="lg"
        className={cn(variant === "outline" && "border-l-0", "rounded-[inherit] h-9", className)}
        aria-label="Selecionar versão da Bíblia"
        title={currentFullName}
      >
        <span className="text-sm font-semibold mx-1">{currentAbbr}</span>
      </Button>

      <VersionPickerDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}
