# 02 — Domain model

This document is the conceptual model — the *what* and the *why*. The physical schema (DDL, indexes, constraints) lives in [`03-schema.md`](./03-schema.md).

## Entity-relationship diagram

```text
                ┌──────────────────┐
                │  organizations   │
                └────────┬─────────┘
                         │ 1:N
            ┌────────────┼──────────────┬──────────────┐
            ▼            ▼              ▼              ▼
   ┌──────────────┐ ┌─────────┐  ┌──────────────┐ ┌────────────┐
   │ verified_    │ │  users  │  │  job_roles   │ │  tracks    │
   │ users        │ │         │  └──────┬───────┘ └─────┬──────┘
   │ (invites)    │ │         │         │               │
   └──────────────┘ └────┬────┘         │               │ N:M
                         │              │               │
         ┌───────────────┼──────────────┘               │
         │               │                              │ ┌──────────────┐
         │               │                              └─┤track_courses │
         │               │                                └──────┬───────┘
         │               │                                       │
         │ 1 (goal)      │                                       │
         ▼               │                                       │
   ┌──────────────┐      │     ┌──────────────────┐              │
   │  licensure_  │      │     │  courses         │◄─────────────┘
   │  goals (1:1) │      │     └──────┬───────────┘
   └──────────────┘      │            │
                         │            ├──────────────────┐
                         │            │                  │
                         │            ▼                  ▼
                         │     ┌──────────────┐  ┌──────────────────┐
                         │     │   modules    │  │course_approvals  │
                         │     │ (type:       │  └──────────────────┘
                         │     │  text|video  │
                         │     │  |ai_sim)    │
                         │     └──────┬───────┘
                         │            │
                         │            │       ┌──────────────┐
                         │            │       │  questions   │
                         │            │       └──────┬───────┘
                         │            │              │ 1:N
                         │            │              ▼
                         │            │       ┌──────────────┐
                         │            │       │   options    │
                         │            │       └──────────────┘
                         │            │
                         │ N:M (via assigned_courses)
                         ▼            ▼
                   ┌──────────────────────────┐
                   │   assigned_courses       │
                   │   (user × course)        │
                   │   quiz_passed_at         │
                   │   completed_at (=survey) │
                   │   assigned_by, source    │
                   └────────┬─────────────────┘
                            │
            ┌───────────────┼──────────────────┐
            ▼               ▼                  ▼
   ┌──────────────┐ ┌──────────────┐  ┌──────────────────┐
   │module_       │ │ quiz_answers │  │  survey_answers  │
   │progress      │ └──────────────┘  └──────────────────┘
   └──────────────┘
                            │
                            ▼ (only for ai_sim modules)
                   ┌──────────────────┐
                   │ module_ai_       │
                   │ attempts         │
                   └──────────────────┘

   ┌──────────────────┐
   │  categories      │  ──N:M──  courses  (via course_categories)
   └──────────────────┘
```

## Core entities

### `organizations`

A tenant boundary. Has many users, job roles, tracks, and verified-user invites. **Every multi-tenant query filters by `organization_id`.**

### `users`

