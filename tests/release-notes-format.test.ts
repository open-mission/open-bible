import { describe, expect, it } from "vitest"
import { normalizeReleaseNotes } from "../apps/web/lib/release-notes/format"

describe("release notes formatting", () => {
  it("keeps Markdown release notes unchanged", () => {
    const notes = "## What's Changed\n\n- Fix the updater"

    expect(normalizeReleaseNotes(notes)).toBe(notes)
  })

  it("converts HTML release notes to safe Markdown-like text", () => {
    const notes =
      "<h2>What's Changed</h2><h3>Improvements</h3><ul><li>Fix <a href=\"https://example.com\">the updater</a> &amp; layout</li></ul>"

    expect(normalizeReleaseNotes(notes)).toBe(
      "What's Changed\nImprovements\n- Fix the updater & layout",
    )
    expect(normalizeReleaseNotes(notes)).not.toContain("<")
  })
})
