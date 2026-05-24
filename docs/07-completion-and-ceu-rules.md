# 07 — Completion and CEU rules

This document is the single source of truth for the "complete?" and "how many CEUs?" math. All UI, all procedures, and all dashboards delegate to the helpers described here. Do not re-implement this logic in components or routes.

## The completion algorithm

A row in `assigned_courses` is **currently complete** if and only if all four are true:

```text
1. quizPassedAt IS NOT NULL                       // user passed the quiz at least once
2. completedAt IS NOT NULL                        // survey is fully filled out
3. completedAt > NOW() - INTERVAL '365 days'      // within the rolling 365-day window
4. (every module has module_progress.endModule)   // implied by 1 — quiz can't pass without ending modules
```

The canonical TypeScript implementation:

```ts
// lib/ceu/isAssignmentComplete.ts
import type { AssignedCourse } from '@/types';

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export function isAssignmentComplete(row: AssignedCourse, now: Date = new Date()): boolean {
  if (row.quizPassedAt == null) return false;
  if (row.completedAt == null) return false;
  if (now.getTime() - row.completedAt.getTime() > ONE_YEAR_MS) return false;
  return true;
}
```

The canonical SQL fragment (for dashboards that aggregate at the DB layer):

```sql
quiz_passed_at IS NOT NULL
  AND completed_at IS NOT NULL
  AND completed_at > NOW() - INTERVAL '365 days'
```

Both must give the same answer. If they ever diverge, **the SQL wins** and the JS helper is wrong.

## Why `completedAt` is set only by the survey

(Question 6 of the spec conversation.)

The product definition of "complete" is "passed quiz AND filled survey." We tracked these as a single timestamp early on and discovered two issues:

1. We couldn't tell the difference between "quiz passed, survey pending" and "fully done" without scanning `survey_answers`.
2. UI couldn't draw a meaningful progress bar when both were collapsed into a single column.

The fix: two columns. `quizPassedAt` marks step 1; `completedAt` marks step 2. **Only `survey.answer` (on the last survey question) writes `completedAt`.** Any other procedure that writes `completedAt` is a bug.

## States, in plain English

| `quizPassedAt` | `completedAt` | `completedAt` > NOW-365d | State the UI shows |
| --- | --- | --- | --- |
| null | null | n/a | **In progress** (modules and/or quiz) |
| set | null | n/a | **Survey pending** |
| set | set | yes | **Complete** ✅ |
| set | set | no | **Expired** ⏰ — counts in history, not in compliance |

`Expired` exists because licensure boards generally treat older CEUs as stale and most mandated trainings need annual re-doing. We keep the row (don't delete) but the dashboard treats it as "not complete" and admins can re-assign.

## CEU goal math (personal track)

A user has one goal (question 7) stored inline on `users`:

| Column | Example |
| --- | --- |
| `licenseType` | `'counseling'` |
| `ceuTargetHours` | `20` |
| `ceuCycleMonths` | `24` |
| `ceuCycleStartedOn` | `2026-01-01` |

The cycle window is `[cycleStartedOn, cycleStartedOn + cycleMonths)`.

### Which courses contribute?

A completed assignment contributes its course's `ceHours` iff **both**:

1. `assignment.completedAt` falls inside the user's current cycle window (not the rolling 365d — the user's own cycle).
2. The course has a `course_approvals` row whose `approved_by` is in the mapping for the user's `licenseType`.

The mapping lives in `lib/ceu/licenseApprovalMap.ts`:

```ts
export const LICENSE_APPROVAL_MAP: Record<LicenseType, ApprovedBy[]> = {
  counseling:              ['NBCC'],
  social_work:             ['ASWB'],
  marriage_family_therapy: ['CAMFT', 'NBCC'],
  nursing:                 ['Nursing'],
  addiction_counselor:     ['NAADAC'],
  psychology:              ['APA'],
  physician:               [],         // physicians use CME, not our approval bodies — see open question
  peer_support:            ['NAADAC'],
};
```

