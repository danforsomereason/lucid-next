# ADR-0005 — Spec-first, agent-led development workflow

- **Status:** Accepted
- **Date:** 2026-05-24

## Context

The project is largely driven by an AI agent operating in Cursor. Without strong written specs the agent re-discovers the same design decisions on every task, makes inconsistent choices, and can't safely refactor across files. We've also seen the project's REST routes drift from the database schema (`assigned_courses.completedAt` was overwritten on both quiz pass AND survey, contradicting the product definition of "complete"), which suggests the absence of a written spec.

## Decision

Every change goes through this loop:

1. **Read** the relevant spec doc(s) in `docs/`.
2. **Update** the spec (or write a new ADR) **before** touching code, whenever the change touches:
   - Architecture (request flow, layering, infrastructure).
   - The database schema (`schema.ts`).
   - A public contract (RPC procedure input/output, route shape, cookie name, env var).
   - The "non-negotiable rules" in `AGENTS.md`.
3. **Show** the updated spec to the user for sign-off before implementation, when the change is non-trivial.
4. **Implement**. The agent treats the spec as the truth; if implementation reveals the spec is wrong, the agent updates the spec, not the other way around.
5. **Reference** the spec in the PR description with a link.

The `AGENTS.md` file enforces this with the line: *"Spec first, code second. Every new feature must start with a doc update."*

## Alternatives considered

- **Code-first, doc-after** — The default of most projects. Predictable outcome: docs go stale within weeks; the agent stops trusting them and re-discovers everything.
- **Ticket-driven (linear issues, no `docs/`)** — Works for a human team with shared context; fails for an agent that has no memory between sessions.

## Consequences

- ✅ The agent has a single source of truth it can always consult.
- ✅ Architectural drift is visible at PR-review time (the diff includes the doc change).
- ✅ New collaborators (human or agent) can onboard by reading `docs/`.
- ⚠ Adds friction to small changes. Mitigation: tiny bug fixes don't need a spec update; the rule is "if you're changing a public contract, update the spec first."
- ⚠ Specs that lie are worse than no specs. Mitigation: PR template includes "did you update the spec? if no, why not?"
- 🔭 Re-evaluate the friction-to-value ratio after 3 months of operation. If specs are stale despite the rule, we either tighten enforcement or relax the rule.

## Links

- [`AGENTS.md`](../../AGENTS.md)
- [`docs/06-procedures/README.md`](../06-procedures/README.md)
