# organizations.* and tracks.* procedures

In `lib/rpc/procedures/organizations.ts` and `lib/rpc/procedures/tracks.ts`. Both share the same role contract (`admin+`) and the same tenant-isolation rules.

---

## organizations.invite

**Roles:** `admin`, `super_admin`.
**Touched tables:** `verified_users`.
**Transactional:** no.

### Input

```ts
z.object({
  email: z.string().email().toLowerCase(),
})
```

### Output

```ts
z.object({
  email: z.string(),
  organizationId: z.string().uuid(),
  invitedAt: z.coerce.date(),
})
```

### Behavior

1. `organization_id = ctx.organizationId` (super_admin may pass it explicitly).
2. Insert `(email, organization_id, invitedBy = ctx.user.id)` with `ON CONFLICT (email, organization_id) DO NOTHING`.
3. Re-select and return.

### Notes

- This does NOT send an email. Email delivery is a deferred concern (no SMTP integration yet).
- If a user with that email already exists in our system and is in a different org → still allow the invite; they can take a second org only via support escalation (out of scope V1).

### Playwright validation

- Admin invites `new@example.com` → row appears in `verified_users` with `organization_id`.
- New signup with `new@example.com` is auto-attached.

---

## organizations.removeInvite

**Roles:** `admin`, `super_admin`.
**Touched tables:** `verified_users`.
**Transactional:** no.

### Input

```ts
z.object({ email: z.string().email().toLowerCase() })
```

### Output

`z.object({ ok: z.literal(true) })`

### Behavior

1. Delete `verified_users` row WHERE `email = input.email AND organization_id = ctx.organizationId`.
2. Return `ok` even if 0 rows deleted (idempotent).

---

## tracks.create

**Roles:** `admin`, `super_admin`.
**Touched tables:** `tracks`.

### Input

```ts
z.object({
  name:         z.string().min(1).max(200),
  description:  z.string().max(2000).default(''),
  cycleMonths:  z.number().int().min(1).max(60),
  isMandatory:  z.boolean(),
})
```

### Output

`trackSchema`

### Behavior

1. Insert `tracks` row WITH `organizationId = ctx.organizationId`, `updatedBy = ctx.user.id`.
2. Unique `(organization_id, name)` — if conflict → `CONFLICT: NAME_TAKEN`.

---

## tracks.addCourse

**Roles:** `admin`, `super_admin`.
**Touched tables:** `track_courses`.

### Input

```ts
z.object({
  trackId:  z.string().uuid(),
  courseId: z.string().uuid(),
  order:    z.number().int().min(0),
})
```

### Output

`trackCourseSchema`

### Behavior

1. Load track; verify `track.organizationId = ctx.organizationId`.
2. Load course; verify it's `public` OR `organization_restricted AND organizationId = ctx.organizationId`. Reject premium (org should buy entitlement first).
3. Insert `track_courses` row with `ON CONFLICT (track_id, course_id) DO NOTHING`.
4. Return the row.

---

## tracks.assignToUser

**Roles:** `admin`, `super_admin`.
**Touched tables:** `tracks_assignments`, `assigned_courses`.
**Transactional:** **yes** — track assignment + fan-out must be atomic.

### Input

```ts
z.object({
  trackId:        z.string().uuid(),
  userId:         z.string().uuid(),
  cycleStartedOn: z.coerce.date().default(() => new Date()),
})
```

### Output

```ts
z.object({
  trackAssignment: tracksAssignmentSchema,
  newAssignedCourseIds: z.string().uuid().array(),  // which courses were newly assigned (vs. already present)
})
```

### Behavior (transactional)

1. Load track; verify `track.organizationId = ctx.organizationId`.
2. Load target user; verify `user.organizationId = ctx.organizationId`.
3. Insert `tracks_assignments` row (or no-op on conflict; if exists, update `cycleStartedOn` and `status = 'not_started'`).
4. For each `track_courses` row:
   - Try insert `assigned_courses` with `source = 'track_assigned'`, `assignedBy = ctx.user.id`, `organizationId = ctx.organizationId`. `ON CONFLICT (user_id, course_id) DO NOTHING`.
   - If an existing row had `source = 'self_assigned'`, leave it alone (don't change the source — the user got there first; we just won't fan out).
5. Collect inserted IDs.
6. Return.

### Invariants

- Removing a track from a user does NOT delete existing assignments (no destructive cascade).
- Re-assigning an existing track is idempotent.

### Playwright validation

- Create a track with 3 courses → assign to a user → user sees 3 mandated courses in `/dashboard/courses`.
- Re-assigning the same track → no duplicates.
- Self-assigning a course that's later put on a track → user has 1 row, source remains `self_assigned`.
