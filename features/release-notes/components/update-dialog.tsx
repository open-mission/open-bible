"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useReleaseNotes } from "./release-notes-provider"
import { IconSparkles } from "@tabler/icons-react"

function parseChangelogToReact(markdown: string) {
  if (!markdown) return null

  const lines = markdown.split(/\r?\n/)
  const elements: React.ReactNode[] = []
  let currentList: React.ReactNode[] = []
  let listKey = 0

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul
          key={`list-${listKey++}`}
          className="list-disc pl-5 my-2 space-y-1 text-muted-foreground text-xs font-sans"
        >
          {currentList}
        </ul>
      )
      currentList = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Pular títulos ## principais de versão
    if (line.startsWith("## ")) {
      flushList()
      continue
    }

    // Títulos de seção (### Added, ### Fixed, etc.)
    if (line.startsWith("### ")) {
      flushList()
      const title = line.replace(/^###\s*/, "")
      // Traduzir títulos comuns
      let displayTitle = title
      const lowerTitle = title.toLowerCase()
      if (lowerTitle === "added") displayTitle = "Adicionado"
      else if (lowerTitle === "fixed") displayTitle = "Corrigido"
      else if (lowerTitle === "changed") displayTitle = "Alterado"
      else if (lowerTitle === "removed") displayTitle = "Removido"
      else if (lowerTitle === "improved") displayTitle = "Melhorado"

      elements.push(
        <h4
          key={`title-${i}`}
          className="text-xs font-semibold text-foreground mt-4 mb-2 first:mt-0 font-serif"
        >
          {displayTitle}
        </h4>
      )
      continue
    }

    // Itens de lista
    if (line.startsWith("-") || line.startsWith("*")) {
      const text = line.replace(/^[-*]\s*/, "")
      currentList.push(
        <li key={`li-${i}`} className="leading-relaxed">
          {text}
        </li>
      )
      continue
    }

    // Linhas de parágrafo comum
    if (line) {
      flushList()
      elements.push(
        <p
          key={`p-${i}`}
          className="text-xs text-muted-foreground my-2 leading-relaxed"
        >
          {line}
        </p>
      )
    }
  }

  flushList()
  return <div className="space-y-1">{elements}</div>
}

export function UpdateDialog() {
  const {
    hasUpdate,
    hasPwaUpdate,
    latestVersion,
    changelog,
    dismiss,
    updateApp,
  } = useReleaseNotes()

  if (!hasUpdate) return null

  return (
    <Dialog
      open={hasUpdate}
      onOpenChange={(open) => {
        if (!open) dismiss()
      }}
    >
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-md border border-border bg-popover text-popover-foreground shadow-2xl rounded-2xl p-6"
      >
        <DialogHeader className="flex flex-col items-center text-center gap-4">
          <div className="flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary animate-pulse">
            <IconSparkles className="size-6" />
          </div>
          <div className="space-y-1.5">
            <DialogTitle className="text-xl font-bold tracking-tight">
              Nova atualização disponível
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Uma nova versão do Open Bible (
              <span className="font-semibold text-primary font-mono">
                v{latestVersion}
              </span>
              ) está pronta para ser instalada.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="border border-border/60 bg-muted/30 rounded-xl p-4 my-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2 font-mono">
            O que há de novo:
          </span>
          <div className="max-h-48 overflow-y-auto pr-1.5 custom-scrollbar text-left">
            {changelog ? (
              parseChangelogToReact(changelog)
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Veja os detalhes da atualização na página oficial de releases.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={dismiss}
            className="w-full sm:w-auto text-xs text-muted-foreground hover:text-foreground cursor-pointer h-9 px-4 rounded-lg order-2 sm:order-1"
          >
            Agora não
          </Button>
          <Button
            size="sm"
            onClick={updateApp}
            className="w-full sm:w-auto text-xs cursor-pointer h-9 px-5 rounded-lg font-medium order-1 sm:order-2 bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md active:scale-[0.98]"
          >
            {hasPwaUpdate ? "Instalar agora" : "Atualizar agora"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
