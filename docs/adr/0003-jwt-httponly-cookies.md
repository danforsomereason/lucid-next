# ADR-0003 — JWT in httpOnly cookies (no session store)

- **Status:** Accepted
- **Date:** 2026-05-24

## Context

We need user sessions. Options range from stateful (server-side session table or Redis store with random session IDs) to stateless (signed tokens, all state in the token). Lucid is small, single-origin, and currently has no Redis. We also already use `jsonwebtoken` and bcryptjs.

## Decision

Sessions are JWTs signed with `env.JWT_SECRET` (HS256), payload `{ userId, role, iat, exp }`, stored in a cookie named `token` with flags:

- `httpOnly: true`
- `secure: true` in production
- `sameSite: 'lax'`
- `path: '/'`
- `maxAge: 7 days`

There is no session store. The middleware that builds `ctx` verifies the JWT and re-loads the user from `users` (so a deactivated user can't keep using a stale token until expiry).

## Alternatives considered

- **Server session table (Lucia, custom)** — Real revocation, easier rotation. Adds a DB read per request. Worth doing once we have revocation requirements.
- **NextAuth / Auth.js** — Heavy for our needs; introduces magic config; complicates the auth UX flows we want.
- **Localstorage tokens** — XSS-exposed. Rejected.
- **iron-session** — Encrypted cookies. Slightly nicer than raw JWT but doesn't materially change the threat model.

## Consequences

- ✅ Zero auth infrastructure beyond `env.JWT_SECRET`.
- ✅ Re-loading user every request means deactivated users (soft delete) lose access immediately.
- ✅ Cookie is invisible to JS (httpOnly), so XSS can't steal it.
- ⚠ **No revocation list.** A stolen token works until expiry. Mitigation: short expiry (7d) + key rotation policy (manual). If revocation becomes critical, add a `token_revoked_after` column on `users` and reject any JWT whose `iat` is older.
- ⚠ Cookie-based auth means CSRF must be considered. We mitigate via `sameSite=lax` + Origin header check in the dispatcher.
- 🔭 Re-evaluate when we want SSO, when revocation is needed for a customer requirement, or when sub-domain auth lands.

## Links

- Security model: [`docs/09-security.md`](../09-security.md)
