# 04 — Roles, permissions, and tenant isolation

## Roles

```ts
type Role = 'super_admin' | 'instructor' | 'admin' | 'user';
```

| Role | Belongs to org? | Can author courses? | Can assign courses to others? | Scope |
| --- | --- | --- | --- | --- |
| `super_admin` | optional | yes | yes (anyone) | global |
| `instructor` | optional | **yes** | yes (within their org if they have one) | author globally; admin within own org |
| `admin` | **required** | no | yes (to org members only) | hard-locked to `organization_id` |
| `user` | optional | no | self only (via self-assign) | own rows only |

`instructor` is a superset of `admin` *for the org they belong to* and adds course authoring rights. A standalone `instructor` (no `organization_id`) can author courses but cannot do anything `admin`-flavored.

## The context object

Every RPC procedure handler receives a `ctx`:

```ts
type Ctx = {
  user: User;                  // never null inside an authenticated procedure
  role: Role;
  organizationId: string | null;
  request: Request;
};
```

`ctx` is built by `lib/rpc/middleware.ts` from the JWT cookie. If the cookie is missing/invalid, `requireAuth` middleware throws `UNAUTHENTICATED` before the handler runs.

## Permission matrix (RPC procedures)

| Procedure | Allowed roles | Additional constraint |
| --- | --- | --- |
| `auth.signup` | (public) | — |
| `auth.login` | (public) | — |
| `auth.logout` | any | — |
| `auth.me` | any (auth optional) | returns null if no cookie |
| `users.updateProfile` | any | can only update own row |
| `users.list` | `admin`, `instructor`, `super_admin` | scoped to `ctx.organizationId` for non-super |
| `organizations.invite` | `admin`, `super_admin` | invitee's email scoped to caller's org |
| `organizations.removeInvite` | `admin`, `super_admin` | scoped to caller's org |
| `organizations.assignTrack` | `admin`, `super_admin` | track and user both in caller's org |
| `tracks.create` | `admin`, `super_admin` | track tied to caller's org |
| `tracks.addCourse` | `admin`, `super_admin` | track in caller's org |
| `courses.list` | any (auth optional) | filters by visibility (see below) |
| `courses.get` | any (auth optional) | rejects org-restricted if caller not in org |
| `courses.create` | `instructor`, `super_admin` | instructor of created course = caller |
| `courses.publish` | `instructor` (author only), `super_admin` | — |
| `courses.assign` | `user`, `admin`, `instructor`, `super_admin` | see "Self-assign rules" below |
| `courses.adminAssign` | `admin`, `instructor`, `super_admin` | target user must be in caller's org |
| `modules.start` | any | must own the assignment |
| `modules.end` | any | must own the assignment; previous modules must be ended |
| `quiz.check` | any | must own the assignment; modules done |
| `survey.answer` | any | must own the assignment; quiz passed |
| `aiSimulation.evaluate` | any | must own the assignment containing the module |
| `dashboards.userCompliance` | any | own data only |
| `dashboards.userCeuProgress` | any | own data only |
| `dashboards.adminCompliance` | `admin`, `super_admin` | scoped to `ctx.organizationId` |
| `certificates.download` | any | must own the assignment AND be complete |

`super_admin` may pass an explicit `organizationId` argument to bypass scope; everyone else has scope enforced server-side.

## Self-assign rules (course visibility)

`courses.assign` (the user-initiated path) rejects unless one of:

- `course.access_type = 'public'`, OR
- `course.access_type = 'organization_restricted' AND course.organization_id = ctx.user.organization_id`, OR
- `course.access_type = 'premium' AND <entitlement check>` (entitlement system not yet built → currently returns `FORBIDDEN: PREMIUM_NOT_ENTITLED`).

`courses.adminAssign` (the admin-initiated path) additionally allows the admin to assign:

- Any `public` course to any org member.
- Any `organization_restricted` course where `course.organization_id = ctx.organizationId`.
- Any `premium` course to org members (the org is paying — entitlement deferred).

## Tenant isolation rules

These rules are enforced in middleware + procedure code, and verified by code review.

1. **No raw `db.query.X.findMany()`** in a procedure that returns rows scoped to an org. Always `where: eq(X.organizationId, ctx.organizationId)` for admin role; `where: eq(X.userId, ctx.user.id)` for user role.
2. **Cross-tenant FK writes are rejected.** When inserting an `assigned_courses` row via `courses.adminAssign`, the procedure verifies:
   - The target `user.organization_id = ctx.organizationId`.
   - The course is either public, premium, or restricted to `ctx.organizationId`.
3. **List procedures default to scoped.** A `users.list` from an `admin` returns only their org's users — no `?organizationId=` query parameter is honored.
4. **Joined reads carry the scope.** When loading an assignment and its course, the join must include `eq(assignedCoursesTable.organizationId, ctx.organizationId)` even though the path is "via user" — defense in depth.
5. **No `id` is enough to grant access.** Knowing an `assigned_course.id` does not let another user act on it. Every per-row procedure (`modules.end`, `quiz.check`, `survey.answer`, `certificates.download`) loads the assignment and checks `assignment.user_id === ctx.user.id` (or org-membership for admin reads).

## The middleware composition

```ts
// lib/rpc/middleware.ts

export const publicProcedure = procedure();

export const authedProcedure = procedure()
  .use(requireAuth);

export const userProcedure = authedProcedure
  .use(requireRole(['user', 'admin', 'instructor', 'super_admin']));

export const adminProcedure = authedProcedure
  .use(requireRole(['admin', 'instructor', 'super_admin']))
  .use(injectOrgScope);   // attaches ctx.organizationId or throws

export const instructorProcedure = authedProcedure
  .use(requireRole(['instructor', 'super_admin']));

export const superAdminProcedure = authedProcedure
  .use(requireRole(['super_admin']));
```

A procedure is defined like:

```ts
export const adminAssign = adminProcedure
  .input(z.object({ userId: z.string().uuid(), courseId: z.string().uuid() }))
  .output(assignedCourseSchema)
  .handler(async (ctx, input) => { /* ... */ });
```

Detail in [`05-rpc-contract.md`](./05-rpc-contract.md).

## Audit checklist for every new procedure

Before merging, the agent must confirm in the PR description:

- [ ] Procedure is declared with the most restrictive `*Procedure` builder that works.
- [ ] Every `db.*` call inside the handler includes the right scope filter (`organizationId` or `userId`).
- [ ] Cross-tenant inputs (e.g. `targetUserId`) are validated against `ctx` before any write.
- [ ] Output schema does not leak fields from other tenants (e.g. don't `with: { organization: true }` for a user-role caller unless filtered).
- [ ] If the procedure mutates more than one table, it runs inside a transaction (WebSocket pool).
- [ ] If the procedure is new, its spec file exists in `docs/06-procedures/` and is linked from the PR.
