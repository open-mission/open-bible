import { BookOpen, Notebook, Presentation } from "lucide-react"
import type { PaneState } from "../types"

/** Shared list of pane types the user can open — used by the new-tab picker
 * and the grid split menus. Add new types here (e.g. sermons, dictionary) and
 * they appear everywhere. */
export interface PaneTypeOption {
  type: PaneState["type"]
  label: string
  icon: React.ComponentType
  state: PaneState
}

export const PANE_TYPE_OPTIONS: PaneTypeOption[] = [
  {
    type: "bible",
    label: "Bíblia",
    icon: BookOpen,
    state: { type: "bible", bookId: "gen", chapter: 1, versionId: "ara" },
  },
  { type: "note", label: "Notas", icon: Notebook, state: { type: "note", noteId: "" } },
  {
    type: "sermon",
    label: "Sermões",
    icon: Presentation,
    state: { type: "sermon", sermonId: "" },
  },
]
