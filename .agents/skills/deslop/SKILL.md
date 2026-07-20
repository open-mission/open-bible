---
name: deslop
description: Remove AI-generated code slop from the branch diff. Use before claiming any coding task complete, before any commit or PR, and when the user asks for slop cleanup.
---

# Remove AI code slop

Check the diff against main and remove AI-generated slop introduced in the branch.

## Focus Areas

- Extra comments that are unnecessary or inconsistent with local style
- Defensive checks or try/catch blocks that are abnormal for trusted code paths
- Casts to `any` used only to bypass type issues
- Deeply nested code that should be simplified with early returns
- Other patterns inconsistent with the file and surrounding codebase

## Guardrails

- Keep behavior unchanged unless fixing a clear bug.
- Prefer minimal, focused edits over broad rewrites.
- Keep the final summary concise (1-3 sentences).

## Pitfalls

- **Verbose type-safe code is NOT slop.** When a fix replaces `any` with `unknown` + `instanceof` checks, or wraps callbacks in proper typed interfaces, the verbosity is a consequence of type safety, not AI slop. Leave it.
- **`requestAnimationFrame` wrappers for setState-in-effect** look like unnecessary indirection but are the canonical pattern for suppressing the `react-hooks/set-state-in-effect` warning without changing behavior. Do not remove them.
- **Lazy state initializers** (`useState(() => { ... })`) that read localStorage or compute initial values are a strict-mode-safe replacement for `useEffect` + `setState` patterns. Keep them.
- **AI-generated comments** that explain WHY (business logic, edge cases) are fine. Remove only comments that restate WHAT (obvious from the code) or are clearly leftover thought-traces.
- **Defensive runtime guards as type fixes are slop.** When TS says `Type X is not assignable to Y`, do NOT add `if (x.type === "bible")` that silently skips code paths. The correct fix is a type assertion or widening the parameter type. A guard that changes runtime behavior to appease the type-checker is slop.
- **`as unknown as string` to defeat narrowing is slop.** Writing `x as unknown as string` to silence TS2367 ("comparison appears unintentional") means you should use an equivalent comparison that avoids narrowing (e.g. `=== "horizontal"` instead of `!== "vertical"` when the type is `"horizontal" | "vertical"`). Exception: `as unknown as TargetType` at a library API boundary is necessary and NOT slop.