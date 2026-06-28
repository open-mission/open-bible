"use client"

import { useState } from "react"
import { PenLine, ExternalLink } from "lucide-react"

interface InspectorNotesTabProps {
  verseReference: string
}

export function InspectorNotesTab({ verseReference }: InspectorNotesTabProps) {
  const [noteText, setNoteText] = useState("")

  return (
    <>
      {/* New Note Section */}
      <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <PenLine className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold">New Note</span>
          </div>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Enter your observations..."
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setNoteText("")}
              className="h-8 px-3 text-xs font-medium hover:bg-accent rounded-md transition-colors"
            >
              Cancel
            </button>
            <button className="h-8 px-3 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm">
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Recent Highlights */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
          Recent Highlights
        </h4>
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-card p-3 shadow-sm hover:border-primary/20 transition-all cursor-pointer group">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-primary">Gen 1:1</span>
              <span className="text-[10px] text-muted-foreground">2m ago</span>
            </div>
            <p className="text-xs text-muted-foreground italic leading-relaxed line-clamp-2">
              &quot;In the beginning God created the heaven and the earth.&quot;
            </p>
            <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
