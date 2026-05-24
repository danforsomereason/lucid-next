# 05 — RPC contract

We don't use tRPC ([ADR-0001](./adr/0001-custom-rpc-pattern.md)). We use a tiny in-house RPC layer that costs ~150 lines of code and gives us end-to-end type safety, Zod validation, role-based middleware, and a single network surface.

## The wire format

Every RPC call is a single HTTP POST.

| | |
| --- | --- |
| URL | `/api/rpc/<procedureName>` (dispatcher route is `app/api/rpc/[procedure]/route.ts`) |
| Method | `POST` |
| Headers | `Content-Type: application/json` |
| Cookies | `token=<jwt>` (httpOnly, set by `auth.login`/`auth.signup`) |
| Body | JSON — the parsed `input` of the procedure (`{}` if no input) |

Response envelope:

```ts
type RpcResponse<T> =
  | { ok: true;  data: T }
  | { ok: false; code: RpcErrorCode; message: string; issues?: z.ZodIssue[] };

type RpcErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL';
```

HTTP status maps from `code`:

| code | HTTP |
| --- | --- |
| `BAD_REQUEST` | 400 |
| `UNAUTHENTICATED` | 401 |
| `FORBIDDEN` | 403 |
| `NOT_FOUND` | 404 |
| `CONFLICT` | 409 |
| `INTERNAL` | 500 |

`ok: true` is always 200. We never use other 2xx codes.

## File layout

```text
lib/
└── rpc/
    ├── server/
    │   ├── procedure.ts     # the builder pattern (procedure().use().input().output().handler())
    │   ├── middleware.ts    # requireAuth, requireRole, injectOrgScope
    │   ├── errors.ts        # RpcError, RpcErrorCode
    │   ├── dispatch.ts      # the runtime invoked by the dispatcher route
    │   └── registry.ts      # { 'auth.login': authLogin, 'courses.assign': coursesAssign, ... }
    ├── procedures/
    │   ├── auth.ts
    │   ├── users.ts
    │   ├── courses.ts
    │   ├── modules.ts
    │   ├── quiz.ts
    │   ├── survey.ts
    │   ├── organizations.ts
    │   ├── tracks.ts
    │   ├── dashboards.ts
    │   ├── certificates.ts
    │   └── ai.ts
    └── client.ts             # browser-side typed proxy (one function)
app/
└── api/
    └── rpc/
        └── [procedure]/
            └── route.ts      # 1 file; routes everything
```

## Defining a procedure

```ts
// lib/rpc/procedures/courses.ts
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import db from '@/db';
import { coursesTable, assignedCoursesTable } from '@/schema';
import { assignCourseInputSchema, assignedCourseSchema } from '@/types';
import { userProcedure } from '@/lib/rpc/server/middleware';
import { RpcError } from '@/lib/rpc/server/errors';

export const assign = userProcedure
  .input(assignCourseInputSchema)
  .output(assignedCourseSchema)
  .handler(async (ctx, input) => {
    const course = await db.query.coursesTable.findFirst({
      where: eq(coursesTable.id, input.courseId),
    });
    if (!course) throw new RpcError('NOT_FOUND', 'Course not found');

    // visibility check (see 04-rbac)
    if (course.accessType === 'organization_restricted'
        && course.organizationId !== ctx.user.organizationId) {
      throw new RpcError('FORBIDDEN', 'Course not available to your organization');
    }
    if (course.accessType === 'premium') {
      throw new RpcError('FORBIDDEN', 'Premium entitlement required');
    }

    const [row] = await db.insert(assignedCoursesTable).values({
      userId: ctx.user.id,
      courseId: course.id,
      organizationId: ctx.user.organizationId,
      source: 'self_assigned',
      assignedBy: ctx.user.id,
    }).onConflictDoNothing().returning();

    if (!row) {
      // already assigned — re-read and return it
      const existing = await db.query.assignedCoursesTable.findFirst({
        where: and(
          eq(assignedCoursesTable.userId, ctx.user.id),
          eq(assignedCoursesTable.courseId, course.id),
        ),
      });
      return existing!;
    }
    return row;
  });
```

## Registering procedures

```ts
// lib/rpc/server/registry.ts
import * as auth from '@/lib/rpc/procedures/auth';
import * as courses from '@/lib/rpc/procedures/courses';
// ...

export const procedures = {
  'auth.signup':        auth.signup,
  'auth.login':         auth.login,
  'auth.logout':        auth.logout,
  'auth.me':            auth.me,

  'courses.list':       courses.list,
  'courses.get':        courses.get,
  'courses.create':     courses.create,
  'courses.assign':     courses.assign,
  'courses.adminAssign':courses.adminAssign,
  'courses.publish':    courses.publish,

  // ... etc
} as const;

export type ProcedureMap = typeof procedures;
export type ProcedureName = keyof ProcedureMap;
```

