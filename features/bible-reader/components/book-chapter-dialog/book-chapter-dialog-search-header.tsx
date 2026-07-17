"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Search, X, BookOpen, Check, CornerDownLeft } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { useIsMobile } from "@/lib/use-media-query"
import type { BibleRefResult } from "@/features/bible-reader/utils/parse-bible-ref"

interface BookChapterDialogSearchHeaderProps {
  query: string
  onQueryChange: (q: string) => void
  versionAbbreviation?: string
  versionId: string
  allVersions: { id: string; name: string }[]
  onVersionChange: (id: string) => void
  onClose: () => void
  quickNavResult: BibleRefResult | null
  onQuickNav: () => void
}

/**
 * Search header with input, version dropdown, and close button.
 */
export function BookChapterDialogSearchHeader({
  query,
  onQueryChange,
  versionAbbreviation,
  versionId,
  allVersions,
  onVersionChange,
  onClose,
  quickNavResult,
  onQuickNav,
}: BookChapterDialogSearchHeaderProps) {
  const [versionDropdownOpen, setVersionDropdownOpen] = useState(false)
  const isMobile = useIsMobile()
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input on desktop only when the dialog opens.
  // On mobile, skip to avoid the virtual keyboard popping up unexpectedly.
  useEffect(() => {
    if (isMobile) return
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [isMobile])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && quickNavResult) {
        e.preventDefault()
        onQuickNav()
      }
    },
    [quickNavResult, onQuickNav]
  )

  return (
    <header className="flex items-center px-4 h-14 shrink-0 gap-3 z-10">
      <InputGroup className="flex-1 h-10 shadow-none border-border bg-background">
        <InputGroupAddon align="inline-start">
          <Search className="h-4 w-4 text-muted-foreground" />
        </InputGroupAddon>

        <InputGroupInput
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pesquisar livro ou capítulo..."
          className="text-base md:text-sm placeholder:text-muted-foreground h-full"
        />

        <InputGroupAddon align="inline-end">
          <Popover open={versionDropdownOpen} onOpenChange={setVersionDropdownOpen}>
            <PopoverTrigger render={
              <Button variant="ghost" size="sm" className="h-7 px-2 gap-1.5 font-semibold text-xs cursor-pointer hover:bg-accent max-w-[160px]">
                <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">{versionAbbreviation || versionId}</span>
              </Button>
            } />
            <PopoverContent className="w-64 p-1.5 space-y-0.5" align="end">
              <div className="px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Versões da Bíblia
              </div>
              <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-0.5">
                {allVersions.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      onVersionChange(v.id)
                      setVersionDropdownOpen(false)
                    }}
                    className={`w-full flex items-center justify-between rounded-md px-2.5 py-2 text-left text-xs transition-colors cursor-pointer ${versionId === v.id
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "hover:bg-secondary text-foreground"
                      }`}
                  >
                    <span className="truncate mr-2">{v.name}</span>
                    {versionId === v.id && (
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </InputGroupAddon>

        <InputGroupAddon align="inline-end" className="hidden md:flex pr-1">
          <InputGroupButton
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Fechar"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {quickNavResult && (
        <div className="flex items-center gap-1.5 px-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary bg-primary/8 border border-primary/15 rounded-md px-2 py-0.5">
            <CornerDownLeft className="h-3 w-3" />
            {quickNavResult.book.name} {quickNavResult.chapter}
          </span>
        </div>
      )}
    </header>
  )
}
