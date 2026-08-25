import { access, readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const root = resolve(import.meta.dirname, "../..")

describe("Electron native menu", () => {
  it("exposes a TypeScript menu bridge for Configurações", async () => {
    // SPECSFY: US-002 FR-002 AC-005
    await expect(access(resolve(root, "apps/desktop-tauri/src/main.ts"))).resolves.toBeUndefined()

    const listener = await readFile(
      resolve(root, "apps/web/features/layout/components/tauri-menu-listener.tsx"),
      "utf8",
    )
    expect(listener).toContain("desktopRuntime.onOpenSettings")
    expect(listener).toContain('router.push("/config")')

    const titlebar = await readFile(
      resolve(root, "apps/web/features/layout/components/desktop-titlebar.tsx"),
      "utf8",
    )
    expect(titlebar).toContain("Menubar")
    expect(titlebar).toContain("Minimizar janela")
    expect(titlebar).toContain("Fechar janela")
  })
})
