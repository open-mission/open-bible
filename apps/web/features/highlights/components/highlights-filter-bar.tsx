"use client"

import { useState } from "react"
import { Check, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/lib/use-media-query"
import { getBookName } from "@/lib/books"
import type { AllHighlightEntry } from "../hooks/use-all-highlights"
import { getContrastColor, neonColors, type NeonColor } from "../utils/highlight-colors"

export interface HighlightFilters {
  query: string
  color: string
  category: string
  book: string
  bible: string
  dateFrom: string
  dateTo: string
}

export const EMPTY_HIGHLIGHT_FILTERS: HighlightFilters = {
  query: "",
  color: "",
  category: "",
  book: "",
  bible: "",
  dateFrom: "",
  dateTo: "",
}

function dayStart(value: string): number | null {
  if (!value) return null
  const time = new Date(`${value}T00:00:00`).getTime()
  return Number.isNaN(time) ? null : time
}

function dayEnd(value: string): number | null {
  const start = dayStart(value)
  return start === null ? null : start + 86_400_000 - 1
}

export function filterHighlights(
  entries: AllHighlightEntry[],
  filters: HighlightFilters,
): AllHighlightEntry[] {
  const query = filters.query.trim().toLocaleLowerCase()
  const from = dayStart(filters.dateFrom)
  const to = dayEnd(filters.dateTo)

  return entries.filter((entry) => {
    const createdAt = entry.highlight.createdAt.getTime()
    const searchable = [
      entry.highlight.content,
      entry.category?.name,
      entry.highlight.color,
      ...entry.verseItems.flatMap((item) => [item.reference, item.text]),
      ...entry.verses.flatMap((verse) => [verse.book, getBookName(verse.book)]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase()

    return (
      (!query || searchable.includes(query)) &&
      (!filters.color || entry.highlight.color.toLocaleLowerCase() === filters.color.toLocaleLowerCase()) &&
      (!filters.category || entry.highlight.categoryId === filters.category) &&
      (!filters.book || entry.verses.some((verse) => verse.book === filters.book)) &&
      (!filters.bible || entry.verses.some((verse) => verse.bible === filters.bible)) &&
      (from === null || createdAt >= from) &&
      (to === null || createdAt <= to)
    )
  })
}

export function buildBookFilterOptions(verses: Array<{ book: string }>) {
  return Array.from(new Set(verses.map((verse) => verse.book)))
    .map((book) => ({ value: book, label: getBookName(book) }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"))
}

export function getColorFilterAriaLabel(hex: string): string {
  const name = neonColors.find((color) => color.hex.toLowerCase() === hex.toLowerCase())?.name
  const labels: Record<string, string> = {
    Amber: "âmbar",
    Blue: "azul",
    Cyan: "ciano",
    Emerald: "esmeralda",
    Green: "verde",
    Orange: "laranja",
    Pink: "rosa",
    Purple: "roxa",
    Red: "vermelha",
    Rose: "rosada",
    Violet: "violeta",
    Yellow: "amarela",
  }
  return name ? `Cor ${labels[name] ?? name.toLocaleLowerCase()}` : `Cor ${hex}`
}

interface HighlightsFilterBarProps {
  value: HighlightFilters
  entries: AllHighlightEntry[]
  onChange: (value: HighlightFilters) => void
}

interface FilterFieldsProps {
  value: HighlightFilters
  categories: Array<[string, string]>
  books: Array<{ value: string; label: string }>
  bibles: string[]
  colors: NeonColor[]
  onChange: (patch: Partial<HighlightFilters>) => void
}

function FilterFields({ value, categories, books, bibles, colors, onChange }: FilterFieldsProps) {
  const selectValue = (filterValue: string) => filterValue || "__all__"
  const setSelect = (key: "category" | "book" | "bible", nextValue: string | null) => {
    onChange({ [key]: !nextValue || nextValue === "__all__" ? "" : nextValue })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Cor</span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por cor">
          <button
            type="button"
            aria-label="Todas as cores"
            aria-pressed={!value.color}
            onClick={() => onChange({ color: "" })}
            className={cn(
              "flex size-9 items-center justify-center rounded-full border border-dashed border-muted-foreground/50 text-xs text-muted-foreground transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              !value.color && "border-primary bg-primary/10 text-primary",
            )}
          >
            Todas
          </button>
          {colors.map((color) => {
            const selected = value.color.toLowerCase() === color.hex.toLowerCase()
            return (
              <button
                key={color.hex}
                type="button"
                aria-label={getColorFilterAriaLabel(color.hex)}
                aria-pressed={selected}
                onClick={() => onChange({ color: color.hex })}
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border border-border/30 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95",
                  selected && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                )}
                style={{ backgroundColor: color.hex }}
              >
                {selected && <Check className="size-4" color={getContrastColor(color.hex)} strokeWidth={3} />}
              </button>
            )
          })}
        </div>
      </div>

      <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
        Categoria
        <Select value={selectValue(value.category)} onValueChange={(nextValue) => setSelect("category", nextValue)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {categories.find(([id]) => id === value.category)?.[1] ?? "Todas as categorias"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas as categorias</SelectItem>
            {categories.map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}
          </SelectContent>
        </Select>
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
        Livro
        <Select value={selectValue(value.book)} onValueChange={(nextValue) => setSelect("book", nextValue)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {books.find((book) => book.value === value.book)?.label ?? "Todos os livros"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos os livros</SelectItem>
            {books.map((book) => <SelectItem key={book.value} value={book.value}>{book.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
        Bíblia
        <Select value={selectValue(value.bible)} onValueChange={(nextValue) => setSelect("bible", nextValue)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {value.bible ? value.bible.toUpperCase() : "Todas as Bíblias"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas as Bíblias</SelectItem>
            {bibles.map((bible) => <SelectItem key={bible} value={bible}>{bible.toUpperCase()}</SelectItem>)}
          </SelectContent>
        </Select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
          A partir de
          <Input aria-label="Data inicial" type="date" value={value.dateFrom} onChange={(event) => onChange({ dateFrom: event.target.value })} />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
          Até
          <Input aria-label="Data final" type="date" value={value.dateTo} onChange={(event) => onChange({ dateTo: event.target.value })} />
        </label>
      </div>
    </div>
  )
}

export function HighlightsFilterBar({ value, entries, onChange }: HighlightsFilterBarProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const categories = Array.from(
    new Map(
      entries
        .filter((entry) => entry.category)
        .map((entry) => [entry.category!.id, entry.category!.name]),
    ),
  )
  const books = buildBookFilterOptions(entries.flatMap((entry) => entry.verses))
  const bibles = Array.from(new Set(entries.flatMap((entry) => entry.verses.map((verse) => verse.bible)))).sort()
  const colors = Array.from(
    new Map([
      ...neonColors.map((color) => [color.hex, color] as const),
      ...entries
        .map((entry) => entry.highlight.color)
        .filter((hex) => !neonColors.some((color) => color.hex.toLowerCase() === hex.toLowerCase()))
        .map((hex) => [hex, { name: "", hex }] as const),
    ]).values(),
  )
  const activeFilterCount = [value.color, value.category, value.book, value.bible, value.dateFrom, value.dateTo].filter(Boolean).length
  const hasFilters = Boolean(value.query) || activeFilterCount > 0
  const set = (patch: Partial<HighlightFilters>) => onChange({ ...value, ...patch })

  const fields = (
    <FilterFields
      value={value}
      categories={categories}
      books={books}
      bibles={bibles}
      colors={colors}
      onChange={set}
    />
  )

  return (
    <div className="flex shrink-0 items-center gap-2 px-4 pb-3 sm:px-5 sm:pb-4">
      <Input
        aria-label="Buscar destaques"
        placeholder="Buscar conteúdo ou versículo..."
        value={value.query}
        onChange={(event) => set({ query: event.target.value })}
        className="h-9 min-w-0 flex-1"
      />
      <Button
        type="button"
        variant="outline"
        className="shrink-0 gap-2"
        aria-label={activeFilterCount ? `Filtros, ${activeFilterCount} ativos` : "Abrir filtros"}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Filter className="size-4" />
        <span className="hidden sm:inline">Filtros</span>
        {activeFilterCount > 0 && <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">{activeFilterCount}</span>}
      </Button>
      {hasFilters && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Limpar filtros"
          onClick={() => onChange(EMPTY_HIGHLIGHT_FILTERS)}
        >
          <X />
        </Button>
      )}

      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader className="border-b border-border text-left">
              <DrawerTitle>Filtros</DrawerTitle>
              <DrawerDescription>Refine seus destaques por cor, categoria, livro, Bíblia ou data.</DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto p-5">{fields}</div>
            <DrawerFooter className="border-t border-border">
              <Button type="button" onClick={() => setOpen(false)}>Ver resultados</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="sm:max-w-md">
            <SheetHeader className="border-b border-border">
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>Refine seus destaques por cor, categoria, livro, Bíblia ou data.</SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-5">{fields}</div>
            <SheetFooter className="border-t border-border">
              <Button type="button" onClick={() => setOpen(false)}>Ver resultados</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}

export default HighlightsFilterBar
