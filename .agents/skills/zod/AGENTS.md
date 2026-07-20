# Zod

**Version 1.0.0**  
community  
January 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by AI-assisted workflows.

---

## Abstract

Comprehensive schema validation guide for Zod in TypeScript applications, designed for AI agents and LLMs. Contains 43 rules across 8 categories, prioritized by impact from critical (schema definition, parsing) to incremental (performance, bundle optimization). Each rule includes detailed explanations, real-world examples comparing incorrect vs. correct implementations, and specific impact metrics to guide automated refactoring and code generation.

---

## Table of Contents

1. [Schema Definition](#1-schema-definition) — **CRITICAL**
   - 1.1 Apply String Validations at Schema Definition — CRITICAL
   - 1.2 Avoid Overusing Optional Fields — CRITICAL
   - 1.3 Use Coercion for Form and Query Data — CRITICAL
   - 1.4 Use Enums for Fixed String Values — CRITICAL
   - 1.5 Use Primitive Schemas Correctly — CRITICAL
   - 1.6 Use z.unknown() Instead of z.any() — CRITICAL
2. [Parsing & Validation](#2-parsing--validation) — **CRITICAL**
   - 2.1 Avoid Double Validation — HIGH
   - 2.2 Handle All Validation Issues Not Just First — CRITICAL
   - 2.3 Never Trust JSON.parse Output — CRITICAL
   - 2.4 Use parseAsync for Async Refinements — CRITICAL
   - 2.5 Use safeParse() for User Input — CRITICAL
   - 2.6 Validate at System Boundaries — CRITICAL
3. [Type Inference](#3-type-inference) — **HIGH**
   - 3.1 Distinguish z.input from z.infer for Transforms — HIGH
   - 3.2 Enable TypeScript Strict Mode — HIGH
   - 3.3 Export Both Schemas and Inferred Types — HIGH
   - 3.4 Use Branded Types for Domain Safety — HIGH
   - 3.5 Use z.infer Instead of Manual Types — HIGH
4. [Error Handling](#4-error-handling) — **HIGH**
   - 4.1 Implement Internationalized Error Messages — HIGH
   - 4.2 Provide Custom Error Messages — HIGH
   - 4.3 Return False Instead of Throwing in Refine — HIGH
   - 4.4 Use flatten() for Form Error Display — HIGH
   - 4.5 Use issue.path for Nested Error Location — HIGH
5. [Object Schemas](#5-object-schemas) — **MEDIUM-HIGH**
   - 5.1 Choose strict() vs strip() for Unknown Keys
   - 5.2 Distinguish optional() from nullable()
   - 5.3 Use Discriminated Unions for Type Narrowing
   - 5.4 Use extend() for Adding Fields
   - 5.5 Use partial() for Update Schemas
   - 5.6 Use pick() and omit() for Schema Variants
6. [Schema Composition](#6-schema-composition) — **MEDIUM**
   - 6.1 Extract Shared Schemas into Reusable Modules
   - 6.2 Use intersection() for Type Combinations
   - 6.3 Use pipe() for Multi-Stage Validation
   - 6.4 Use preprocess() for Data Normalization
   - 6.5 Use z.lazy() for Recursive Schemas
7. [Refinements & Transforms](#7-refinements--transforms) — **MEDIUM**
   - 7.1 Add Path to Refinement Errors
   - 7.2 Choose refine() vs superRefine() Correctly
   - 7.3 Distinguish transform() from refine() and coerce()
   - 7.4 Use catch() for Fault-Tolerant Parsing
   - 7.5 Use default() for Optional Fields with Defaults
8. [Performance & Bundle](#8-performance--bundle) — **LOW-MEDIUM**
   - 8.1 Avoid Dynamic Schema Creation in Hot Paths
   - 8.2 Cache Schema Instances
   - 8.3 Lazy Load Large Schemas
   - 8.4 Optimize Large Array Validation
   - 8.5 Use Zod Mini for Bundle-Sensitive Applications

---

## 1. Schema Definition

### 1.1 Apply String Validations at Schema Definition

Apply string constraints (min, max, regex, email, url) at the schema level, not in business logic.

```typescript
// CORRECT: Validate at schema definition
const UserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
});

// INCORRECT: Validate in business logic
const UserSchema = z.object({
  email: z.string(),
  username: z.string(),
});
// Later in code: manual if-checks everywhere
```

**Impact**: CRITICAL — Unvalidated strings allow SQL injection, XSS, and malformed data.

### 1.2 Avoid Overusing Optional Fields

Be deliberate about optional fields — each one expands the valid input space and forces null checks downstream.

```typescript
// CORRECT: Required where data is always expected
const OrderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  items: z.array(OrderItemSchema),
  createdAt: z.string().datetime(),
});

// INCORRECT: Everything optional
const OrderSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  items: z.array(OrderItemSchema).optional(),
});
```

### 1.3 Use Coercion for Form and Query Data

Form data and query parameters are always strings — use `z.coerce` to handle this transparently.

```typescript
// CORRECT: Coerce string input to number
const SearchSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// INCORRECT: Expects actual numbers
const SearchSchema = z.object({
  page: z.number().int().positive().default(1), // Fails on "2"
});
```

### 1.4 Use Enums for Fixed String Values

```typescript
// CORRECT: Restrict to valid values
const StatusSchema = z.enum(["pending", "active", "inactive", "suspended"]);

// INCORRECT: Accepts any string
const StatusSchema = z.string();
```

### 1.5 Use Primitive Schemas Correctly

```typescript
z.string()    // strings
z.number()    // numbers
z.boolean()   // booleans
z.bigint()    // bigints
z.symbol()    // symbols
z.null()      // null
z.undefined() // undefined
z.void()      // undefined (accepts)
z.never()     // impossible
z.any()       // anything (AVOID)
z.unknown()   // unknown (PREFER OVER any)
```

### 1.6 Use z.unknown() Instead of z.any()

```typescript
// CORRECT: Forces type narrowing
function processValue(value: unknown) {
  const schema = z.unknown();
  const parsed = schema.parse(value);
  // Must narrow before use
  if (typeof parsed === "string") { /* ... */ }
}

// INCORRECT: Bypasses all type safety
function processValue(value: any) {
  // No type checking at all
}
```

---

## 2. Parsing & Validation

### 2.1 Avoid Double Validation

Don't parse the same data twice — pass the already-validated type downstream.

### 2.2 Handle All Validation Issues Not Just First

```typescript
// CORRECT: Collect all errors
const result = schema.safeParse(input);
if (!result.success) {
  const allErrors = result.error.issues.map(i => ({
    path: i.path.join("."),
    message: i.message,
  }));
  // Show all errors at once
}

// INCORRECT: Throws on first error
try {
  schema.parse(input);
} catch (e) {
  // Only first ZodError issue shown
}
```

### 2.3 Never Trust JSON.parse Output

```typescript
// CORRECT: Validate parsed JSON
const data = JSON.parse(jsonString);
const parsed = MySchema.safeParse(data);
if (!parsed.success) { /* handle */ }

// INCORRECT: Assume JSON.parse returns valid data
const data = JSON.parse(jsonString) as MyType;
```

### 2.4 Use parseAsync for Async Refinements

```typescript
// CORRECT
const result = await schema.safeParseAsync(input);

// INCORRECT: parse() doesn't handle async refinements
schema.parse(input); // Throws if schema has async refinements
```

### 2.5 Use safeParse() for User Input

```typescript
// CORRECT: Handle validation gracefully
const result = MySchema.safeParse(userInput);
if (!result.success) {
  return { errors: result.error.issues };
}
return { data: result.data };

// INCORRECT: Can crash the server
const data = MySchema.parse(userInput);
```

### 2.6 Validate at System Boundaries

Validate at API entry points, not deep in business logic:

```typescript
// CORRECT: Validate at the boundary (route handler)
app.post("/api/users", async (c) => {
  const body = await c.req.json();
  const parsed = CreateUserSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error }, 400);
  return createUser(parsed.data); // Business logic receives validated data
});
```

---

## 3. Type Inference

### 3.1 Distinguish z.input from z.infer

```typescript
const NumberString = z.string().transform(Number);

type Input = z.input<typeof NumberString>; // string (pre-transform)
type Output = z.infer<typeof NumberString>; // number (post-transform)
```

### 3.2 Enable TypeScript Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true
  }
}
```

Without strict mode, `null` and `undefined` slip through type inference.

### 3.3 Export Both Schemas and Inferred Types

```typescript
export const UserSchema = z.object({ /* ... */ });
export type User = z.infer<typeof UserSchema>;
// Consumers can use schema for validation AND type for TypeScript
```

### 3.4 Use Branded Types for Domain Safety

```typescript
const UserId = z.string().uuid().brand("UserId");
const OrderId = z.string().uuid().brand("OrderId");

type UserId = z.infer<typeof UserId>; // string & Brand<"UserId">
type OrderId = z.infer<typeof OrderId>; // string & Brand<"OrderId">
// Compile-time safety: can't pass OrderId where UserId is expected
```

### 3.5 Use z.infer Instead of Manual Types

```typescript
// CORRECT: Auto-syncs with schema
const ConfigSchema = z.object({ /* ... */ });
type Config = z.infer<typeof ConfigSchema>;

// INCORRECT: Manual type drifts from schema
interface Config { /* ... */ } // Must manually keep in sync
```

---

## 4. Error Handling

### 4.1 Implement Internationalized Error Messages

```typescript
const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    return { message: `Esperado ${issue.expected}, recebido ${issue.received}` };
  }
  return { message: ctx.defaultError };
};
z.setErrorMap(customErrorMap);
```

### 4.2 Provide Custom Error Messages

```typescript
const Schema = z.object({
  email: z.string().email("Email inválido"),
  age: z.number().min(18, "Deve ter pelo menos 18 anos"),
});
```

### 4.3 Return False Instead of Throwing in Refine

```typescript
// CORRECT
const AdultSchema = z.object({
  age: z.number(),
}).refine((data) => data.age >= 18, {
  message: "Must be 18+",
});

// INCORRECT
const AdultSchema = z.object({
  age: z.number(),
}).refine((data) => {
  if (data.age < 18) throw new Error("Too young");
  return true;
});
```

### 4.4 Use flatten() for Form Error Display

```typescript
const result = schema.safeParse(data);
if (!result.success) {
  const flat = result.error.flatten();
  // flat.fieldErrors: { email: ["Invalid email"], name: ["Required"] }
  // flat.formErrors: ["Global error"]
  return { fieldErrors: flat.fieldErrors, formErrors: flat.formErrors };
}
```

### 4.5 Use issue.path for Nested Error Location

```typescript
result.error.issues.forEach((issue) => {
  const fieldPath = issue.path.join("."); // "address.street" or "items.0.name"
  console.log(`Field: ${fieldPath}, Error: ${issue.message}`);
});
```

---

## 5. Object Schemas

### 5.1 Choose strict() vs strip() for Unknown Keys

```typescript
// strict() - rejects unknown keys (API inputs)
const ApiSchema = z.object({ name: z.string() }).strict();

// strip() - removes unknown keys (default, safe for forwarding)
const InternalSchema = z.object({ name: z.string() }); // default: strip

// passthrough() - keeps unknown keys
const FlexibleSchema = z.object({ name: z.string() }).passthrough();
```

### 5.2 Distinguish optional() from nullable()

```typescript
z.string().optional()  // accepts string | undefined (field missing or undefined)
z.string().nullable()   // accepts string | null (field explicitly null)
z.string().optional().nullable() // string | undefined | null
```

### 5.3 Use Discriminated Unions for Type Narrowing

```typescript
const AnimalSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("dog"), bark: z.boolean() }),
  z.object({ type: z.literal("cat"), meow: z.boolean() }),
]);
// TypeScript narrows based on the "type" field
```

### 5.4 Use extend() for Adding Fields

```typescript
const BaseUserSchema = z.object({ name: z.string(), email: z.string().email() });
const AdminSchema = BaseUserSchema.extend({ role: z.literal("admin") });
```

### 5.5 Use partial() for Update Schemas

```typescript
const CreateUserSchema = z.object({ name: z.string(), email: z.string(), age: z.number() });
const UpdateUserSchema = CreateUserSchema.partial(); // All fields optional
```

### 5.6 Use pick() and omit() for Schema Variants

```typescript
const FullSchema = z.object({ id: z.string(), name: z.string(), email: z.string(), password: z.string() });
const PublicSchema = FullSchema.omit({ password: true });
const LoginSchema = FullSchema.pick({ email: true, password: true });
```

---

## 6. Schema Composition

### 6.1 Extract Shared Schemas into Reusable Modules

```typescript
// shared.ts
export const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zipCode: z.string(),
});