The person. Always has a `role`. May or may not belong to an `organization_id`. Carries the personal licensure goal inline (one goal per user — questions answered #7) via `license_type`, `ceu_target_hours`, `ceu_cycle_months`, `ceu_cycle_started_on`.

### `verified_users`

The **invitation list**. When an org admin wants to add a colleague, they put the colleague's email here with their `organization_id`. When that email later signs up, the signup procedure checks `verified_users`, attaches the matching `organization_id`, and (atomically) deletes the invite row. **This is NOT email verification.** (Question 13.)

### `job_roles`

Free-form roles inside an org (e.g. "Nurse", "Counselor", "Front Desk"). Used to scope which tracks apply to which users.

### `courses`

The course definition: title, description, CE hours, passing score, max quiz attempts, access type. Belongs to one `instructor` and (when org-restricted) one `organization`. Approvals (`course_approvals`) are a separate junction so a course can be valid for multiple licensing bodies.

### `modules`

Ordered chunks of course content. **Polymorphic via `module_type` enum + optional columns** (ADR-0004):

| `module_type` | Uses columns |
| --- | --- |
| `text` | `content` (rich-text/markdown) |
| `video` | `video_url` (YouTube or Vimeo, embedded — see [`11-roadmap`](./11-roadmap-video-and-ai-modules.md)) |
| `ai_simulation` | `ai_initial_statement`, `ai_response_criteria` |

All module types share `heading`, `order`, `estimated_minutes`.

### `questions` + `options`

The course's post-content quiz. Question `correct_option_order` references the `order` of the correct `options` row.

### `assigned_courses` (the junction)

The single most important table. One row per `(user, course)` pair (enforced by `UNIQUE(user_id, course_id)`).

| Field | When set |
| --- | --- |
| `assigned_date` | At insert |
| `due_date` | Optional; admin-set for mandated courses |
| `assigned_by` | Always the acting user (self if self-assigned, admin if admin-assigned) — question 12 |
| `source` | `self_assigned` \| `admin_assigned` \| `track_assigned` |
| `quiz_attempts` | Incremented on each quiz submission |
| `quiz_passed_at` | Set when the user first achieves `score >= course.passing_score` |
| `completed_at` | **Set only when the survey is finished, never on quiz pass** — question 6 |

A course is "complete" iff `quiz_passed_at IS NOT NULL AND completed_at IS NOT NULL AND completed_at > NOW() - INTERVAL '365 days'`.

### `module_progress`

Per `(assigned_course, module)`: start and end timestamps. `end_module IS NULL` means "in progress."

### `quiz_answers`

One row per `(assigned_course, question)` recording the chosen `option_id` and timestamp. Overwritten on retake.

### `survey_answers`

One row per `(assigned_course, order)`. `order` references the position in the global `SURVEY_QUESTIONS` constant (question 9 — surveys are universal across all courses).

### `module_ai_attempts` (new — for AI simulation modules)

For each `(module_progress, attempt_number)`: the user's response text, the OpenAI evaluation, and pass/fail. See [`11-roadmap`](./11-roadmap-video-and-ai-modules.md) for the call shape.

### `tracks` + `track_courses` + `tracks_assignments`

A track is a named bundle of courses with a `cycle_months` window (e.g. "Annual onboarding — 12 months"). `track_courses` is the new junction listing which courses belong to the track (question 8). `tracks_assignments` assigns a track to a user; when the assignment is created, the system also inserts an `assigned_courses` row (with `source = 'track_assigned'`) for each course in the track that the user doesn't already have.

### `licensure_goals`

A per-user record (1:1) of the practitioner's target: license type, target CE hours, cycle length in months, cycle start date. Inlined on `users` for simplicity (question 7 — "one goal per user"), so this isn't a separate table — the columns live on `users`.

## Invariants

These are the rules the system must never break. They appear as DB constraints where possible, and as checks in the relevant procedures otherwise.

1. **One assignment per (user, course).** `UNIQUE(user_id, course_id)` on `assigned_courses`.
2. **Cross-tenant query rejection.** An `admin` querying users/assignments must include `organization_id = ctx.organizationId` or the procedure throws. Enforced in `lib/rpc/middleware.ts`.
3. **Org-restricted courses are gated on assign.** If `course.access_type = 'organization_restricted'`, then `user.organization_id` must equal `course.organization_id`.
4. **Premium courses require entitlement.** Until payments exist, premium self-assignment is rejected with `FORBIDDEN: PREMIUM_NOT_ENTITLED`. Admin assignment to org members is allowed (org pays).
5. **Quiz pass is monotonic.** Once `quiz_passed_at` is set, retakes don't unset it. A new pass with a higher score updates the timestamp; a failed retake doesn't touch it.
6. **Survey blocked until quiz passed.** `survey.answer` rejects unless `assigned_courses.quiz_passed_at IS NOT NULL`.
7. **Completion timestamp is survey-driven.** Only the survey procedure ever writes `completed_at`. Verified by code review and the spec test in [`07-completion-and-ceu-rules.md`](./07-completion-and-ceu-rules.md).
8. **Sequential module unlock.** The Nth module's content is only readable on the server when modules `0..N-1` all have `module_progress.end_module IS NOT NULL` for this assignment.
9. **Max quiz attempts.** When `quiz_attempts >= course.maximum_attempts` without a pass, the assignment is reset: all `module_progress` rows except the first are deleted, the first is set to `end_module = NULL`, and `quiz_attempts` is reset to 0. (Mirrors existing behavior in `app/api/v1/questions/check/route.ts`.)
10. **Track propagation is idempotent.** Assigning a track to a user inserts `assigned_courses` rows only for courses the user doesn't already have. Removing a track does NOT delete existing assignments (the user's progress is preserved).

## States (life of an assignment)

```text
created
   │  (insert assigned_courses)
   ▼
modules_in_progress
   │  (insert module_progress, set end_module on each)
   ▼
modules_done
   │  (quiz POST → score >= passing_score)
   ▼
quiz_passed              ───retake fails maximum_attempts times──►  reset to modules_in_progress
   │
   │  (survey POST, last question)
   ▼
survey_completed = completed_at set
   │
   │  +365 days
   ▼
expired  (still counts in history; not counted as "current")
```
