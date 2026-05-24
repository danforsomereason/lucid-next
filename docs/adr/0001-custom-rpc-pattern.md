# ADR-0001 — Custom RPC over tRPC and REST

- **Status:** Accepted
- **Date:** 2026-05-24

## Context

We need an API layer between the Next.js UI and the database that is:

- Strictly type-safe end-to-end (TS types for input + output without manual duplication).
- Zod-validated at the boundary.
- Easy to gate by role and tenant.
- Cheap to introspect (no codegen, no schema files, no separate dev server).
- Aligned with React Server Components — server pages should be able to call the same handler without a network round-trip.

We currently have an ad-hoc REST API under `app/api/v1/*` with manual `request.json()` parsing, inconsistent error envelopes, and several routes that bypass authorization. That's not a long-term direction.

## Decision

We build a small in-house RPC layer (~150 LOC) consisting of:

- A single dispatcher route `app/api/rpc/[procedure]/route.ts`.
- A builder pattern (`procedure().use(...).input(z).output(z).handler(...)`) in `lib/rpc/server/procedure.ts`.
- A registry `lib/rpc/server/registry.ts` mapping `'<domain>.<verb>'` strings to procedures.
- A typed proxy `lib/rpc/client.ts` that gives `rpc.courses.assign({...})` ergonomics on the browser, with input/output types fully inferred from the registry.
- A `callAsServer` escape hatch so server components can invoke handlers directly without HTTP.

This is conceptually "tRPC minus the framework dependency" — same shape, ours to maintain.

## Alternatives considered

- **tRPC** — Strong defaults but it owns its router/builder API; introduces an external dependency we'd be locked into through migrations. The features we don't need (subscriptions, full router composition, batching middleware) outnumber the ones we do. The user explicitly rejected tRPC.
- **REST + OpenAPI codegen** — More ceremony, more files to keep in sync, weaker DX. Doesn't compose middleware naturally.
- **GraphQL** — Solves problems we don't have (selective field fetching, nested gateway queries). Operational cost is real (cache invalidation, query complexity).
- **Server Actions** — Tempting, but server actions don't compose role middleware cleanly and break when you want to call the same handler from a third-party (or from a backend job). The dual-mode "HTTP from client, direct call from server" pattern we want is awkward with actions.

## Consequences

- ✅ One way to write an API endpoint.
- ✅ Zero external API dependency.
- ✅ End-to-end types without codegen.
- ✅ Same handler runs from client (HTTP) and server (direct call) — no duplication.
- ⚠ We own the ~150 LOC of the dispatcher/builder. Bugs are ours.
- ⚠ No off-the-shelf devtools (tRPC's panel). We rely on dev tools `Network` tab + logs.
- 🔭 Re-evaluate if we ever need real-time subscriptions or batching at scale.

## Links

- Spec: [`docs/05-rpc-contract.md`](../05-rpc-contract.md)
- Migration plan: [`docs/12-migration-from-rest.md`](../12-migration-from-rest.md)
