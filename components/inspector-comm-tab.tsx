"use client"

interface InspectorCommTabProps {
  verseReference: string
}

export function InspectorCommTab({ verseReference }: InspectorCommTabProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
        Commentary
      </h4>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Commentary for {verseReference} will appear here.
      </p>
    </div>
  )
}
