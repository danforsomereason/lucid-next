# AGENTS.md

This file is the operating manual for any AI coding agent working in this repository. It follows the [agents.md](https://agents.md) convention. **Read this top-to-bottom before making any change.**

If anything in this file conflicts with a request from the user, ask for clarification before proceeding.

---

## 0. Project in one paragraph

Lucid is a secure, multi-tenant LMS for behavioral-health workers. Two audiences: **organizations** tracking mandated compliance for their staff, and **individual practitioners** tracking personal licensure CEUs. A course is "complete" only when the user has passed the quiz AND completed the survey within the last 365 days. See [`docs/00-overview.md`](./docs/00-overview.md).

---

## 1. The non-negotiable rules

1. **Spec first, code second.** Every new feature must start with a doc update — either a new ADR in `docs/adr/` (for architectural decisions) or a procedure spec in `docs/06-procedures/` (for new RPC endpoints). The PR description must link to the doc that was added/changed.
2. **Tenant isolation is sacred.** Every read or write that touches `organization_id`-scoped data must filter by `ctx.organizationId` (for `admin`) or `ctx.userId` (for `user`). Cross-tenant leaks are P0 bugs. See [`docs/04-rbac-and-tenancy.md`](./docs/04-rbac-and-tenancy.md).
3. **Validate at the boundary, trust internally.** Every RPC procedure declares Zod `input` and `output` schemas. Parsers run on the way in and the way out. After parsing, downstream code may rely on the typed result without re-checking.
4. **No `any`, no `as` casts** except at IO boundaries (and only after a Zod parse). Use `unknown` + a parse instead.
5. **One procedure, one transaction.** Any procedure that writes to more than one table must wrap its writes in `db.transaction(...)` using the WebSocket `Pool` (see ADR-0006). HTTP-driver Neon clients can NOT run multi-statement transactions.
6. **Never log secrets, JWTs, or passwords.** Never check `.env` files in. Never hardcode secrets — read from `env.ts`.
7. **Don't bypass `env.ts`.** Add new env vars to the Zod schema in `env.ts`; don't read `process.env.X` anywhere else.

---

## 2. Commands the agent should know

```bash
npm run dev        # local dev server (Next 16, port 3000)
npm run build      # full TS check + Next build (use this to verify type-safety)
npm run push       # push schema.ts → Neon (DESTRUCTIVE if columns drop)
npm run drop       # drop ALL tables (uses emptySchema.ts) — DESTRUCTIVE
npm run reset      # drop + push — DESTRUCTIVE
npm run deadcode   # knip report
```

### Validating your work

There is no test suite. **To validate a new feature, use the Playwright MCP / CLI to drive the dev server end-to-end** (sign up → assign course → complete modules → pass quiz → fill survey → see dashboard update). See [`docs/10-testing-and-validation.md`](./docs/10-testing-and-validation.md).

Before declaring work done, you must:

1. `npm run build` succeeds with no TS errors.
2. The dev server starts and the affected page renders.
3. The relevant user flow has been walked through with Playwright.

---

## 3. Architecture in 60 seconds

- **Pages**: React Server Components by default. Use `'use client'` only when you need state, effects, or browser APIs.
- **Data fetching on server pages**: query Drizzle directly (`db.query.xTable.findFirst(...)`). Do NOT call your own API from a Server Component.
- **Mutations + client-side reads**: call the RPC dispatcher at `POST /api/rpc/[procedure]` via the generated typed client in `lib/rpc/client.ts`.
- **Server-side context** for every RPC call: `{ user, organizationId, role, request }`. Built by middleware that reads the JWT cookie.
- **Auth**: bcryptjs hash on signup, JWT signed with `env.JWT_SECRET`, stored in an httpOnly + secure + sameSite=lax cookie named `token`.

Full picture: [`docs/01-architecture.md`](./docs/01-architecture.md) and [`docs/05-rpc-contract.md`](./docs/05-rpc-contract.md).

---

## 4. Code conventions

- **TypeScript**: strict mode is on. Don't disable rules locally.
- **Imports**: use `@/` path aliases (e.g. `@/db`, `@/schema`, `@/lib/rpc`). Don't use relative `../../..` chains.
- **Files**:
  - `PascalCase.tsx` for React components.
  - `camelCase.ts` for everything else (utilities, schemas, contexts).
  - One default export per component file.
- **Comments**: explain non-obvious *why*, not *what*. Don't narrate the code. Don't write "// Import the module".
- **Errors**: throw `RpcError(code, message)` from inside procedures. Don't `throw new Error("...")` — those become opaque 500s. The dispatcher converts `RpcError` to a JSON error envelope.
- **Zod**: define schemas in `types.ts` (existing convention, derived from `schema.ts` via `drizzle-zod`). Procedure-specific input/output schemas live next to the procedure.
- **Dates**: always store UTC `timestamp` in Postgres. Compute "365 days ago" with `NOW() - INTERVAL '365 days'` in SQL, not in JS, to avoid TZ drift.
- **MUI**: prefer `sx` over `styled` for one-off styling; use `theme.ts` design tokens (don't hardcode hex values). See [`docs/08-frontend-conventions.md`](./docs/08-frontend-conventions.md).

---

## 5. Where things live

| You want to... | Look here |
| --- | --- |
| Add a new table/column | `schema.ts`, then `npm run push`, then update [`docs/03-schema.md`](./docs/03-schema.md) |
| Add a new RPC procedure | Register in `lib/rpc/procedures/<domain>.ts`, spec in [`docs/06-procedures/`](./docs/06-procedures/) |
| Change role permissions | `lib/rpc/middleware.ts`, update [`docs/04-rbac-and-tenancy.md`](./docs/04-rbac-and-tenancy.md) |
| Add an env var | Add to schema in `env.ts`, document in `README.md` |
| Tweak the dark theme | `theme.ts` and `styles/global.css` (CSS variables) |
| Update the survey | `constants.ts` (`SURVEY_QUESTIONS`) — see decision in ADR not-yet-written; survey is intentionally global |

---

## 6. The "do not do" list

- ❌ Do **not** hardcode `"TEST_SECRET"`, `localhost:3000`, or any other constant that belongs in env.
- ❌ Do **not** call `fetch('http://localhost:3000/...')` from anywhere — use the RPC client or call Drizzle directly on the server.
- ❌ Do **not** add a `delete user` endpoint. Decision made: users are deactivated, never hard-deleted (per question 16 of the spec convo).
- ❌ Do **not** introduce a 3rd-party RPC framework (tRPC, GraphQL, etc.). We deliberately built our own thin layer; see ADR-0001.
- ❌ Do **not** add migration files. We use `drizzle-kit push` against a single Neon branch per environment; see ADR-0002.
- ❌ Do **not** write tests "just in case." There is no test runner. Use Playwright to validate user flows.
- ❌ Do **not** update `assigned_courses.completed_at` when the user passes the quiz. `completed_at` is set only when the **survey** is finished. Quiz pass timestamp lives on its own column. See [`docs/07-completion-and-ceu-rules.md`](./docs/07-completion-and-ceu-rules.md).
- ❌ Do **not** trust `request.json()` without parsing through Zod. Ever.

---

## 7. The default agent workflow

When given a task:

1. **Read the relevant docs**. Start at the doc that mentions the affected concept; follow cross-links.
2. **If the task changes architecture, schema, or a public contract**: write/update an ADR or procedure spec **before** touching code. Show it to the user.
3. **Sketch the change**: list every file that will be touched and the order of operations. Confirm with the user if the change touches more than ~5 files or any of the "non-negotiables" above.
4. **Implement**: schema → types → procedure → UI, in that order. Each layer should typecheck before moving to the next (`npm run build`).
5. **Validate**: open a Playwright session, walk the user flow, paste the steps into the PR description.
6. **Update docs**: if anything changed beyond what the spec described, update the spec to match reality before opening the PR.

---

## 8. Domain glossary (short)

| Term | Meaning |
| --- | --- |
| **CEU** | Continuing Education Unit — counted in hours, required by licensing boards for renewal |
| **License type** | The credential the practitioner holds (LPC, LCSW, RN, etc.) — determines which approval bodies count |
| **Approval body** | Org that certifies a course as CEU-eligible (NBCC, APA, ASWB, NAADAC, CAMFT, Nursing boards) |
| **Track** | A named bundle of courses an admin assigns to roles within their org (e.g. "2026 Onboarding") |
| **Mandated** | Assigned by an org admin (not self-chosen) |
| **Compliance cycle** | The recurring window over which mandated courses must be completed |

Longer glossary in [`docs/00-overview.md`](./docs/00-overview.md#glossary).
