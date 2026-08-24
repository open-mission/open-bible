import { ipcMain } from "electron"
import electronUpdater from "electron-updater"
import type { DesktopUpdaterState, UpdateChannel } from "./ipc-contract"
import { IPC_CHANNELS } from "./ipc-contract"

const { autoUpdater } = electronUpdater

function isUpdateChannel(value: unknown): value is UpdateChannel {
  return value === "stable" || value === "beta"
}

function getErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Updater request failed"
  return message.replace(/([?&](?:token|key|auth|signature)=)[^&\s]+/gi, "$1[redacted]").slice(0, 240)
}

function configureUpdater(channel: UpdateChannel) {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false
  autoUpdater.allowPrerelease = channel === "beta"
  autoUpdater.channel = channel === "beta" ? "beta" : "latest"
}

function getChangelog(releaseNotes: unknown) {
  if (typeof releaseNotes === "string") return releaseNotes
  if (!Array.isArray(releaseNotes)) return ""

  return releaseNotes
    .map((note) => {
      if (!note || typeof note !== "object") return ""
      const item = note as { version?: string; note?: string }
      return [item.version, item.note].filter(Boolean).join("\n")
    })
    .filter(Boolean)
    .join("\n\n")
}

async function checkForUpdate(channel: UpdateChannel): Promise<DesktopUpdaterState> {
  configureUpdater(channel)
  const result = await autoUpdater.checkForUpdates()
  const updateInfo = result?.updateInfo

  if (!updateInfo?.version) return { status: "no-update" }

  return {
    status: "available",
    version: updateInfo.version,
    changelog: getChangelog(updateInfo.releaseNotes),
  }
}

async function downloadAndInstall(
  event: Electron.IpcMainInvokeEvent,
): Promise<DesktopUpdaterState> {
  const progressListener = (progress: { percent: number }) => {
    event.sender.send(IPC_CHANNELS.updaterProgress, Math.round(progress.percent))
  }

  autoUpdater.on("download-progress", progressListener)
  try {
    await autoUpdater.downloadUpdate()
    return { status: "downloaded", progress: 100 }
  } finally {
    autoUpdater.removeListener("download-progress", progressListener)
  }
}

export function registerUpdaterIpc() {
  ipcMain.handle(IPC_CHANNELS.updaterCheck, async (_event, channel: unknown) => {
    if (!isUpdateChannel(channel)) return { status: "error", error: "Invalid update channel" }

    try {
      return await checkForUpdate(channel)
    } catch (error) {
      return { status: "error", error: getErrorMessage(error) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.updaterDownloadInstall, async (event) => {
    try {
      return await downloadAndInstall(event)
    } catch (error) {
      return { status: "error", error: getErrorMessage(error) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.updaterRelaunch, () => {
    autoUpdater.quitAndInstall(false, true)
  })
}
