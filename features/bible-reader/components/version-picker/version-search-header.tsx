"use client"

import { Search, X } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"

interface VersionSearchHeaderProps {
  query: string
  onQueryChange: (q: string) => void
  onClose: () => void
}

/**
 * Header fixo (altura h-14) com InputGroup de busca + botão fechar.
 * Espelha o header do book-chapter-dialog.
 */
export function VersionSearchHeader({ query, onQueryChange, onClose }: VersionSearchHeaderProps) {
  return (
    <header className="flex items-center px-4 h-14 shrink-0 gap-3 z-10">
      <InputGroup className="flex-1 h-10 shadow-none border-border bg-background">
        <InputGroupAddon align="inline-start">
          <Search className="h-4 w-4 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Pesquisar versão..."
          className="text-base md:text-sm placeholder:text-muted-foreground h-full"
        />
      </InputGroup>
      <button
        onClick={onClose}
        className="p-1.5 hover:bg-accent rounded-md text-muted-foreground transition-colors cursor-pointer shrink-0"
        aria-label="Fechar"
      >
        <X className="h-5 w-5" />
      </button>
    </header>
  )
}
