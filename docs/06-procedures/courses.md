# courses.* procedures

In `lib/rpc/procedures/courses.ts`.

---

## courses.list

**Roles:** any (auth optional).
**Touched tables:** `courses` (read), maybe `course_categories`, `course_approvals` (joined).
**Transactional:** no.

### Input

```ts
z.object({
  categoryId: z.string().uuid().optional(),
  search:     z.string().min(1).max(100).optional(),
  approvedBy: approvedBySchema.optional(),
  limit:      z.number().int().min(1).max(100).default(50),
  cursor:     z.string().optional(),
})
```

### Output

```ts
z.object({
  items: courseSchema.array(),
  nextCursor: z.string().nullable(),
})
```

### Behavior

1. Filter by visibility:
   - Unauthenticated callers: only `accessType = 'public'` AND `isPublished = true`.
   - Authenticated `user`: above OR (`accessType = 'organization_restricted' AND organizationId = ctx.user.organizationId AND isPublished`).
   - Authenticated `admin`/`instructor`: same as `user`, plus their own org's drafts (`isPublished = false`) for org-restricted courses they can author/manage.
   - `super_admin`: see all.
2. Apply optional filters.
3. Sort by `createdAt desc, id desc`.

### Playwright validation

- Logged-out → only public published courses.
- Org A user → public + Org A restricted.

---

## courses.get

**Roles:** any (auth optional).
**Touched tables:** `courses`, `learning_objectives`, `course_approvals`, `users` (instructor name).
**Transactional:** no.

### Input

`z.object({ courseId: z.string().uuid() })`

### Output

`relatedCourseSchema` (course + learning_objectives + instructor).

### Behavior

1. Load course.
2. Visibility gate (same rules as `courses.list`). On reject → `NOT_FOUND` (don't reveal existence).
3. Return joined view; never include quiz answers or correct options.

### Playwright validation

- Logged-out user trying an org-restricted URL → 404 page.

---

## courses.create

**Roles:** `instructor`, `super_admin`.
**Touched tables:** `courses`, `modules`, `questions`, `options`, `course_approvals` (if approvals supplied).
**Transactional:** yes — all inserts wrapped in `db.transaction(...)` using the WebSocket pool.

### Input

```ts
z.object({
  title:           z.string().min(1).max(200),
  description:     z.string().min(1).max(5000),
  ceHours:         z.number().int().min(0).max(100).optional(),
  passingScore:    z.number().int().min(0).max(100),
  maximumAttempts: z.number().int().min(1).max(10),
  imageUrl:        z.string().url().optional(),

  accessType:      courseAccessTypeSchema,
  organizationId:  z.string().uuid().optional(),    // required iff accessType='organization_restricted'

  modules: z.array(
    z.discriminatedUnion('moduleType', [
      z.object({
        moduleType: z.literal('text'),
        heading: z.string().min(1).max(200),
        estimatedMinutes: z.number().int().min(0),
        content: z.string().min(1),
      }),
      z.object({
        moduleType: z.literal('video'),
        heading: z.string().min(1).max(200),
        estimatedMinutes: z.number().int().min(0),
        videoProvider: videoProviderSchema,
        videoUrl: z.string().url(),
      }),
      z.object({
        moduleType: z.literal('ai_simulation'),
        heading: z.string().min(1).max(200),
        estimatedMinutes: z.number().int().min(0),
        aiInitialStatement: z.string().min(1).max(5000),
        aiResponseCriteria: z.string().min(1).max(5000),
      }),
    ]),
  ).min(1),

  questions: z.array(questionDefSchema).min(1),
  approvals: z.array(z.object({
    approvedBy: approvedBySchema,
    approvalNumber: z.string().min(1).max(100),
    expiresAt: z.coerce.date().optional(),
  })).default([]),
})
```

### Output

`courseSchema` — the inserted course.

### Behavior

1. Validate `accessType` ↔ `organizationId` consistency.
2. If `accessType = 'organization_restricted'`, instructor must belong to that org (or be `super_admin`).
3. Open transaction:
   - Insert `courses` (with `isPublished = false`, `instructorId = ctx.user.id`).
   - Insert `modules` with `order = index`.
   - Insert `questions` with `order = index`; validate `correctOptionOrder < options.length` per question.
   - Insert `options` for each question.
   - Insert `course_approvals` rows.
4. Return the course row.

### Playwright validation

- Author a text + video + ai_simulation course with 2 questions → returned course visible in `/courses` under your account.

---

## courses.publish

**Roles:** `instructor` (author only), `super_admin`.
**Touched tables:** `courses`.
**Transactional:** no.

### Input

`z.object({ courseId: z.string().uuid() })`

### Output

`courseSchema`

### Behavior

1. Load course; if not found → `NOT_FOUND`.
2. If caller is `instructor` and not the author → `FORBIDDEN`.
3. Refuse if the course has 0 modules or 0 questions.
4. Set `isPublished = true`.

---

## courses.assign

**Roles:** `user`, `admin`, `instructor`, `super_admin` (self-assign).
**Touched tables:** `assigned_courses`.
**Transactional:** no (single insert with `ON CONFLICT DO NOTHING`).

### Input

`z.object({ courseId: z.string().uuid() })`

### Output

`assignedCourseSchema`

### Behavior

1. Load the course.
2. Visibility gate (see [`04-rbac-and-tenancy.md`](../04-rbac-and-tenancy.md#self-assign-rules-course-visibility)).
3. Insert `assigned_courses` with:
   - `userId = ctx.user.id`
   - `assignedBy = ctx.user.id` (per question 12 — self-id when self-assigning)
   - `source = 'self_assigned'`
   - `organizationId = ctx.user.organizationId`
4. `ON CONFLICT (user_id, course_id) DO NOTHING` then re-select. Returns the existing assignment if already assigned (idempotent).

### Error codes

- `FORBIDDEN`: `PREMIUM_NOT_ENTITLED`, `ORG_RESTRICTED`.
- `NOT_FOUND`: course gone or unpublished.

### Playwright validation

- Assign a public course → row appears in `/dashboard/courses`.
- Try to assign an org-restricted course from a user in a different org → 403.
- Try to assign a premium course → 403.

---

## courses.adminAssign

**Roles:** `admin`, `instructor`, `super_admin`.
**Touched tables:** `assigned_courses`.
**Transactional:** no (single insert).

### Input

```ts
z.object({
  courseId: z.string().uuid(),
  userId:   z.string().uuid(),
  dueDate:  z.coerce.date().optional(),
})
```

### Output

`assignedCourseSchema`

### Behavior

1. Load target user. Verify `targetUser.organizationId = ctx.organizationId` (or caller is `super_admin`).
2. Load course. Verify the course is assignable in caller's org (public OR `organization_restricted AND organizationId = ctx.organizationId` OR premium with admin override).
3. Insert `assigned_courses` with:
   - `userId = targetUser.id`
   - `assignedBy = ctx.user.id`
   - `source = 'admin_assigned'`
   - `organizationId = ctx.organizationId`
   - `dueDate`
4. `ON CONFLICT DO NOTHING` then re-select. If existing row's `source = 'self_assigned'`, upgrade `source` to `'admin_assigned'` and set `dueDate` (preserving progress).

### Playwright validation

- Admin A in Org A assigns to user A → row appears in user A's dashboard with due date.
- Admin A trying to assign to user B in Org B → 403.
