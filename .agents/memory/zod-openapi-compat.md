---
name: OpenAPI integer compatibility
description: Generated API Zod schemas currently target a Zod 3 runtime in this workspace.
---

When adding numeric fields to OpenAPI contracts, prefer `number` unless integer-specific validation is essential; the current generator emits `zod.int()` for `integer`, which the installed Zod 3 runtime does not expose.

**Why:** Code generation can succeed while the shared-library typecheck fails on the generated validator.

**How to apply:** If integer semantics become important, upgrade and verify the generator/runtime pair together; otherwise keep the API number-typed and validate integer ranges in route code when needed.