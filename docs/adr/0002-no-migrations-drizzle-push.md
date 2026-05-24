# ADR-0002 — `drizzle-kit push` instead of migration history

- **Status:** Accepted
- **Date:** 2026-05-24

## Context

Drizzle supports two workflows: `drizzle-kit generate` (produces SQL migration files we commit and run in order) and `drizzle-kit push` (computes the diff between the live database and `schema.ts` and applies it directly). Lucid is pre-customer; the schema is still moving. Versioned migrations slow down iteration and create merge conflicts in `drizzle/`.

## Decision

We use `drizzle-kit push` as the only schema sync mechanism. `schema.ts` is the source of truth. There is no `drizzle/` migrations folder. We have two `drizzle-kit` configs:

- `drizzle.config.ts` — points at `schema.ts`. `npm run push` applies the diff.
- `drizzleEmpty.config.ts` — points at `emptySchema.ts` (one comment, no tables). `npm run drop` uses it to nuke all tables.

`npm run reset` is `drop` + `push` — destructive, for local development only.

## Alternatives considered

- **Versioned migrations** — Standard, safe, replayable. But requires migration discipline (`npm run generate` after every schema change, careful review of the generated SQL, periodic squashing). Premature for a one-engineer-with-an-agent codebase.
- **Hybrid** — Use `push` in dev, `generate` for prod. Adds drift risk (the prod migration may not match the dev push); not worth the complexity yet.

## Consequences

- ✅ Schema changes are one file edit + one command.
- ✅ No merge conflicts in migration directories.
- ⚠ **No rollback path.** A bad push to production may require manual SQL to recover.
- ⚠ **Production data is at the mercy of `push`'s diff algorithm.** Renaming a column = drop + add, with data loss. The agent must read the `push` plan carefully before approving.
- ⚠ Before any push to production, the operator must dump the relevant rows first.
- 🔭 Switch to `generate` + `migrate` when the first paying customer's data is on Lucid, or earlier if any single column rename causes a real incident.

## Guidelines for safe `push` operations

- Before any push that adds a NOT NULL column to a populated table, first add it as nullable, backfill, then alter to NOT NULL.
- Rename columns by adding the new column, copying data, then dropping the old column — three separate pushes.
- `npm run push` against production goes through a manual `drizzle-kit push --verbose` (run by a human) so the plan is inspected.

## Links

- [`docs/03-schema.md`](../03-schema.md)
