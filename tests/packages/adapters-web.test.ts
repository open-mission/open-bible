import { describe, expect, it, vi } from "vitest"
import { WebBibleCatalog, WebBibleSearch } from "@open-bible/adapters-web"

describe("Web Bible adapters", () => {
  it("delegates catalog reads to the Web source", async () => {
    // SPECSFY: US-001 US-002 FR-001 FR-003 NFR-002 AC-001 AC-002
    const versions = [{ id: "ara", name: "Almeida", totalBooks: 66 }]
    const getVersions = vi.fn().mockResolvedValue(versions)

    await expect(new WebBibleCatalog(getVersions).listVersions()).resolves.toEqual(versions)
    expect(getVersions).toHaveBeenCalledOnce()
  })

  it("delegates search without adding platform dependencies", async () => {
    // SPECSFY: US-001 US-002 FR-001 FR-003 NFR-002 AC-002
    const verses = [{ id: "ara-gen-1-1", bookId: "gen", chapter: 1, verse: 1, text: "No princípio" }]
    const findVerses = vi.fn().mockResolvedValue(verses)

    await expect(new WebBibleSearch(findVerses).search("ara", "princípio")).resolves.toEqual(verses)
    expect(findVerses).toHaveBeenCalledWith("ara", "princípio")
  })

  it("propagates source errors from catalog and search", async () => {
    // SPECSFY: US-001 US-002 FR-001 FR-003 NFR-002 AC-002
    const error = new Error("API unavailable")

    await expect(new WebBibleCatalog(() => Promise.reject(error)).listVersions()).rejects.toThrow(error)
    await expect(new WebBibleSearch(() => Promise.reject(error)).search("ara", "texto")).rejects.toThrow(error)
  })
})
