# auth.* procedures

All four auth procedures live in `lib/rpc/procedures/auth.ts`. Cookie name is `token`. JWT signed with `env.JWT_SECRET`. See [`09-security.md`](../09-security.md) for cookie flags.

---

## auth.signup

**Roles:** public.
**Touched tables:** `users`, `verified_users` (delete).
**Transactional:** yes — create user + consume invite in one transaction.

### Input

```ts
z.object({
  firstName:   z.string().min(1).max(100),
  lastName:    z.string().min(1).max(100),
  email:       z.string().email().toLowerCase(),
  password:    z.string().min(12).max(200),
  licenseType: licenseTypeSchema.optional(),
})
```

### Output

```ts
z.object({
  user: userSchema,            // no `password` field — schema strips it
})
```

Cookie `token` is set as a side effect.

### Behavior

1. Lower-case the email; reject if a user with that email already exists (`CONFLICT: EMAIL_TAKEN`).
2. Look for a row in `verified_users` matching `email`. If exactly one match exists, use its `organization_id` and `role = 'user'`. If multiple matches exist (rare — same email invited by N orgs), pick none and surface a UX flow for the user to pick later (V1: pick the oldest invite).
3. Open transaction:
   - `bcryptjs.hash(password, 10)` → store as `users.password`.
   - Insert the `users` row with `organizationId`, `licenseType`, `role='user'`, `isActive=true`.
   - Delete the consumed `verified_users` row(s) for `email` matching the chosen `organization_id`.
4. Sign a JWT with payload `{ userId, role }`, expiry `7d`.
5. Set cookie.
6. Return the user (no password hash).

### Error codes

- `BAD_REQUEST`: zod parse failure (weak password, bad email).
- `CONFLICT`: `EMAIL_TAKEN`.

### Invariants enforced

- `users.email` is unique (DB constraint).
- If invited, the user is tied to the inviting org from minute one (no orphan signup followed by manual re-link).

### Playwright validation

- Sign up a fresh email → land on `/dashboard`.
- Pre-populate a `verified_users` row, sign up with that email, confirm the new user has `organization_id` set and the `verified_users` row is gone.

---

## auth.login

**Roles:** public.
**Touched tables:** `users` (read).
**Transactional:** no.

### Input

```ts
z.object({
  email:    z.string().email().toLowerCase(),
  password: z.string().min(1).max(200),
})
```

### Output

```ts
z.object({ user: userSchema })
```

Cookie `token` set as side effect.

### Behavior

1. Look up `users` by email.
2. **Always** run `bcryptjs.compare` even when the user is missing (compare against a dummy hash) to avoid email-enumeration via timing.
3. If user missing OR password mismatch OR `isActive = false` → `UNAUTHENTICATED: INVALID_CREDENTIALS`. Do not distinguish to the caller.
4. Sign JWT, set cookie, return user.

### Error codes

- `BAD_REQUEST`: zod parse.
- `UNAUTHENTICATED`: `INVALID_CREDENTIALS`.

### Playwright validation

- Login with the user created by signup → cookie present → `/dashboard` accessible.

---

## auth.logout

**Roles:** any (no-op if already logged out).
**Touched tables:** none.
**Transactional:** no.

### Input

`z.object({})`

### Output

`z.object({ ok: z.literal(true) })`

### Behavior

1. Clear the `token` cookie (set to empty with `expires` in the past, same flags as set on login).
2. Return `{ ok: true }`.

### Playwright validation

- After logout, `auth.me` returns null and `/dashboard` redirects.

---

## auth.me

**Roles:** any. Auth optional.
**Touched tables:** `users` (read).
**Transactional:** no.

### Input

`z.object({})`

### Output

```ts
z.object({
  user: userSchema.nullable(),
})
```

### Behavior

1. Read `token` cookie. If missing or invalid → return `{ user: null }`.
2. Otherwise read `users` row and return `{ user }` (no password).

### Notes

This is the procedure called by `app/layout.tsx` (server side) to hydrate the global user context. Server components prefer `requireServerUser()` from `lib/auth/session.ts` which has the same logic without going through HTTP.

### Playwright validation

- Visit `/` while logged out → no user pill.
- Visit `/` after login → first/last name pill.
