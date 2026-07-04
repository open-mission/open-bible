"use client"

import { ArrowRight } from "lucide-react"
import { OLD_TESTAMENT, NEW_TESTAMENT } from "@/features/bible-reader/utils/bible-data"
import type { Book } from "@/lib/types"

interface BookChapterDialogBookListProps {
  books: Book[] | null
  selectedBookId: string | null
  onSelectBook: (id: string) => void
}

/**
 * Book selection button with arrow indicator.
 */
function BookButton({ book, isSelected, onClick }: {
  book: Book
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full group text-left px-4 py-3.5 text-base md:text-sm rounded-lg border transition-all cursor-pointer flex items-center justify-between ${isSelected
        ? "bg-primary text-primary-foreground font-semibold border-primary shadow-sm"
        : "border-border hover:bg-accent/60 text-foreground"
        }`}
    >
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold">{book.name}</span>
        <span className={`text-[10px] uppercase tracking-wider font-semibold ${isSelected ? "text-primary-foreground/75" : "text-muted-foreground/75"}`}>
          {book.abbreviation}
        </span>
      </div>
      <ArrowRight className={`h-4 w-4 transition-transform duration-200 ${isSelected ? "text-primary-foreground translate-x-0.5" : "text-muted-foreground/50 group-hover:translate-x-0.5"}`} />
    </button>
  )
}

/**
 * Testament section with title and book grid.
 */
function BookSection({ title, books, selectedBookId, onSelectBook }: {
  title: string
  books: Book[]
  selectedBookId: string | null
  onSelectBook: (id: string) => void
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {books.map((book) => (
          <BookButton
            key={book.id}
            book={book}
            isSelected={book.id === selectedBookId}
            onClick={() => onSelectBook(book.id)}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Book list with Old/New Testament sections or filtered results.
 */
export function BookChapterDialogBookList({
  books,
  selectedBookId,
  onSelectBook,
}: BookChapterDialogBookListProps) {
  return (
    <div className="space-y-6">
      {books ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {books.map((book) => (
            <BookButton
              key={book.id}
              book={book}
              isSelected={book.id === selectedBookId}
              onClick={() => onSelectBook(book.id)}
            />
          ))}
        </div>
      ) : (
        <>
          <BookSection
            title="Antigo Testamento"
            books={OLD_TESTAMENT}
            selectedBookId={selectedBookId}
            onSelectBook={onSelectBook}
          />
          <BookSection
            title="Novo Testamento"
            books={NEW_TESTAMENT}
            selectedBookId={selectedBookId}
            onSelectBook={onSelectBook}
          />
        </>
      )}
    </div>
  )
}
