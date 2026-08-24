export type DesktopRuntimeKind = "web" | "tauri" | "electron"
export type DesktopUpdateChannel = "stable" | "beta"
export type DesktopUpdaterStatus =
  | "idle"
  | "checking"
  | "available"
  | "no-update"
  | "downloading"
  | "downloaded"
  | "error"

export interface DesktopUpdateState {
  status: DesktopUpdaterStatus
  version?: string
  changelog?: string
  progress?: number
  error?: string
}

interface ElectronRuntimeBridge {
  kind: "electron"
  platform: NodeJS.Platform
  onOpenSettings: (listener: () => void) => () => void
  onWindowState: (listener: (maximized: boolean) => void) => () => void
  window: {
    minimize: () => Promise<void>
    toggleMaximize: () => Promise<void>
    close: () => Promise<void>
  }
  updater: {
    check: (channel: DesktopUpdateChannel) => Promise<DesktopUpdateState>
    downloadInstall: () => Promise<DesktopUpdateState>
    onProgress?: (listener: (progress: number) => void) => () => void
    relaunch: () => Promise<void>
  }
}

declare global {
  interface Window {
    desktopRuntime?: ElectronRuntimeBridge
  }
}

const hasTauriRuntime =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
const electronBridge =
  typeof window !== "undefined" ? window.desktopRuntime : undefined

export const desktopRuntimeKind: DesktopRuntimeKind = electronBridge
  ? "electron"
  : hasTauriRuntime
    ? "tauri"
    : "web"

export const isDesktop = desktopRuntimeKind !== "web"

// Kept as a local compatibility alias while existing settings components are migrated.
export const isTauri = isDesktop

async function tauriUpdaterCheck(channel: DesktopUpdateChannel) {
  const { check } = await import("@tauri-apps/plugin-updater")
  const update = await check({ headers: { "X-Update-Channel": channel } })

  return update
    ? {
        status: "available" as const,
        version: update.version,
        changelog: update.body || "",
      }
    : { status: "no-update" as const }
}

export const desktopRuntime = {
  kind: desktopRuntimeKind,
  platform: electronBridge?.platform,
  onOpenSettings(listener: () => void) {
    if (electronBridge) return electronBridge.onOpenSettings(listener)
    if (!hasTauriRuntime) return () => undefined

    let unlisten: (() => void) | undefined
    let disposed = false
    void import("@tauri-apps/api/event").then(({ listen }) =>
      listen("open-settings", listener).then((cleanup) => {
        if (disposed) cleanup()
        else unlisten = cleanup
      }),
    )

    return () => {
      disposed = true
      unlisten?.()
    }
  },
  onWindowState(listener: (maximized: boolean) => void) {
    if (electronBridge) return electronBridge.onWindowState(listener)
    return () => undefined
  },
  window: {
    minimize() {
      return electronBridge?.window.minimize() ?? Promise.resolve()
    },
    toggleMaximize() {
      return electronBridge?.window.toggleMaximize() ?? Promise.resolve()
    },
    close() {
      return electronBridge?.window.close() ?? Promise.resolve()
    },
  },
  updater: {
    async check(channel: DesktopUpdateChannel): Promise<DesktopUpdateState> {
      if (electronBridge) return electronBridge.updater.check(channel)
      if (hasTauriRuntime) return tauriUpdaterCheck(channel)
      return { status: "idle" }
    },
    async downloadInstall(): Promise<DesktopUpdateState> {
      if (electronBridge) return electronBridge.updater.downloadInstall()
      if (!hasTauriRuntime) return { status: "idle" }

      const { check } = await import("@tauri-apps/plugin-updater")
      const update = await check()
      if (!update) return { status: "no-update" }
      await update.downloadAndInstall()
      return { status: "downloaded", version: update.version }
    },
    onProgress(listener: (progress: number) => void) {
      if (electronBridge) return electronBridge.updater.onProgress(listener)
      return () => undefined
    },
    async relaunch() {
      if (electronBridge) return electronBridge.updater.relaunch()
      if (!hasTauriRuntime) return

      const { relaunch } = await import("@tauri-apps/plugin-process")
      await relaunch()
    },
  },
}
