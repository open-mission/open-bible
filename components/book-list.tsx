"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { OLD_TESTAMENT, NEW_TESTAMENT } from "@/lib/bible-data"
import type { Book } from "@/lib/types"

interface BookListProps {
  selectedBookId: string | null
  onSelectBook: (bookId: string) => void
}

export function BookList({ selectedBookId, onSelectBook }: BookListProps) {
  const [query, setQuery] = useState("")
  const [testament, setTestament] = useState<"old" | "new">("old")

  const books = testament === "old" ? OLD_TESTAMENT : NEW_TESTAMENT
  const filtered = query.trim()
    ? books.filter(
        (b) =>
          b.name.toLowerCase().includes(query.toLowerCase()) ||
          b.abbreviation.toLowerCase().includes(query.toLowerCase())
      )
    : books

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 py-4">
        <h1 className="font-serif text-lg font-semibold text-foreground tracking-wide">
          Open Bible
        </h1>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar livro..."
            className="w-full rounded-md border border-border bg-background pl-8 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Testament tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setTestament("old")}
          className={`flex-1 py-2.5 text-xs font-medium tracking-wide transition-colors ${
            testament === "old"
              ? "text-primary border-b-2 border-primary bg-accent/40"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Antigo Testamento
        </button>
        <button
          onClick={() => setTestament("new")}
          className={`flex-1 py-2.5 text-xs font-medium tracking-wide transition-colors ${
            testament === "new"
              ? "text-primary border-b-2 border-primary bg-accent/40"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Novo Testamento
        </button>
      </div>

      {/* Book list */}
      <div className="flex-1 overflow-y-auto py-1">
        {filtered.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Nenhum livro encontrado.
          </p>
        ) : (
          filtered.map((book) => (
            <BookItem
              key={book.id}
              book={book}
              isSelected={book.id === selectedBookId}
              onSelect={() => onSelectBook(book.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface BookItemProps {
  book: Book
  isSelected: boolean
  onSelect: () => void
}

function BookItem({ book, isSelected, onSelect }: BookItemProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors group ${
        isSelected
          ? "bg-accent text-accent-foreground"
          : "hover:bg-secondary text-foreground"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`w-7 text-right text-xs font-mono font-medium shrink-0 ${
            isSelected ? "text-accent-foreground/70" : "text-muted-foreground"
          }`}
        >
          {book.abbreviation}
        </span>
        <span className="text-sm font-medium">{book.name}</span>
      </div>
      <span
        className={`text-xs shrink-0 ${
          isSelected ? "text-accent-foreground/60" : "text-muted-foreground/60"
        }`}
      >
        {book.chapters}
      </span>
    </button>
  )
}
