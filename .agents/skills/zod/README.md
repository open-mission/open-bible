# Zod Best Practices Skill

A comprehensive guide for using Zod effectively in TypeScript applications. This skill provides 43 rules across 8 categories, organized by impact to help AI agents and developers write better validation code.

## Overview

Zod is a TypeScript-first schema declaration and validation library. This skill covers best practices for:

- **Schema Definition**: Choosing correct types, avoiding `z.any()`, proper string validations
- **Parsing & Validation**: Using `safeParse()`, async validation, error handling
- **Type Inference**: Leveraging `z.infer`, distinguishing input/output types
- **Error Handling**: Custom messages, internationalization, form error display
- **Object Schemas**: strict/strip modes, partial updates, discriminated unions
- **Schema Composition**: Reusable schemas, intersections, recursive types
- **Refinements & Transforms**: Custom validation, data transformation
- **Performance**: Caching, Zod Mini, lazy loading, batch validation

## Usage

The skill is automatically loaded when working with Zod code. Reference specific rules:

```typescript
// See SKILL.md for quick reference or AGENTS.md for the full guide
import { z } from "@hono/zod-openapi";
```

## File Structure

```
.agents/skills/zod/
├── SKILL.md          # Quick reference with rule index
├── AGENTS.md         # Full compiled guide (all rules with examples)
└── README.md         # This file
```

## Project Context

This project uses Zod v4.4.3 with `@hono/zod-openapi` for API schema definitions:

- `lib/api/schemas.ts` — API response/request schemas with `.openapi()` metadata
- `lib/api/hono-app.ts` — Hono app with Zod OpenAPI integration

## Key Principles

1. **Type Safety First**: Always use `z.infer`, never duplicate types manually
2. **Validate at Boundaries**: Parse external data immediately at entry points
3. **User-Friendly Errors**: Provide custom messages, collect all issues
4. **Single Source of Truth**: Schema defines validation AND TypeScript types
5. **Composition Over Duplication**: Use extend, pick, omit, partial

## References

- [Zod Official Documentation](https://zod.dev/)
- [Zod v4 Release Notes](https://zod.dev/v4)
- [Zod GitHub](https://github.com/colinhacks/zod)
- [Zod Mini](https://zod.dev/packages/mini)
