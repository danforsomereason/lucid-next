# users.* procedures

In `lib/rpc/procedures/users.ts`.

---

## users.updateProfile

**Roles:** any (acts on `ctx.user.id`; never on another user).
**Touched tables:** `users`.
**Transactional:** no.

### Input

```ts
z.object({
  firstName:           z.string().min(1).max(100).optional(),
  lastName:            z.string().min(1).max(100).optional(),
  licenseType:         licenseTypeSchema.nullable().optional(),
  ceuTargetHours:      z.number().int().positive().max(1000).nullable().optional(),
  ceuCycleMonths:      z.number().int().positive().max(60).nullable().optional(),
  ceuCycleStartedOn:   z.coerce.date().nullable().optional(),
})
```

### Output

`userSchema` — the updated user.

### Behavior

1. Drop any keys whose value is `undefined`.
2. If `ceuTargetHours` is set but `ceuCycleMonths` is null (or vice versa) → `BAD_REQUEST: CEU_GOAL_INCOMPLETE`. CEU goals are a single coherent unit; both or neither.
3. Update `users` row WHERE `id = ctx.user.id`. Don't allow setting `role`, `organizationId`, `email`, or `password` via this procedure.
4. Return the updated row.

### Notes

- Email/password changes need their own procedures (`users.changeEmail`, `users.changePassword`) with re-auth flows. Out of scope for V1.

### Playwright validation

- Update first name → reload page → new name in nav.
- Set CEU goal (20 hours, 24 months, today) → dashboard shows 0 / 20.

---

## users.list

**Roles:** `admin`, `instructor`, `super_admin`.
**Touched tables:** `users` (read).
**Transactional:** no.

### Input

```ts
z.object({
  jobRoleId:    z.string().uuid().nullable().optional(),
  search:       z.string().min(1).max(100).optional(),  // matches first/last/email prefix
  limit:        z.number().int().min(1).max(100).default(50),
  cursor:       z.string().optional(),
})
```

### Output

```ts
z.object({
  items: userSchema.array(),
  nextCursor: z.string().nullable(),
})
```

### Behavior

1. Build a query against `users` filtered by `organization_id = ctx.organizationId` (mandatory for non-super; for super, allow input `organizationId` override).
2. Apply optional filters (jobRoleId, search prefix).
3. Order by `(createdAt desc, id desc)`; cursor is `${createdAt}_${id}` from the last row.
4. Always exclude `password` and `isActive=false` users (unless caller is `super_admin` and explicitly asks).

### Playwright validation

- Admin in Org A sees only Org A users (no Org B leakage).
- Search by email prefix returns the expected subset.
