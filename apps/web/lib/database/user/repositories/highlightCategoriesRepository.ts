import { eq } from "drizzle-orm"
import type { UserDb } from "../drizzle"
import { highlightCategories, type HighlightCategory, type NewHighlightCategory } from "../schema"

function uuid(): string {
  return crypto.randomUUID()
}

export function highlightCategoriesRepository(db: UserDb) {
  return {
    async create(name: string): Promise<HighlightCategory> {
      const row: NewHighlightCategory = {
        id: uuid(),
        name: name.trim(),
        createdAt: new Date(),
      }
      await db.insert(highlightCategories).values(row)
      return row as HighlightCategory
    },

    async findById(id: string): Promise<HighlightCategory | null> {
      const rows = await db
        .select()
        .from(highlightCategories)
        .where(eq(highlightCategories.id, id))
      return rows[0] ?? null
    },

    async findByName(name: string): Promise<HighlightCategory | null> {
      const rows = await db
        .select()
        .from(highlightCategories)
        .where(eq(highlightCategories.name, name.trim()))
      return rows[0] ?? null
    },

    async list(): Promise<HighlightCategory[]> {
      return db.select().from(highlightCategories)
    },

    async remove(id: string): Promise<void> {
      await db.delete(highlightCategories).where(eq(highlightCategories.id, id))
    },
  }
}
