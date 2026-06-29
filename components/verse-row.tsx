import type { Verse } from "@/lib/types"

interface VerseRowProps {
  verse: Verse
  isActive: boolean
  isSelected?: boolean
  onClick: () => void
  verseSpacing?: "small" | "medium" | "large"
}

export function VerseRow({ verse, isActive, isSelected, onClick, verseSpacing = "medium" }: VerseRowProps) {
  const spacingClasses = {
    small: "py-1.5 mb-1",
    medium: "py-2.5 mb-2",
    large: "py-4 mb-4",
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      style={
        isSelected
          ? { backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }
          : undefined
      }
      className={`group relative flex gap-4 px-4 sm:px-6 ${spacingClasses[verseSpacing]} cursor-pointer rounded-md transition-colors select-text ${isActive
          ? "bg-accent/60"
          : isSelected
            ? "ring-1 ring-inset ring-primary/30"
            : "hover:bg-secondary/60"
        }`}
      aria-pressed={isActive}
    >
      {/* Verse number */}
      <sup className="font-verse-number text-xs font-bold text-muted-foreground/60 shrink-0">
        {verse.verse}
      </sup>

      {/* Verse text */}
      <p className="flex-1 leading-[1.8] text-foreground">
        {verse.text}
      </p>
    </div>
  )
}

