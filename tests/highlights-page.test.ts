import { describe, it, expect } from "vitest"

// SPECSFY: US-001 FR-001 FR-002 FR-004 NFR-001 AC-001
describe("Highlights page - AC-001 listagem ordenada por recência", () => {
  it("lista highlights em cards ordenados por updatedAt desc com cor, categoria, conteúdo e versículos", async () => {
    // RED: rota /highlights ainda não existe, deve falhar até implementação
    const exists = await import("@/app/highlights/page").then(() => true).catch(() => false)
    expect(exists).toBe(true) // falha proposital até criar page
  })
})
