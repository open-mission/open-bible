import { describe, expect, it, vi } from "vitest"

describe("shared Bible application", () => {
  it("reads an installed chapter through a platform-independent port", async () => {
    // SPECSFY: US-001 US-002 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-001
    const application = await import("@open-bible/application-bible")
    const verses = [{ id: "ara-gen-1-1", bookId: "gen", chapter: 1, verse: 1, text: "No princípio" }]
    const getChapter = vi.fn().mockResolvedValue(verses)

    await expect(application.getChapter({ getChapter }, "ara", "gen", 1)).resolves.toEqual(verses)
    expect(getChapter).toHaveBeenCalledWith("ara", "gen", 1)
  })

  it("preserves an empty result for an uninstalled version", async () => {
    // SPECSFY: US-001 US-002 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-001
    const application = await import("@open-bible/application-bible")

    await expect(application.getChapter({ getChapter: vi.fn().mockResolvedValue([]) }, "ara", "gen", 1)).resolves.toEqual([])
  })

  it("propagates a read failure from the platform adapter", async () => {
    // SPECSFY: US-001 US-002 FR-001 FR-002 FR-003 NFR-001 NFR-002 AC-001
    const application = await import("@open-bible/application-bible")

    await expect(application.getChapter({ getChapter: vi.fn().mockRejectedValue(new Error("database unavailable")) }, "ara", "gen", 1)).rejects.toThrow("database unavailable")
  })
})
