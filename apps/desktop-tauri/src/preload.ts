import { contextBridge, ipcRenderer } from "electron"
import type {
  DesktopRuntimeBridge,
  DesktopUpdaterState,
  UpdateChannel,
} from "./ipc-contract"
import { IPC_CHANNELS } from "./ipc-contract"

const desktopRuntime: DesktopRuntimeBridge = {
  kind: "electron",
  platform: process.platform,
  onOpenSettings(listener) {
    const handler = () => listener()
    ipcRenderer.on(IPC_CHANNELS.openSettings, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.openSettings, handler)
  },
  onWindowState(listener) {
    const handler = (_event: Electron.IpcRendererEvent, maximized: boolean) => listener(maximized)
    ipcRenderer.on(IPC_CHANNELS.windowState, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.windowState, handler)
  },
  window: {
    minimize() {
      return ipcRenderer.invoke(IPC_CHANNELS.windowMinimize)
    },
    toggleMaximize() {
      return ipcRenderer.invoke(IPC_CHANNELS.windowToggleMaximize)
    },
    close() {
      return ipcRenderer.invoke(IPC_CHANNELS.windowClose)
    },
  },
  updater: {
    check(channel: UpdateChannel): Promise<DesktopUpdaterState> {
      return ipcRenderer.invoke(IPC_CHANNELS.updaterCheck, channel)
    },
    downloadInstall(): Promise<DesktopUpdaterState> {
      return ipcRenderer.invoke(IPC_CHANNELS.updaterDownloadInstall)
    },
    onProgress(listener) {
      const handler = (_event: Electron.IpcRendererEvent, progress: number) => listener(progress)
      ipcRenderer.on(IPC_CHANNELS.updaterProgress, handler)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.updaterProgress, handler)
    },
    relaunch(): Promise<void> {
      return ipcRenderer.invoke(IPC_CHANNELS.updaterRelaunch)
    },
  },
}

contextBridge.exposeInMainWorld("desktopRuntime", desktopRuntime)
