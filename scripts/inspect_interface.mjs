import { access, readFile } from "node:fs/promises"
import { resolve } from "node:path"

const project = resolve(process.argv[process.argv.indexOf("--project") + 1] || ".")
const interfacePath = resolve(project, "INTERFACE.md")
const requiredFiles = [
  "apps/desktop-tauri/src/main.ts",
  "apps/web/lib/desktop-runtime.ts",
  "apps/web/features/config/components/config-content.tsx",
  "apps/web/features/config/components/config-dialog.tsx",
  "apps/web/features/release-notes/components/release-notes-provider.tsx",
  "apps/web/features/release-notes/components/update-dialog.tsx",
  "apps/web/features/layout/components/tauri-menu-listener.tsx",
  "apps/web/app/config/page.tsx",
]

const document = await readFile(interfacePath, "utf8")
const missingReferences = requiredFiles.filter((file) => !document.includes(file))

for (const file of requiredFiles) {
  await access(resolve(project, file))
}

if (missingReferences.length > 0) {
  throw new Error(`INTERFACE.md is missing references: ${missingReferences.join(", ")}`)
}

console.log(`Interface inventory valid: ${requiredFiles.length} referenced files exist.`)
