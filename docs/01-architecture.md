# 01 — Architecture

## High-level diagram

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                         Browser  (Next 16 + React 19)                   │
│                                                                         │
│   Server Components  ───────────────────►  Drizzle (read-only path)     │
│   Client Components  ───►  rpc.client (typed)  ─────────┐               │
└─────────────────────────────────────────────────────────┼───────────────┘
                                                          │
                                                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Next.js server (Node runtime)                  │
│                                                                         │
│   app/api/rpc/[procedure]/route.ts                                      │
│        │                                                                │
│        │  1. read cookie  → verify JWT  → load user                     │
│        │  2. build ctx: { user, role, organizationId, request }         │
│        │  3. lookup procedure in registry                               │
│        │  4. check role middleware                                      │
│        │  5. inputSchema.parse(body)                                    │
│        │  6. await handler(ctx, input)                                  │
│        │  7. outputSchema.parse(result)                                 │
│        │  8. return JSON envelope { ok: true, data }                    │
│        ▼                                                                │
│   lib/rpc/procedures/<domain>.ts (auth, courses, modules, dashboards,   │
│                                   organizations, ai, …)                 │
│        │                                                                │
│        ▼                                                                │
│   db.ts → Drizzle ORM → Neon Postgres                                   │
│             (HTTP driver for reads,                                     │
│              WebSocket Pool for writes/transactions)                    │
└─────────────────────────────────────────────────────────────────────────┘
```

## The two data paths

### 1. Server-rendered pages (preferred for first-paint data)

A React Server Component awaits Drizzle directly. No RPC hop, no JSON, no waterfall.

```tsx
// app/dashboard/courses/page.tsx
const assignments = await db.query.assignedCoursesTable.findMany({
  where: eq(assignedCoursesTable.userId, currentUser.id),
  with: { course: true },
});
```

Use this for: dashboards, course catalog pages, "my courses," course description.

### 2. RPC procedures (everything mutating, and all client-side reads)

A Client Component imports the generated typed client and calls a procedure. The dispatcher validates, runs the handler, and returns a JSON envelope.

```ts
// components/CourseDescription.tsx
'use client';
import { rpc } from '@/lib/rpc/client';

