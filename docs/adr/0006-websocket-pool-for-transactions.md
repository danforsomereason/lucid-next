# ADR-0006 — Use Neon WebSocket `Pool` for transactional writes

- **Status:** Accepted
- **Date:** 2026-05-24

## Context

`@neondatabase/serverless` ships two drivers:

- `neon(url)` — HTTP. Cheap, fast cold start, no connection state. **Can only execute a single SQL statement per call.** Drizzle's `drizzle({ client: sql })` over this driver cannot run `db.transaction(...)`.
- `new Pool({ connectionString })` — WebSocket. Maintains a connection; supports multi-statement transactions; slightly higher latency on cold start.

Lucid has several procedures that must be atomic:

- `courses.create` — inserts a course + N modules + N questions + N×M options + approvals.
- `quiz.check` — possibly updates the assignment AND resets module_progress rows on max-attempts failure.
- `survey.answer` — on the last question, inserts the survey answer AND sets `completedAt`.
- `tracks.assignToUser` — inserts the track assignment AND fans out `assigned_courses` rows.
- `auth.signup` — inserts the user AND consumes any matching `verified_users` invite.
- `aiSimulation.evaluate` — inserts an attempt AND (on pass) sets `module_progress.endModule`.

Today (the legacy code path), `db.ts` uses only the HTTP driver and these multi-step operations are NOT transactional. The bug-class this creates: a partial failure leaves the DB inconsistent (e.g. a course exists but no questions; a survey is marked complete but the timestamp wasn't actually written).

## Decision

`db.ts` exposes **two** Drizzle instances:

```ts
// db.ts
import { neon, Pool } from '@neondatabase/serverless';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzleWs }   from 'drizzle-orm/neon-serverless';
import * as schema from './schema';
import env from './env';

const sql  = neon(env.DATABASE_URL);
const pool = new Pool({ connectionString: env.DATABASE_URL });

export const db    = drizzleHttp({ client: sql,  schema });   // default — for reads
export const txDb  = drizzleWs  ({ client: pool, schema });   // for db.transaction(...)
export default db;
```

Procedures that need a transaction `import { txDb } from '@/db'` and use `txDb.transaction(async (tx) => { ... })`. Procedures that only read or do a single insert keep using the default `db`.

## Alternatives considered

- **Use only the WebSocket Pool.** Simpler — one driver. But adds latency to every read (pool checkout) and adds an idle connection per serverless instance. Slight cost increase.
- **Use only the HTTP driver and "transactions" via single SQL statements.** Possible for some procedures (Postgres `WITH ... AS (INSERT ...)` chains), but breaks down for control flow (e.g. "if quiz passed, also do X"). Encourages clever SQL over readable TS.
- **PgBouncer in front of a non-serverless Postgres.** Off-topic; we picked Neon for a reason.

## Consequences

- ✅ Multi-statement transactions work.
- ✅ Reads stay on the cheap HTTP path.
- ⚠ Two instances to keep in sync (same schema, same env).
- ⚠ Code reviewers must check: "does this procedure write to more than one table? if yes, is it using `txDb.transaction`?"
- 🔭 Re-evaluate if Vercel + Neon ever ship a unified driver with transaction support over HTTP.

## Links

- Procedures that must be transactional: see [`docs/06-procedures/`](../06-procedures/) — flagged in each spec.
