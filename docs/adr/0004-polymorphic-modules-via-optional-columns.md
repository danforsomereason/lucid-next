# ADR-0004 — Polymorphic modules via optional columns on a single table

- **Status:** Accepted
- **Date:** 2026-05-24

## Context

A `modules` row will eventually be one of three kinds:

- `text` — markdown/HTML content.
- `video` — YouTube or Vimeo URL.
- `ai_simulation` — opening statement + evaluation criteria.

We need the schema to express this without making future module types expensive to add.

Two natural shapes:

1. **Sidecar tables.** Keep `modules` minimal (id, course_id, order, heading, type) and add a 1:1 child table per type (`module_text`, `module_video`, `module_ai_simulation`). The application JOINs on the discriminator.
2. **Wide table.** Keep `modules` as one row with all type-specific columns nullable; enforce "the right columns are set" at the app layer.

The user picked option 2 (question 10).

## Decision

`modules` carries every type-specific column directly:

```ts
moduleType:           moduleTypeEnum,
content:              text (nullable, for text)
videoProvider:        videoProviderEnum (nullable, for video)
videoUrl:             text (nullable, for video)
aiInitialStatement:   text (nullable, for ai_simulation)
aiResponseCriteria:   text (nullable, for ai_simulation)
```

Validation is performed by a Zod **discriminated union** on `moduleType` in `courses.create`'s input schema and in the procedure handler. Drizzle can't easily express a "this column is NOT NULL when type=X" check, so we don't try; the procedure is the gatekeeper.

For per-attempt runtime data (e.g. the user's AI simulation attempts), we DO use a separate child table (`module_ai_attempts`) because it's 1:N, not 1:1.

## Alternatives considered

- **Sidecar tables (option 1)** — Cleaner per-type schema; type-specific NOT NULL constraints land naturally. But every read either JOINs three tables or unions three queries; every write needs a transaction. The number of module types is small and unlikely to grow past 5; the polymorphism cost on the read path dwarfs the elegance gain.
- **JSONB payload** — One `payload jsonb` column, app interprets. Most flexible but worst type safety; loses indexability per field.

## Consequences

- ✅ Reading a course's modules is a single query — `SELECT * FROM modules WHERE course_id = ?`.
- ✅ Adding a new module type is one enum value + new optional columns + a new branch in the validator.
- ⚠ The `modules` table grows wider as types are added. Acceptable until we have > 8 columns of type-specific stuff (we're at 5 today).
- ⚠ The "this column is null for the wrong reason" bug class exists. The Zod discriminated union catches it on write; we should never read a module without first checking `moduleType` and using only the columns relevant to it.
- 🔭 If a future module type needs *complex* per-instance state (e.g. multi-page interactive simulations), we may add a sidecar table just for that type. Mixing strategies is allowed; the wide table doesn't preclude sidecar tables for outliers.

## Links

- [`docs/02-domain-model.md`](../02-domain-model.md#modules)
- [`docs/03-schema.md`](../03-schema.md#modules-polymorphic--question-10)
- [`docs/11-roadmap-video-and-ai-modules.md`](../11-roadmap-video-and-ai-modules.md)
