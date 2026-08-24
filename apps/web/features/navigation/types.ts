export type AppView = "reader" | "notes" | "highlights"

export interface ViewHistoryEntry {
  view: AppView
  timestamp: number
}

export interface AppNavigationState {
  activeView: AppView
  history: ViewHistoryEntry[]
  canGoBack: boolean
}

export interface AppNavigationActions {
  navigate: (view: AppView) => void
  goBack: () => void
}

export type AppNavigationContextValue = AppNavigationState & AppNavigationActions

export interface ShortcutDefinition {
  id: string
  label: string
  keys: string
  action: () => void
  enabled?: boolean
  group?: string
}
