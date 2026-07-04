"use client"

import { useState, useEffect, useRef } from "react"
import type { HighlightCategory } from "@/lib/database/user/schema"
import { cn } from "@/lib/utils"

interface HighlightCategoryInputProps {
  value: string | null
  onChange: (categoryId: string | null, categoryName?: string) => void
  listCategories: () => Promise<HighlightCategory[]>
  createCategory: (name: string) => Promise<HighlightCategory>
}

export function HighlightCategoryInput({
  value,
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

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(inputValue.toLowerCase())
  )

  const exactMatch = categories.find(
    (c) => c.name.toLowerCase() === inputValue.toLowerCase()
  )

  async function handleCreate() {
    if (!inputValue.trim()) return
    setLoading(true)
    try {
      const cat = await createCategory(inputValue.trim())
      setCategories((prev) => [...prev, cat])
      onChange(cat.id, cat.name)
      setInputValue(cat.name)
      setShowDropdown(false)
    } finally {
      setLoading(false)
    }
  }

  function handleSelect(cat: HighlightCategory) {
    onChange(cat.id, cat.name)
    setInputValue(cat.name)
    setShowDropdown(false)
  }

  function handleClear() {
    onChange(null)
    setInputValue("")
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Categoria (opcional)"
          className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Limpar
          </button>
        )}
      </div>
      {showDropdown && inputValue.trim() && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-md">
          {filtered.length > 0 && (
            <div className="max-h-40 overflow-y-auto p-1">
              {filtered.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelect(cat)}
                  className={cn(
                    "w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent",
                    value === cat.id && "bg-accent"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
          {!exactMatch && (
            <div className="border-t p-1">
              <button
                type="button"
                onClick={handleCreate}
                disabled={loading}
                className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-primary hover:bg-accent"
              >
                {loading ? "Criando..." : `Criar "${inputValue.trim()}"`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
