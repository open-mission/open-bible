import { app, BrowserWindow, Menu, ipcMain, net, protocol } from "electron"
import { dirname, join, relative, resolve } from "node:path"
import { stat } from "node:fs/promises"
import { fileURLToPath, pathToFileURL } from "node:url"
import { IPC_CHANNELS } from "./ipc-contract"
import { registerUpdaterIpc } from "./updater"

protocol.registerSchemesAsPrivileged([
  {
    scheme: "open-bible",
    privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true },
  },
])

const currentDirectory = dirname(fileURLToPath(import.meta.url))
let mainWindow: BrowserWindow | null = null

function getRendererUrl() {
  if (!app.isPackaged) return process.env.OPEN_BIBLE_WEB_URL ?? "http://localhost:3000"
  return "open-bible://renderer/index.html"
}

async function getRendererFile(pathname: string) {
  const rendererRoot = resolve(process.resourcesPath, "web/out")
  const requestedPath = pathname === "/" ? "/index.html" : pathname
  const candidates = [
    resolve(rendererRoot, `.${requestedPath}`),
    resolve(rendererRoot, `.${requestedPath}.html`),
    resolve(rendererRoot, `.${requestedPath}/index.html`),
  ]

  for (const filePath of candidates) {
    if (relative(rendererRoot, filePath).startsWith("..")) continue
    try {
      const information = await stat(filePath)
      if (information.isFile()) return filePath
    } catch {
      continue
    }
  }

  return null
}

async function registerRendererProtocol() {
  await protocol.handle("open-bible", async (request) => {
    const filePath = await getRendererFile(new URL(request.url).pathname)
    if (!filePath) return new Response("Not found", { status: 404 })
    return net.fetch(pathToFileURL(filePath).toString())
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    frame: false,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : undefined,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: join(currentDirectory, "preload.js"),
    },
  })

  void mainWindow.loadURL(getRendererUrl())
  const notifyWindowState = () => {
    mainWindow?.webContents.send(IPC_CHANNELS.windowState, mainWindow.isMaximized())
  }
  mainWindow.on("maximize", notifyWindowState)
  mainWindow.on("unmaximize", notifyWindowState)
  mainWindow.on("restore", notifyWindowState)
  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

function registerWindowIpc() {
  ipcMain.handle(IPC_CHANNELS.windowMinimize, (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })
  ipcMain.handle(IPC_CHANNELS.windowToggleMaximize, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return
    if (window.isMaximized()) window.unmaximize()
    else window.maximize()
  })
  ipcMain.handle(IPC_CHANNELS.windowClose, (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })
}

app.whenReady().then(async () => {
  await registerRendererProtocol()
  registerUpdaterIpc()
  registerWindowIpc()
  Menu.setApplicationMenu(null)
  createWindow()
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})