## The dispatcher

```ts
// app/api/rpc/[procedure]/route.ts
import { NextResponse } from 'next/server';
import { dispatch } from '@/lib/rpc/server/dispatch';

export async function POST(
  req: Request,
  context: { params: Promise<{ procedure: string }> }
) {
  const { procedure } = await context.params;
  const result = await dispatch(procedure, req);
  return NextResponse.json(result.body, { status: result.status });
}
```

`dispatch` does: name lookup → ctx build → middleware chain → input parse → handler call → output parse → envelope.

## The client

```ts
// lib/rpc/client.ts
import type { ProcedureMap } from './server/registry';

type Input<P extends keyof ProcedureMap>  = ProcedureMap[P]['_input'];
type Output<P extends keyof ProcedureMap> = ProcedureMap[P]['_output'];

async function call<P extends keyof ProcedureMap>(
  name: P, input: Input<P>,
): Promise<Output<P>> {
  const res = await fetch(`/api/rpc/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(input),
  });
  const body = await res.json();
  if (!body.ok) throw new RpcClientError(body);
  return body.data;
}

// Build a nested proxy so callers can write `rpc.courses.assign({ ... })`.
export const rpc = makeProxy() as RpcProxy<ProcedureMap>;
```

`RpcProxy` is a type-level mapping `'courses.assign'` → `rpc.courses.assign`. See `lib/rpc/client.ts` once implemented.

### Usage from a client component

```tsx
'use client';
import { rpc } from '@/lib/rpc/client';
import { RpcClientError } from '@/lib/rpc/client';

async function onClick() {
  try {
    const assignment = await rpc.courses.assign({ courseId });
    router.push(`/course/${courseId}/modules`);
  } catch (e) {
    if (e instanceof RpcClientError && e.code === 'FORBIDDEN') {
      toast.error('You don\'t have access to that course.');
    } else {
      toast.error('Something went wrong. Please try again.');
    }
  }
}
```

### Usage from a server component (preferred for first-paint reads)

Server components should NOT call the RPC client. Call the procedure handler directly, or query Drizzle directly. Example:

```tsx
// app/dashboard/page.tsx
import { dashboards } from '@/lib/rpc/procedures/dashboards';
import { requireServerUser } from '@/lib/auth/session';

export default async function Page() {
  const user = await requireServerUser();      // 401-equivalent → redirect
  const compliance = await dashboards.userCompliance.callAsServer({ user });
  return <DashboardView data={compliance} />;
}
```

`callAsServer` skips the HTTP round-trip and runs the handler with a synthesized `ctx`.

## Naming conventions

| Pattern | Example |
| --- | --- |
| Domain | lowercase noun (`courses`, `auth`, `quiz`) |
| Verb | camelCase (`assign`, `adminAssign`, `get`, `list`, `create`, `update`, `publish`, `check`, `answer`, `download`) |
| Full name | `<domain>.<verb>` joined by a dot: `courses.assign` |
| List | always returns an array |
| Get | always returns one or throws `NOT_FOUND` |
| Update | always full replacement of allowed fields; for partial updates name the field (`updateProfile`, not `update`) |

## Input/output schemas

- **Always Zod.** Hand-rolled validators are forbidden.
- **Reuse `types.ts`** wherever possible — those schemas are derived from `schema.ts` so they stay in sync.
- **Output schemas may strip fields.** Don't return `users.password` (hash) ever. The output schema enforces this.
- **Pagination:** `input` carries `{ limit?: number, cursor?: string }`; `output` is `{ items: T[], nextCursor: string | null }`. Default `limit = 50`, max `100`.

## Errors

- Throw `RpcError(code, message)` from handlers. Don't return error envelopes manually.
- Domain-specific reason codes go in the message tail using `:` so the client can branch: `throw new RpcError('FORBIDDEN', 'PREMIUM_NOT_ENTITLED: this course requires a paid plan');`.
- Never include user-controlled strings in `INTERNAL` errors — that path is reserved for unexpected exceptions, and we log the full error server-side.

## Versioning

We do not version procedures. Breaking changes require:

1. A new procedure name (`courses.assignV2`).
2. Updating callers.
3. Removing the old one in the next deploy.

Don't add `version` parameters to inputs.

## Testing-against-the-contract

Procedures are validated end-to-end by Playwright user flows (see [`10-testing-and-validation.md`](./10-testing-and-validation.md)). If you find a contract violation, write the Playwright step that exposes it before fixing the code.
