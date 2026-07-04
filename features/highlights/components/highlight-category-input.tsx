"use client"

import { useState, useEffect, useRef } from "react"
import { IconX, IconPlus } from "@tabler/icons-react"
import type { HighlightCategory } from "@/lib/database/user/schema"

import { InputGroup, InputGroupButton } from "@/components/ui/input-group"

interface HighlightCategoryInputProps {
  values: string[]
  onChange: (categoryIds: string[]) => void
  listCategories: () => Promise<HighlightCategory[]>
  createCategory: (name: string) => Promise<HighlightCategory>
}

export function HighlightCategoryInput({
  values,
  onChange,
  listCategories,
  createCategory,
}: HighlightCategoryInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [categories, setCategories] = useState<HighlightCategory[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listCategories().then(setCategories).catch(() => {})
  }, [listCategories])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter out already selected categories
  const available = categories.filter((c) => !values.includes(c.id))

  const filtered = available.filter((c) =>
    c.name.toLowerCase().includes(inputValue.toLowerCase())
  )

  const exactMatch = categories.find(
    (c) => c.name.toLowerCase() === inputValue.toLowerCase()
  )

  async function handleCreate() {
    const trimmed = inputValue.trim()
    if (!trimmed) return

    // If exact match is already created but not selected, select it
    if (exactMatch) {
      if (!values.includes(exactMatch.id)) {
        onChange([...values, exactMatch.id])
      }
      setInputValue("")
      setShowDropdown(false)
      return
    }

    setLoading(true)
    try {
      const cat = await createCategory(trimmed)
      setCategories((prev) => [...prev, cat])
      onChange([...values, cat.id])
      setInputValue("")
      setShowDropdown(false)
    } finally {
      setLoading(false)
    }
  }

  function handleSelect(cat: HighlightCategory) {
    onChange([...values, cat.id])
    setInputValue("")
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  function handleRemove(id: string) {
    onChange(values.filter((x) => x !== id))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !inputValue && values.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      handleRemove(values[values.length - 1])
    } else if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault()
      handleCreate()
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <InputGroup className="h-auto! py-1 min-h-9 flex-wrap gap-1.5 pr-1.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
        <div className="flex flex-wrap gap-1.5 p-1 flex-1 items-center">
          {values.map((id) => {
            const cat = categories.find((c) => c.id === id)
            if (!cat) return null
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full select-none"
              >
                {cat.name}
                <button
                  type="button"
                  onClick={() => handleRemove(id)}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer"
                  aria-label={`Remover tag ${cat.name}`}
                >
                  <IconX className="size-3" />
                </button>
              </span>
            )
          })}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder={values.length === 0 ? "Categorias / Etiquetas (opcional)" : ""}
            className="flex-1 min-w-[120px] bg-transparent text-sm outline-hidden placeholder:text-muted-foreground/60 text-foreground py-0.5"
          />
        </div>
        {inputValue.trim() && (
          <InputGroupButton
            size="xs"
            onClick={handleCreate}
            disabled={loading}
            className="text-primary hover:bg-primary/10 mr-1 shrink-0 h-6 px-2 rounded-sm font-semibold text-xs flex items-center gap-1 cursor-pointer"
          >
            <IconPlus className="size-3" />
            {loading ? "Criando..." : "Adicionar"}
          </InputGroupButton>
        )}
      </InputGroup>

      {showDropdown && (inputValue.trim() || available.length > 0) && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in-50 zoom-in-95 duration-100 max-h-48 overflow-y-auto p-1">
          {filtered.length > 0 ? (
            filtered.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelect(cat)}
                className="w-full rounded-md px-2 py-1.5 text-left text-xs font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
              >
                {cat.name}
              </button>
            ))
          ) : (
            inputValue.trim() && (
              <p className="text-[11px] text-muted-foreground px-2 py-1.5 italic">
                Nenhuma tag correspondente encontrada
              </p>
            )
          )}
          {inputValue.trim() && !exactMatch && (
            <div className="border-t border-border/60 mt-1 pt-1">
              <button
                type="button"
                onClick={handleCreate}
                disabled={loading}
                className="w-full rounded-md px-2 py-1.5 text-left text-xs font-semibold text-primary hover:bg-primary/10 cursor-pointer transition-colors"
              >
                {loading ? "Criando..." : `Criar nova tag "${inputValue.trim()}"`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
