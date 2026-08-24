import { execFileSync } from "node:child_process"
import { access, mkdir, rm } from "node:fs/promises"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(fileURLToPath(new URL("..", import.meta.url)))
const desktopRoot = resolve(root, "apps/desktop-tauri")
const distRoot = resolve(desktopRoot, "dist")
const isDevelopment = process.argv.includes("--dev")
const target = process.env.ELECTRON_BUILDER_TARGET
const platform = process.env.ELECTRON_BUILDER_PLATFORM
const updateChannel = process.env.ELECTRON_UPDATE_CHANNEL
const releaseVersion = process.env.RELEASE_VERSION
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm"

if (releaseVersion && !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(releaseVersion)) {
  throw new Error(`Invalid RELEASE_VERSION: ${releaseVersion}`)
}

await rm(distRoot, { recursive: true, force: true })
await mkdir(distRoot, { recursive: true })

function run(command, args) {
  execFileSync(command, args, {
    cwd: desktopRoot,
    stdio: "inherit",
  })
}

run(pnpmCommand, [
  "exec",
  "esbuild",
  "src/main.ts",
  "--bundle",
  "--platform=node",
  "--format=esm",
  "--external:electron",
  "--external:electron-updater",
  "--outfile=dist/main.mjs",
])
run(pnpmCommand, [
  "exec",
  "esbuild",
  "src/preload.ts",
  "--bundle",
  "--platform=node",
  "--format=cjs",
  "--external:electron",
  "--outfile=dist/preload.js",
])

if (isDevelopment) {
  run(pnpmCommand, ["exec", "electron", "dist/main.mjs"])
} else {
  try {
    await access(resolve(root, "apps/web/out/index.html"))
  } catch {
    throw new Error("Static Web export is required before packaging Electron")
  }

  const builderArgs = ["exec", "electron-builder", "--config", "electron-builder.yml", "--publish", "never"]
  if (target) builderArgs.push(`--${platform ?? "linux"}`, target)
  if (updateChannel) builderArgs.push(`--config.publish.channel=${updateChannel}`)
  if (releaseVersion) builderArgs.push(`--config.extraMetadata.version=${releaseVersion}`)
  run(pnpmCommand, builderArgs)
}
