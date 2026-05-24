# 09 — Security

## Threat model in one paragraph

Lucid stores **PHI-adjacent data** (license type, employer, training history). It is not PHI itself, but customers will treat it as if it were. The most damaging realistic threats are: (a) **cross-tenant leak** of one org's user list or compliance data to another org's admin, (b) **account takeover** via weak password handling or session theft, and (c) **PII exposure** in logs, JWTs, or error envelopes. We do NOT defend against state-level adversaries, supply-chain attacks on `@neondatabase/serverless`, or insider attacks at Vercel or Neon.

## Authentication

- **Hashing**: `bcryptjs` with cost factor `10`. Don't lower; raise to `12` when login latency budget allows.
- **Session**: stateless JWT. Payload: `{ userId, role, iat, exp }`. Signed with `env.JWT_SECRET` using HS256.
- **Expiry**: `7d`. Renewed silently on activity by re-signing inside `auth.me` if the token is past its halfway point.
- **Storage**: HttpOnly cookie. Flags:

    ```ts
    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
    ```

  `lax` (not `strict`) so that the login redirect on a fresh tab still carries the cookie. We do not need cross-site cookies because the app is single-origin.
- **`JWT_SECRET`** must be ≥ 32 chars in production. `env.ts` enforces this:

    ```ts
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be >= 32 chars'),
    ```

## Login enumeration

`auth.login` runs `bcryptjs.compare` even when the user doesn't exist (compares against a constant dummy hash) so the response time doesn't distinguish "user not found" from "wrong password." The error message is identical.

`users.check-exists/[email]` (current REST route) **leaks** existence on the signup page. We accept this trade-off for UX (showing "this email is already registered, sign in?"). When the RPC port lands, gate this endpoint behind a rate limit (10 / minute / IP) and surface a generic message after the threshold.

## CSRF

We rely on:

1. **`SameSite=Lax` cookies** — defeats classical cross-site form CSRF.
2. **Origin header check** in the RPC dispatcher: in production, reject any POST whose `Origin` is not in the allowlist (`https://<vercel-prod-url>`, plus configured custom domains).
3. **JSON-only bodies** — the dispatcher requires `Content-Type: application/json` and rejects `multipart/form-data` and `application/x-www-form-urlencoded`, neither of which a benign client would ever send to RPC.

No CSRF token is required.

## Tenant isolation

This is the highest-risk failure mode. See [`04-rbac-and-tenancy.md`](./04-rbac-and-tenancy.md) for the rules. Specifically:

- Every multi-tenant query filters by `organization_id` from `ctx`.
- `assigned_courses.organization_id` is denormalized from `users.organization_id` precisely so we can do org-scoped rollups without `JOIN users`.
- Output schemas exclude `password` and don't `with: { organization: true }` for user-role callers.
- Pre-merge checklist in [`04-rbac-and-tenancy.md`](./04-rbac-and-tenancy.md#audit-checklist-for-every-new-procedure) is required.

## Secrets

- `.env` is `.gitignore`d. The current committed `.env` contains real Neon and Cloudinary credentials — **rotate these once `JWT_SECRET` work lands** (issue: existing `.env` should be considered compromised since it's been committed historically; see Action #1 below).
- Never log `env.JWT_SECRET`, `env.DATABASE_URL`, or any cookie. Don't `console.log(request.headers)` — it contains the cookie.
- The OpenAI key for AI simulation modules is `env.OPENAI_API_KEY`, only loaded in `lib/ai/*` modules.

## Input validation

- All RPC inputs go through Zod. No exceptions.
- All RPC outputs are also parsed by Zod (`outputSchema.parse(result)`) so we catch field-level drift before it reaches the wire.
- File uploads are out of scope today; video URLs are validated as `z.string().url()` plus a domain check (`youtube.com|youtu.be|vimeo.com`).

## Rate limiting

Not implemented yet. **Action item:** before going live to a paying customer, add an in-memory token bucket (or Upstash Redis if we're on Vercel) for:

- `auth.login` — 5 / minute / IP.
- `auth.signup` — 3 / hour / IP.
- `aiSimulation.evaluate` — 10 / minute / user (also a cost cap).
- Everything else — 60 / minute / user.

## Things we are deliberately NOT doing

- ❌ No password complexity rules beyond 12-char minimum. Long passphrases beat complex short ones.
- ❌ No email verification on signup. Verified-users invite flow covers the org case; for independent users, email verification adds friction without a real attack mitigation pre-payments.
- ❌ No 2FA. Add once a real customer asks.
- ❌ No row-level security policies in Postgres. We enforce in the procedure layer. Worth re-evaluating if we ever expose direct PostgREST or Hasura.

## Action items (carried over from the audit)

1. **Rotate the Neon + Cloudinary credentials** currently in `.env` (they've been committed to history). Generate fresh Neon credentials and set in Vercel project env.
2. **Replace `"TEST_SECRET"`** in `utils/authenticate.ts`, `app/api/v1/users/login/route.ts`, `app/api/v1/users/signup/route.ts` with `env.JWT_SECRET`. (Question 14.) Tracked in the REST→RPC migration.
3. **Set secure cookie flags** on every set-cookie path. (Question 15.)
4. **Fix wrong-assignment lookup** in `questions/check` and `modules/end`. (Question 17.) Will be fixed naturally when these procedures move to RPC and accept `assignedCourseId` as an explicit input.
5. **Remove `users/delete` route**. (Question 16.) Replace with `isActive=false` soft-delete via a future `users.deactivate` procedure if needed.

## Reporting a vulnerability

Until we have an external bug-bounty channel, vulnerabilities should be reported privately to the project owner. Don't open a public issue.
