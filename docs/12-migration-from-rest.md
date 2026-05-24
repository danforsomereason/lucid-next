# 12 — Migration from REST to RPC

Today the project exposes a REST API under `app/api/v1/*`. The target architecture (see [`05-rpc-contract.md`](./05-rpc-contract.md)) is a single RPC dispatcher at `app/api/rpc/[procedure]/route.ts`. This document describes the migration plan and the mapping from each legacy endpoint to its RPC replacement.

## Principles

1. **No dual-write phase.** When an RPC procedure ships, the legacy REST route for the same capability is **removed** in the same PR. We are pre-customer; there are no clients of `/api/v1/*` outside our own UI.
2. **The agent does both sides of the swap.** A PR that adds `rpc.courses.assign` also rewrites every call site in `components/` to use the new path and deletes `app/api/v1/courses/assign/route.ts` plus `requests/courses.ts`.
3. **Each migration PR fixes the security bugs we already know about** in the legacy route. Don't carry forward `TEST_SECRET`, missing course-id filtering, etc.
4. **Migrations happen one domain at a time.** Auth first (high blast radius if wrong), then courses, then learning (modules/quiz/survey), then dashboards. AI sim and certificates are net-new and land as RPC from day one.

## Suggested migration order

1. **Foundation** (1 PR): land `lib/rpc/{server,client,procedures}` scaffolding, the dispatcher route, the typed client, and the `env.JWT_SECRET` move. No existing route is changed.
2. **auth.\*** (1 PR): replace `users/login`, `users/signup`, `users/identify` with `auth.login`, `auth.signup`, `auth.me`, `auth.logout`. Fix `TEST_SECRET`. Add secure cookie flags. Rewrite `requests/users.ts` callers and `components/NavBar`, `app/signin/page.tsx`, `app/signup/individual/page.tsx`.
3. **users.\*** (1 PR): port `users/update-profile/[users]` → `users.updateProfile`. **Remove `users/delete`** (question 16). Remove `users/check-exists` and `users/check-verification` (or port them with rate-limit; decide in the PR).
4. **courses.\*** (1 PR): port `courses GET`, `courses/category/[id]`, `courses/create`, `courses/assign`. Add `accessType` enforcement on assign. Add transactions to `courses.create`. Rewrite `requests/courses.ts` callers.
5. **learning.\*** (1 PR): port `modules/end`, `questions/check`, `survey`. **Fix the wrong-assignment lookup** (question 17) by accepting `assignedCourseId` as input on `modules.end` and `quiz.check`. Implement the survey gating on `quizPassedAt`.
6. **dashboards.\*** (1 PR): brand new — there are no existing REST endpoints for compliance/CEU rollups. Wire the existing `BasicPie` to `dashboards.userCompliance` data and replace the hardcoded `BasicPie` arrays.
7. **organizations.\* + tracks.\*** (1 PR): brand new. UI follows.
8. **ai.\* + certificates.\*** (1 PR each): brand new.

After step 7 the `app/api/v1/` folder should be empty and can be deleted.

## Endpoint mapping

| Legacy route | RPC replacement | Bug fixes folded in |
| --- | --- | --- |
| `POST /api/v1/users/login` | `auth.login` | `TEST_SECRET` → `env.JWT_SECRET`; secure cookie flags; timing-safe compare |
| `POST /api/v1/users/signup` | `auth.signup` | Same. Also honors `verified_users` invites. Hashes password in same TX as user insert. |
| `GET /api/v1/users/identify` | `auth.me` | Returns `{ user: null }` instead of throwing on missing cookie |
| `DELETE /api/v1/users/delete` | **REMOVED** | (Question 16.) Replace with soft-delete via a future `users.deactivate` if ever needed |
| `POST /api/v1/users/update-profile/[users]` | `users.updateProfile` | No path param needed — server uses `ctx.user.id`. Forbids `email`/`role`/`organizationId` mutation. |
| `GET /api/v1/users/check-exists/[email]` | (deferred) | If kept, rate-limit. Otherwise inline the check in signup flow. |
| `GET /api/v1/users/check-verification/[email]` | (deferred) | Only useful for invitation-aware signup UI; can fold into `auth.signup` response. |
| `GET /api/v1/courses` | `courses.list` | Adds visibility filter; pagination |
| `GET /api/v1/courses/category/[categoryId]` | `courses.list` with `categoryId` arg | One procedure, not two |
| `POST /api/v1/courses/create` | `courses.create` | Wraps multi-insert in transaction (WebSocket pool); supports module discriminated union; validates `accessType` ↔ `organizationId` |
| `POST /api/v1/courses/assign` | `courses.assign` | Enforces `accessType` (premium / org-restricted gates); sets `assignedBy = self.id`, `source = 'self_assigned'` |
| `POST /api/v1/modules/end` | `modules.end` | **Requires `assignedCourseId`** — no more "first assignment" guesswork |
| `POST /api/v1/questions/check` | `quiz.check` | Same fix as above. Also: only `survey.answer` writes `completedAt`. |
| `POST /api/v1/survey` | `survey.answer` | Verifies `quizPassedAt != null` before accepting. Sets `completedAt` only on last question, atomically. |

## Client-side changes per PR

For every migration PR, the following must also happen:

- Delete the corresponding helper(s) in `requests/`. Long-term, the `requests/` folder is removed entirely.
- Rewrite every importer of those helpers to use `rpc.x.y(...)`.
- Remove any `http://localhost:3000` URL strings — relative paths only.

## Definition-of-done per migration PR

- [ ] RPC procedure added with input/output Zod schemas.
- [ ] Procedure spec doc in `docs/06-procedures/<domain>.md` updated/added.
- [ ] Legacy REST route deleted.
- [ ] All client call sites rewritten.
- [ ] Bug fix(es) folded in (see table above).
- [ ] `npm run build` clean.
- [ ] Playwright walkthrough of the affected flow (see `10-testing-and-validation.md`).
- [ ] PR description links the spec and lists the deleted files.

## After migration

Once `app/api/v1/*` is gone, this doc gets archived (moved to `docs/adr/` with a status note). It's reference, not living spec.
