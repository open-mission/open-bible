"use client"

interface InspectorRefsTabProps {
  verseReference: string
}

export function InspectorRefsTab({ verseReference }: InspectorRefsTabProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
        Cross References
      </h4>
      <div className="space-y-4">
        <div className="group cursor-pointer">
          <span className="text-xs font-semibold group-hover:text-primary transition-colors block mb-1">
            John 1:1
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed">
            In the beginning was the Word, and the Word was with God...
          </p>
        </div>
        <div className="group cursor-pointer">
          <span className="text-xs font-semibold group-hover:text-primary transition-colors block mb-1">
            Psalms 102:25
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Of old hast thou laid the foundation of the earth...
          </p>
        </div>
      </div>
    </div>
  )
}
