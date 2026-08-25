export type DesktopRuntimeKind = "electron"

export type UpdateChannel = "stable" | "beta"

export type UpdaterStatus =
  | "idle"
  | "checking"
  | "available"
  | "no-update"
  | "downloading"
  | "downloaded"
  | "error"

export interface DesktopUpdaterState {
  status: UpdaterStatus
  version?: string
  changelog?: string
  progress?: number
  error?: string
}

export interface DesktopRuntimeBridge {
  kind: DesktopRuntimeKind
  platform: NodeJS.Platform
  onOpenSettings: (listener: () => void) => () => void
  onWindowState: (listener: (maximized: boolean) => void) => () => void
  window: {
    minimize: () => Promise<void>
    toggleMaximize: () => Promise<void>
    close: () => Promise<void>
  }
  updater: {
    check: (channel: UpdateChannel) => Promise<DesktopUpdaterState>
    downloadInstall: () => Promise<DesktopUpdaterState>
    onProgress: (listener: (progress: number) => void) => () => void
    relaunch: () => Promise<void>
  }
}

export const IPC_CHANNELS = {
  openSettings: "desktop:open-settings",
  updaterCheck: "desktop:updater:check",
  updaterDownloadInstall: "desktop:updater:download-install",
  updaterProgress: "desktop:updater:progress",
  updaterRelaunch: "desktop:updater:relaunch",
  windowMinimize: "desktop:window:minimize",
  windowToggleMaximize: "desktop:window:toggle-maximize",
  windowClose: "desktop:window:close",
  windowState: "desktop:window:state",
} as const
