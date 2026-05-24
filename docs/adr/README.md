# Architecture Decision Records

ADRs capture *why* an architectural choice was made — the alternatives, the trade-offs, and the date of the call. They are append-only: when we change our mind, we add a **new** ADR with status `Accepted` and amend the older one's status to `Superseded by ADR-NNNN`.

## How to write one

Copy [`_template.md`](./_template.md), increment the number, and link it from the relevant spec doc (`docs/0X-*.md`).

A good ADR fits on one page. The audience is "the engineer (or agent) who, 6 months from now, is about to change the thing this ADR talks about." Their first question will be "why?" — answer it concisely.

## Status values

- **Proposed** — drafted, not yet adopted.
- **Accepted** — current policy.
- **Superseded by ADR-NNNN** — historical; see the new one.
- **Deprecated** — abandoned without replacement.

## Index

| # | Title | Status |
| --- | --- | --- |
| [0001](./0001-custom-rpc-pattern.md) | Custom RPC over tRPC / REST | Accepted |
| [0002](./0002-no-migrations-drizzle-push.md) | `drizzle-kit push` instead of migration history | Accepted |
| [0003](./0003-jwt-httponly-cookies.md) | JWT in httpOnly cookies (no session store) | Accepted |
| [0004](./0004-polymorphic-modules-via-optional-columns.md) | Polymorphic modules via optional columns (no sidecar tables) | Accepted |
| [0005](./0005-spec-first-workflow.md) | Spec-first, agent-led development workflow | Accepted |
| [0006](./0006-websocket-pool-for-transactions.md) | Use Neon WebSocket `Pool` for transactional writes | Accepted |