await rpc.courses.assign({ courseId: course.id });
```

Use this for: every write, and any read that needs to live-refresh on the client.

Full RPC spec: [`05-rpc-contract.md`](./05-rpc-contract.md).

## Runtime

- **Hosting**: Vercel. Each route runs in the Node.js runtime (not edge) so we can use the Neon WebSocket pool.
- **Database**: Neon Serverless Postgres. We use two drivers in the same process:
  - `neon(env.DATABASE_URL)` HTTP driver — single-statement reads (cheap, no connection state).
  - `new Pool({ connectionString: env.DATABASE_URL })` WebSocket driver — required for `db.transaction(...)`. See ADR-0006.
- **Sessions**: stateless JWT in an httpOnly cookie. No session store.
- **Cold starts**: Vercel serverless cold-start + Neon wake-from-idle ≈ 500–1500 ms first request after idle. Acceptable for an LMS; don't add caching layers unless we measure a real problem.

## Layered code map

```text
                       ┌─────────────────────────────┐
                       │  app/  (pages + UI islands) │
                       └──────────────┬──────────────┘
                                      │
                       ┌──────────────▼──────────────┐
                       │  components/                │
                       │  context/                   │
                       └──────────────┬──────────────┘
                                      │
                       ┌──────────────▼──────────────┐
                       │  lib/rpc/client.ts          │   ← typed client (browser)
                       └──────────────┬──────────────┘
                                      │ POST /api/rpc/<proc>
                       ┌──────────────▼──────────────┐
                       │  app/api/rpc/[proc]/route   │   ← dispatcher
                       │  lib/rpc/middleware.ts      │
                       │  lib/rpc/registry.ts        │
                       └──────────────┬──────────────┘
                                      │
                       ┌──────────────▼──────────────┐
                       │  lib/rpc/procedures/*.ts    │   ← business logic
                       └──────────────┬──────────────┘
                                      │
                       ┌──────────────▼──────────────┐
                       │  schema.ts  +  types.ts     │
                       │  db.ts                      │
                       └─────────────────────────────┘
```

### Folder responsibilities

| Folder | Holds | Imports allowed from |
| --- | --- | --- |
| `app/` | Pages, layouts, the RPC dispatcher route | `components/`, `lib/`, `utils/`, `db`, `schema`, `types` |
| `components/` | React components (server + client) | `lib/`, `utils/`, `types`, `db` (server components only) |
| `context/` | React Context providers | `types` |
| `lib/` | App-wide infrastructure (rpc, auth, db helpers) | `db`, `schema`, `types`, `env`, `utils` |
| `lib/rpc/procedures/` | Business logic | `db`, `schema`, `types`, `lib/auth`, `lib/rpc/errors` |
| `utils/` | Pure helpers, no IO | `types` |
| `requests/` | **Deprecated** — being replaced by `lib/rpc/client.ts`. Don't add new files here. |

## Request lifecycle (a worked example)

User clicks "Begin Course" on `/course/[id]`:

1. **Client component** `CourseDescription.tsx` calls `rpc.courses.assign({ courseId })`.
2. **`lib/rpc/client.ts`** wraps it as `POST /api/rpc/courses.assign` with JSON body, `credentials: 'include'`.
3. **`app/api/rpc/[procedure]/route.ts`** runs:
   - Reads `token` cookie → `jwt.verify(token, env.JWT_SECRET)` → looks up `users` row → builds `ctx`.
   - Looks up the procedure `'courses.assign'` in the registry.
   - The procedure's middleware says `role: 'user'` (or higher). Passes.
   - Parses body with `assignCourseInputSchema`.
   - Calls the handler.
4. **Handler** (`lib/rpc/procedures/courses.ts → assign`):
   - Loads the course; checks `access_type` (rejects premium-without-entitlement or org-restricted-without-membership).
   - Inserts an `assigned_courses` row (with `assigned_by = ctx.user.id`, `source = 'self_assigned'`) inside a transaction that also inserts `module_progress` placeholders for the first module.
   - Returns the new `AssignedCourse`.
5. **Dispatcher** parses the result against the output schema, returns `{ ok: true, data: ... }`.
6. **Client** navigates to `/course/[id]/modules`.

## Error handling

- Handlers throw `RpcError(code, message)` where `code` ∈ `'BAD_REQUEST' | 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'INTERNAL'`.
- The dispatcher catches:
  - `ZodError` → `400` with `{ ok: false, code: 'BAD_REQUEST', issues: [...] }`.
  - `RpcError` → maps `code` to status (`UNAUTHENTICATED → 401`, `FORBIDDEN → 403`, `NOT_FOUND → 404`, `CONFLICT → 409`, others → 400 or 500).
  - Anything else → `500` with `{ ok: false, code: 'INTERNAL' }` (logs full error server-side; never returns the message to the client).
- Client `rpc.x.y(...)` rejects with a typed `RpcClientError` carrying `code`, `message`, `issues?`.

## Environment & secrets

`env.ts` is the only file that reads `process.env`. Every other module imports `env` and uses validated values. Adding a new env var means:

1. Add it to the Zod schema in `env.ts`.
2. Add it to `.env.example` (if it ever lands).
3. Document it in `README.md#required-environment-variables`.

Today's vars:

| Var | Required | Where used |
| --- | --- | --- |
| `DATABASE_URL` | yes | `db.ts` (both HTTP and Pool clients) |
| `JWT_SECRET` | yes | `lib/auth/session.ts` (signing + verifying) |
| `OPENAI_API_KEY` | only if AI sim modules used | `lib/ai/openai.ts` (see [`11-roadmap-video-and-ai-modules.md`](./11-roadmap-video-and-ai-modules.md)) |

## Why this shape (links)

- **Why not tRPC?** [ADR-0001](./adr/0001-custom-rpc-pattern.md)
- **Why `drizzle-kit push` instead of migrations?** [ADR-0002](./adr/0002-no-migrations-drizzle-push.md)
- **Why JWT cookies?** [ADR-0003](./adr/0003-jwt-httponly-cookies.md)
- **Why polymorphic modules via optional columns?** [ADR-0004](./adr/0004-polymorphic-modules-via-optional-columns.md)
- **Why dual Neon drivers?** [ADR-0006](./adr/0006-websocket-pool-for-transactions.md)