// user.ts
import { AddressSchema } from "./shared";
export const UserSchema = z.object({
  name: z.string(),
  address: AddressSchema,
});
```

### 6.2 Use intersection() for Type Combinations

```typescript
const NameSchema = z.object({ firstName: z.string(), lastName: z.string() });
const AgeSchema = z.object({ age: z.number() });
const PersonSchema = z.intersection(NameSchema, AgeSchema);
// Equivalent to: { firstName: string; lastName: string; age: number; }
```

### 6.3 Use pipe() for Multi-Stage Validation

```typescript
const SlugSchema = z.string().pipe(
  z.string().transform(s => s.toLowerCase().replace(/\s+/g, "-"))
);
```

### 6.4 Use preprocess() for Data Normalization

```typescript
const NumberSchema = z.preprocess(
  (val) => (typeof val === "string" ? parseFloat(val) : val),
  z.number()
);
```

### 6.5 Use z.lazy() for Recursive Schemas

```typescript
type TreeNode = { value: string; children: TreeNode[] };
const TreeNodeSchema: z.ZodType<TreeNode> = z.lazy(() =>
  z.object({ value: z.string(), children: z.array(TreeNodeSchema) })
);
```

---

## 7. Refinements & Transforms

### 7.1 Add Path to Refinement Errors

```typescript
z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"], // Error points to endDate field
});
```

### 7.2 Choose refine() vs superRefine() Correctly

```typescript
// refine() - single condition
z.string().refine((s) => s.length > 0);

