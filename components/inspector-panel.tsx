"use client"

import { useState } from "react"
import { FileText, Link, MessageSquare, ShieldUser, X } from "lucide-react"
import { InspectorNotesTab } from "./inspector-notes-tab"
import { InspectorRefsTab } from "./inspector-refs-tab"
import { InspectorCommTab } from "./inspector-comm-tab"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { useIsMobile } from "@/lib/use-media-query"

interface InspectorPanelProps {
  verseReference: string
  onVerseClick: (verseId: string) => void
  isOpen: boolean
  onClose: () => void
}

const tabs = [
  { id: "notes" as const, label: "Notes", icon: FileText },
  { id: "refs" as const, label: "Refs", icon: Link },
  { id: "comm" as const, label: "Comm", icon: MessageSquare },
]

export function InspectorPanel({ verseReference, onVerseClick, isOpen, onClose }: InspectorPanelProps) {
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState<"notes" | "refs" | "comm">("notes")

  if (!isOpen) return null

  const panelContent = (
    <>
      <header className="p-6 pb-4 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight">Inspector</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-md text-muted-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{verseReference}</p>
      </header>

      {/* Tab Navigation */}
      <div className="px-4 mb-6">
        <nav className="flex p-1 gap-1 bg-muted rounded-md h-10 items-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-6 space-y-8 custom-scrollbar pb-8">
        {activeTab === "notes" && <InspectorNotesTab verseReference={verseReference} />}
        {activeTab === "refs" && <InspectorRefsTab verseReference={verseReference} />}
        {activeTab === "comm" && <InspectorCommTab verseReference={verseReference} />}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Editor Mode: <span className="font-bold text-foreground">Active</span></span>
          <ShieldUser className="h-3.5 w-3.5" />
        </div>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <BottomSheet open={isOpen} onClose={onClose}>
        <div className="flex flex-col">
          {panelContent}
        </div>
      </BottomSheet>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {panelContent}
    </div>
  )
}
