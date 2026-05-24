# dashboards.* procedures

In `lib/rpc/procedures/dashboards.ts`. These are read-only and computation-heavy. They are the main consumers of the indexes defined in [`03-schema.md`](../03-schema.md#indexes-summary).

The math for all three procedures is centralized in `lib/ceu/*` so the UI and procedures share the exact same definition of "complete." See [`07-completion-and-ceu-rules.md`](../07-completion-and-ceu-rules.md).

---

## dashboards.userCompliance

**Roles:** any (returns own data).
**Touched tables:** `assigned_courses`, `courses`, `tracks`, `tracks_assignments`, `track_courses` (joined).

### Input

`z.object({})`

### Output

```ts
z.object({
  overall: z.object({
    total:     z.number(),
    completed: z.number(),         // currently complete (within 365d)
    overdue:   z.number(),         // assigned with due_date in past and not complete
    percent:   z.number(),         // 0-100, rounded
  }),
  byTrack: z.array(z.object({
    trackId:       z.string().uuid(),
    trackName:     z.string(),
    cycleEndsOn:   z.coerce.date(),
    total:         z.number(),
    completed:     z.number(),
    overdue:       z.number(),
    percent:       z.number(),
  })),
})
```

### Behavior

1. Load every `assigned_courses` row for `ctx.user.id`.
2. For each row, compute `isComplete` via `lib/ceu/isAssignmentComplete(row)` — which checks `quizPassedAt IS NOT NULL AND completedAt IS NOT NULL AND completedAt > NOW() - 365 days`.
3. Compute overall: `total = rows.length`, `completed = rows.filter(isComplete).length`, `overdue = rows.filter(r => r.dueDate && r.dueDate < NOW() && !isComplete(r)).length`.
4. For each `tracks_assignments` of this user, join through `track_courses` → `assigned_courses` for the same user and the same course; compute per-track rollup; `cycleEndsOn = cycleStartedOn + cycleMonths`.
5. Return.

### Notes

- Independent users (no org) will have empty `byTrack`. `overall` still works.
- Compliance does NOT consider `licenseType` — it's pure assignment math.

### Playwright validation

- Assign 4 courses → complete 2 → `percent = 50`.

---

## dashboards.userCeuProgress

**Roles:** any (own data).
**Touched tables:** `users`, `assigned_courses`, `courses`, `course_approvals` (joined).

### Input

`z.object({})`

### Output

```ts
z.object({
  goal: z.object({
    licenseType:        licenseTypeSchema.nullable(),
    targetHours:        z.number().nullable(),
    cycleMonths:        z.number().nullable(),
    cycleStartedOn:     z.coerce.date().nullable(),
    cycleEndsOn:        z.coerce.date().nullable(),
  }),
  hoursEarned:    z.number(),                // CE hours of completed-within-cycle courses
  hoursRemaining: z.number(),                // max(target - earned, 0)
  percent:        z.number(),                // earned/target rounded; null if no goal
  contributing:   z.array(z.object({         // breakdown for the UI
    courseId:        z.string().uuid(),
    courseTitle:     z.string(),
    ceHours:         z.number(),
    completedAt:     z.coerce.date(),
    approvedBy:      approvedBySchema.array(),
  })),
})
```

### Behavior

1. Load `users` row. If `ceuTargetHours / cycleMonths / cycleStartedOn / licenseType` is missing → return zero-filled goal.
2. Compute `cycleEndsOn = cycleStartedOn + cycleMonths months`.
3. Load every assigned course for this user where `completedAt IS NOT NULL AND completedAt >= cycleStartedOn AND completedAt <= cycleEndsOn AND quizPassedAt IS NOT NULL`.
4. Join `course_approvals` and filter: a course's `ce_hours` counts toward the goal only if there is a `course_approvals` row matching the user's `licenseType` via `lib/ceu/licenseApprovalMap.ts`:

    ```ts
    // lib/ceu/licenseApprovalMap.ts
    export const LICENSE_APPROVAL_MAP: Record<LicenseType, ApprovedBy[]> = {
      counseling:            ['NBCC'],
      social_work:           ['ASWB'],
      marriage_family_therapy: ['CAMFT', 'NBCC'],
      nursing:               ['Nursing'],
      addiction_counselor:   ['NAADAC'],
      psychology:            ['APA'],
      physician:             [],   // physicians use CME, not in our enum yet
      peer_support:          ['NAADAC'],
    };
    ```

5. Sum `ce_hours`. Round to nearest tenth.
6. Return.

### Playwright validation

- User with `licenseType='counseling'`, goal=20h/24mo. Complete a 5h course approved by NBCC → `hoursEarned = 5`.
- Complete a 5h course approved only by APA → no contribution (psychology only).

---

## dashboards.adminCompliance

**Roles:** `admin`, `super_admin`.
**Touched tables:** `users`, `assigned_courses`, `tracks_assignments` (joined and aggregated).

### Input

```ts
z.object({
  trackId:   z.string().uuid().optional(),       // narrow rollup
  jobRoleId: z.string().uuid().optional(),
})
```

### Output

```ts
z.object({
  org: z.object({
    organizationId:  z.string().uuid(),
    organizationName: z.string(),
    totalUsers:      z.number(),
    activeUsers:     z.number(),
    overallPercent:  z.number(),
  }),
  byUser: z.array(z.object({
    userId:        z.string().uuid(),
    name:          z.string(),
    jobRoleId:     z.string().uuid().nullable(),
    assigned:      z.number(),
    completed:     z.number(),
    overdue:       z.number(),
    percent:       z.number(),
  })),
})
```

### Behavior

1. Force `organizationId = ctx.organizationId`.
2. List active users in the org. Optionally filter by `jobRoleId`.
3. For each user, sum assignments (optionally narrowed to courses in `trackId`'s `track_courses`).
4. Compute per-user rollup using `lib/ceu/isAssignmentComplete`.
5. Compute org overall as `sum(completed) / sum(assigned)`.

### Playwright validation

- Two users in Org A: one 4/4 complete, one 0/4. Admin sees 50% overall, per-user 100/0.
- Admin in Org B cannot see Org A users.