> **Open issue (track in `docs/adr/`):** physicians (MD/DO/NP/PA) use AMA Category 1/2 CME credits which we don't yet model. For now, `physician` users see a 0% goal; we'll add a CME approval body when this becomes a real customer requirement.

### The math

```ts
// lib/ceu/computeCeuProgress.ts
type Inputs = {
  user:      User;                        // must have ceuTarget*, licenseType
  completed: Array<{ course: Course; approvedBy: ApprovedBy[]; completedAt: Date }>;
};

export function computeCeuProgress({ user, completed }: Inputs) {
  if (!user.ceuTargetHours || !user.ceuCycleMonths || !user.ceuCycleStartedOn || !user.licenseType) {
    return { hoursEarned: 0, hoursRemaining: 0, percent: null };
  }
  const allowedBodies = LICENSE_APPROVAL_MAP[user.licenseType];
  const cycleStart = user.ceuCycleStartedOn;
  const cycleEnd   = addMonths(cycleStart, user.ceuCycleMonths);

  const contributing = completed.filter(c =>
    c.completedAt >= cycleStart &&
    c.completedAt <  cycleEnd  &&
    c.approvedBy.some(b => allowedBodies.includes(b)) &&
    (c.course.ceHours ?? 0) > 0
  );

  const earned = round1(contributing.reduce((sum, c) => sum + (c.course.ceHours ?? 0), 0));
  const remaining = Math.max(user.ceuTargetHours - earned, 0);
  const percent = Math.min(100, Math.round((earned / user.ceuTargetHours) * 100));
  return { hoursEarned: earned, hoursRemaining: remaining, percent, cycleStart, cycleEnd };
}
```

## Mandated compliance math (org track)

For organization compliance, we don't filter by approval body — every assigned course counts toward the assigned/completed ratio, regardless of CEU mapping.

```ts
// lib/ceu/computeCompliance.ts
export function computeCompliance(rows: AssignedCourse[]) {
  const total     = rows.length;
  const completed = rows.filter(r => isAssignmentComplete(r)).length;
  const overdue   = rows.filter(r =>
    r.dueDate != null && r.dueDate < new Date() && !isAssignmentComplete(r)
  ).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, overdue, percent };
}
```

## Edge cases the agent must handle

1. **User retakes a course after their `quizPassedAt` is set.** Don't clear `quizPassedAt` on a failed retake. If they pass again with the same or higher score, update `quizPassedAt` to the latest pass time (this affects the 365d window indirectly via `completedAt` rewrite on next survey, see #3).
2. **User retakes the survey.** We don't currently support survey re-takes. Once `completedAt` is set, `survey.answer` rejects with `CONFLICT: SURVEY_DONE`. To get a new 365-day window, the user must be re-assigned (admin assigns it again, creating a fresh row → because of the unique `(user_id, course_id)`, this means we instead **update the existing row**: reset `completedAt`, `quizPassedAt`, `quizAttempts`, delete `quiz_answers` and `survey_answers` and re-create `module_progress` placeholder. This is a `courses.reassign` procedure to be specced before implementing.)
3. **CE hours is null on a course.** It counts toward compliance (assigned/complete ratio) but contributes 0 hours to CEU goal.
4. **User's `licenseType` is null.** CEU goal procedure returns zeros; UI shows "set your license to track CEUs."
5. **`course_approvals` has rows for a body that doesn't match the user.** Course shows in the catalog and counts for compliance, but doesn't add hours.

## Don't do this

- ❌ Don't compute "complete" inline in a component. Always import `isAssignmentComplete`.
- ❌ Don't write `completedAt` from anywhere except `survey.answer`.
- ❌ Don't use `Date.now()` directly in DB writes. Use the SQL fragment so timezones align.
- ❌ Don't add a "complete" column to `assigned_courses`. It's a function of the timestamps; computed, never stored.
