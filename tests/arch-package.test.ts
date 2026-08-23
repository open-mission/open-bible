import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const pkgbuild = readFileSync(resolve("packaging/arch/PKGBUILD"), "utf8")

describe("Arch Linux package", () => {
  it("builds the Tauri application from the tagged source", () => {
    expect(pkgbuild).toContain("options=('!lto')")
    expect(pkgbuild).toContain("source=(\"git+${url}.git#tag=v${pkgver}\")")
    expect(pkgbuild).toContain("pnpm build:tauri")
    expect(pkgbuild).toContain("env -u RUSTFLAGS -u CARGO_ENCODED_RUSTFLAGS")
    expect(pkgbuild).toContain("cargo build --manifest-path src-tauri/Cargo.toml --release")
  })

  it("installs the binary and desktop metadata", () => {
    expect(pkgbuild).toContain('"$pkgdir/usr/bin/open-bible"')
    expect(pkgbuild).toContain("app.openbible.desktop.desktop")
    expect(pkgbuild).toContain("app.openbible.desktop.metainfo.xml")
  })
})
