import { describe, it, expect } from "vitest"
import { isOpfsAvailable } from "@/lib/opfs-available"

describe("Highlights AC-003 erro OPFS", () => {
  it("detecta OPFS indisponível no ambiente sem navegador", () => {
    expect(isOpfsAvailable()).toBe(false)
  })
})