// superRefine() - multiple checks, custom issues
z.string().superRefine((val, ctx) => {
  if (val.length < 3) ctx.addIssue({ code: "too_small", minimum: 3 });
  if (!/[A-Z]/.test(val)) ctx.addIssue({ code: "custom", message: "Need uppercase" });
});
```

### 7.3 Distinguish transform() from refine() and coerce()

- `coerce()`: Convert input type (string → number)
- `refine()`: Validate; return error if invalid
- `transform()`: Mutate value; always succeeds

### 7.4 Use catch() for Fault-Tolerant Parsing

```typescript
const Schema = z.number().catch(0);
Schema.parse("not a number"); // Returns 0 instead of throwing
```

### 7.5 Use default() for Optional Fields with Defaults

```typescript
const ConfigSchema = z.object({
  theme: z.enum(["light", "dark"]).default("light"),
  pageSize: z.number().int().positive().default(20),
});
```

---

## 8. Performance & Bundle

### 8.1 Avoid Dynamic Schema Creation in Hot Paths

```typescript
// BAD: Created on every request
app.post("/api", (c) => {
  const schema = z.object({ name: z.string() }); // ~0.15ms per creation
  return schema.parse(c.req.json());
});

// GOOD: Created once at module level
const RequestSchema = z.object({ name: z.string() });
app.post("/api", (c) => RequestSchema.parse(c.req.json()));
```

### 8.2 Cache Schema Instances

Module-level or singleton schemas are created once.

### 8.3 Lazy Load Large Schemas

```typescript
// Instead of importing a large schema eagerly
const LargeSchema = await import("./large-schema").then(m => m.default);
```

### 8.4 Optimize Large Array Validation

For arrays of 1000+ items, validate in batches or sample.

### 8.5 Use Zod Mini for Bundle-Sensitive Applications

```bash
npm install zod-mini
# ~1.9kb gzip vs ~17kb for full Zod
```

---

## References

1. [https://zod.dev/](https://zod.dev/)
2. [https://zod.dev/v4](https://zod.dev/v4)
3. [https://github.com/colinhacks/zod](https://github.com/colinhacks/zod)
4. [https://zod.dev/packages/mini](https://zod.dev/packages/mini)
5. [https://www.totaltypescript.com/tutorials/zod](https://www.totaltypescript.com/tutorials/zod)
6. [https://zod.dev/error-handling](https://zod.dev/error-handling)
7. [https://zod.dev/api](https://zod.dev/api)

---

## Source Files

| File                             | Description                              |
| -------------------------------- | ---------------------------------------- |
| [SKILL.md](SKILL.md)             | Quick reference entry point              |
