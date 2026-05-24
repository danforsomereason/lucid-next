# 03 — Database schema

The authoritative source is `schema.ts` (Drizzle). This document explains the **target** schema in Drizzle + plain English, the **deltas** from what's on disk today, and the rationale for each non-obvious choice.

We apply schema changes with `npm run push` (no migration history — ADR-0002). Treat `schema.ts` as the migration: review it carefully, then push.

## Enums

```ts
export const roleEnum = pgEnum('role', [
  'super_admin', 'instructor', 'admin', 'user',
]);

// REPLACES the boolean `premium` on courses (question 5)
export const courseAccessTypeEnum = pgEnum('course_access_type', [
  'public', 'premium', 'organization_restricted',
]);

// NEW (question 10) — polymorphic module dispatch
export const moduleTypeEnum = pgEnum('module_type', [
  'text', 'video', 'ai_simulation',
]);

// NEW (question 12) — provenance of an assignment
export const assignmentSourceEnum = pgEnum('assignment_source', [
  'self_assigned', 'admin_assigned', 'track_assigned',
]);

export const approvedByEnum = pgEnum('approved_by', [
  'NBCC', 'APA', 'ASWB', 'NAADAC', 'CAMFT', 'Nursing',
]);

export const questionTypeEnum = pgEnum('question_type', [
  'True/False', 'Multiple Choice', 'All That Apply',
]);

export const licenseTypeEnum = pgEnum('license_type', [
  'counseling', 'social_work', 'marriage_family_therapy',
  'nursing', 'addiction_counselor', 'psychology',
  'physician', 'peer_support',
]);

// Already exists but unused — wire it onto tracks_assignments.status
export const trackAssignmentStatusEnum = pgEnum('track_assignment_status', [
  'not_started', 'in_progress', 'completed', 'overdue',
]);

// NEW — for video module URL validation domain
export const videoProviderEnum = pgEnum('video_provider', [
  'youtube', 'vimeo',
]);
```

### Deltas vs current

- ➕ Add `courseAccessTypeEnum`, `moduleTypeEnum`, `assignmentSourceEnum`, `videoProviderEnum`.
- ➕ Add `marriage_family_therapy` to `licenseTypeEnum` (UI already has it).
- 🗑 Drop the boolean `courses.premium` once `courseAccessTypeEnum` is wired in.

## Tables

### `users`

```ts
export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),                  // NEW: unique
  password: text('password').notNull(),                     // bcrypt hash
  role: roleEnum('role').notNull(),
  organizationId: uuid('organization_id')
    .references(() => organizationsTable.id),               // null = independent
  jobRoleId: uuid('job_role_id')
    .references(() => jobRolesTable.id),
  licenseType: licenseTypeEnum('license_type'),

  // ── personal CEU goal (question 7: one per user, inlined) ──
  ceuTargetHours: integer('ceu_target_hours'),              // null = no goal set
  ceuCycleMonths: integer('ceu_cycle_months'),              // e.g. 24
  ceuCycleStartedOn: date('ceu_cycle_started_on'),          // start of current cycle

  isActive: boolean('is_active').notNull().default(true),   // soft-delete flag
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  emailIdx: uniqueIndex('users_email_idx').on(t.email),
  orgRoleIdx: index('users_org_role_idx').on(t.organizationId, t.role),
}));
```

**Why inline CEU goal?** Answer to question 7: one goal per user. Inlining keeps the dashboard query a single row read.

**Why `is_active` instead of hard delete?** Answer to question 16: delete-user procedure removed. Assignments, certificates, and audit trails reference user; we never drop the row.

### `organizations`

```ts
export const organizationsTable = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

Unchanged from current.

### `verified_users` (invitations)

```ts
export const verifiedUsersTable = pgTable('verified_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  organizationId: uuid('organization_id').notNull()
    .references(() => organizationsTable.id),
  invitedBy: uuid('invited_by').notNull()                   // NEW
    .references(() => usersTable.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
}, (t) => ({
  emailOrgIdx: uniqueIndex('verified_users_email_org_idx')
    .on(t.email, t.organizationId),
}));
```

Single email may be invited by multiple orgs simultaneously, but only once per org. On signup, the first matching invite wins (or we surface a chooser — design call deferred to the procedure spec).

### `job_roles`

```ts
export const jobRolesTable = pgTable('job_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  organizationId: uuid('organization_id').notNull()
    .references(() => organizationsTable.id),
}, (t) => ({
  orgNameIdx: uniqueIndex('job_roles_org_name_idx')
    .on(t.organizationId, t.name),
}));
```

### `courses`

```ts
export const coursesTable = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url'),
  ceHours: integer('ce_hours'),

  instructorId: uuid('instructor_id').notNull()
    .references(() => usersTable.id),

  // ── visibility (question 5) ──
  accessType: courseAccessTypeEnum('access_type').notNull(),
  organizationId: uuid('organization_id')                    // required when access_type = 'organization_restricted'
    .references(() => organizationsTable.id),

  // ── quiz config ──
  maximumAttempts: integer('maximum_attempts').notNull(),
  passingScore: integer('passing_score').notNull(),          // 0–100
  quizTitle: text('quiz_title'),

  isPublished: boolean('is_published').notNull().default(false), // NEW: drafts vs live
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  accessIdx: index('courses_access_org_idx').on(t.accessType, t.organizationId),
  instructorIdx: index('courses_instructor_idx').on(t.instructorId),
}));
```

**App-layer invariant (not enforceable as a CHECK across enums + nullable FK):** `accessType = 'organization_restricted' ⇒ organizationId IS NOT NULL`. Enforced in `lib/rpc/procedures/courses.ts`.

### `course_approvals` (NEW — question 11)

```ts
export const courseApprovalsTable = pgTable('course_approvals', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').notNull()
    .references(() => coursesTable.id, { onDelete: 'cascade' }),
  approvedBy: approvedByEnum('approved_by').notNull(),
  approvalNumber: text('approval_number').notNull(),         // CEU regulators require this on certificates
  expiresAt: date('expires_at'),                             // approval re-certification date
}, (t) => ({
  uniq: uniqueIndex('course_approvals_uniq')
    .on(t.courseId, t.approvedBy),
}));
```

A course's `ce_hours` only count toward a user's CEU goal if there's a row in `course_approvals` for the body their `license_type` maps to. The mapping lives in `lib/ceu/licenseApprovalMap.ts`.

### `categories` and `course_categories`

Unchanged.

### `learning_objectives`

Unchanged.

### `modules` (polymorphic — question 10)

```ts
export const modulesTable = pgTable('modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').notNull()
    .references(() => coursesTable.id, { onDelete: 'cascade' }),
  order: integer('order').notNull(),
  heading: text('heading').notNull(),
  estimatedMinutes: integer('estimated_minutes').notNull(),

  moduleType: moduleTypeEnum('module_type').notNull(),

  // ── text modules ──
  content: text('content'),                                  // markdown/HTML

  // ── video modules (URLs only — question 19) ──
  videoProvider: videoProviderEnum('video_provider'),
  videoUrl: text('video_url'),

  // ── ai_simulation modules (question 20) ──
  aiInitialStatement: text('ai_initial_statement'),
  aiResponseCriteria: text('ai_response_criteria'),          // instructor's eval rubric, passed to OpenAI
}, (t) => ({
  courseOrderIdx: uniqueIndex('modules_course_order_idx')
    .on(t.courseId, t.order),
}));
```

**App-layer invariants** (Drizzle can't easily express discriminated NOT NULLs):

- `module_type='text'` ⇒ `content IS NOT NULL`.
- `module_type='video'` ⇒ `video_provider IS NOT NULL AND video_url IS NOT NULL`.
- `module_type='ai_simulation'` ⇒ `ai_initial_statement IS NOT NULL AND ai_response_criteria IS NOT NULL`.

Enforced in `createCourseInput` Zod schema (discriminated union by `moduleType`) and in `lib/rpc/procedures/courses.ts`.

### `questions` + `options`

```ts
export const questionsTable = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').notNull()
    .references(() => coursesTable.id, { onDelete: 'cascade' }),
  order: integer('order').notNull(),
  questionText: text('question_text').notNull(),
  questionType: questionTypeEnum('question_type').notNull(),
  correctOptionOrder: integer('correct_option_order').notNull(),
  explanation: text('explanation').notNull(),
}, (t) => ({
  courseOrderIdx: uniqueIndex('questions_course_order_idx')
    .on(t.courseId, t.order),
}));

export const optionsTable = pgTable('options', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionId: uuid('question_id').notNull()
    .references(() => questionsTable.id, { onDelete: 'cascade' }),
  order: integer('order').notNull(),
  option: text('option').notNull(),
}, (t) => ({
  questionOrderIdx: uniqueIndex('options_question_order_idx')
    .on(t.questionId, t.order),
}));
```

### `assigned_courses` (junction — the hottest table)

```ts
export const assignedCoursesTable = pgTable('assigned_courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull()
    .references(() => usersTable.id),
  courseId: uuid('course_id').notNull()
    .references(() => coursesTable.id),

  // for fast org-scoped admin queries; denormalized from users.organization_id
  organizationId: uuid('organization_id')
    .references(() => organizationsTable.id),

  source: assignmentSourceEnum('source').notNull(),
  assignedBy: uuid('assigned_by').notNull()                  // self.id when source='self_assigned'
    .references(() => usersTable.id),
  assignedDate: timestamp('assigned_date').notNull().defaultNow(),
  dueDate: timestamp('due_date'),                            // optional, admin-set

  quizAttempts: integer('quiz_attempts').notNull().default(0),
  quizPassedAt: timestamp('quiz_passed_at'),                 // set on first pass; monotonic
  completedAt: timestamp('completed_at'),                    // set only by survey (question 6)
}, (t) => ({
  userCourseUniq: uniqueIndex('assigned_courses_user_course_uniq')
    .on(t.userId, t.courseId),
  userIdx: index('assigned_courses_user_idx').on(t.userId),
  orgIdx: index('assigned_courses_org_idx').on(t.organizationId),
  // For "current compliance" rollups:
  orgCompletedIdx: index('assigned_courses_org_completed_idx')
    .on(t.organizationId, t.completedAt),
}));
```

**Critical fix from current code (question 17):** `app/api/v1/questions/check/route.ts` and `app/api/v1/modules/end/route.ts` both do `findFirst(where: eq(userId, x))` without a courseId filter. The unique `(user_id, course_id)` index plus the procedure rewrite eliminates the wrong-row bug.

### `module_progress`

```ts
export const moduleProgressesTable = pgTable('module_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  assignedCourseId: uuid('assigned_course_id').notNull()
    .references(() => assignedCoursesTable.id, { onDelete: 'cascade' }),
  moduleId: uuid('module_id').notNull()
    .references(() => modulesTable.id),
  startModule: timestamp('start_module').notNull().defaultNow(),
  endModule: timestamp('end_module'),
}, (t) => ({
  uniq: uniqueIndex('module_progress_assignment_module_uniq')
    .on(t.assignedCourseId, t.moduleId),
}));
```

### `quiz_answers`

```ts
export const quizAnswersTable = pgTable('quiz_answers', {
  id: uuid('id').primaryKey().defaultRandom(),
  assignedCourseId: uuid('assigned_course_id').notNull()
    .references(() => assignedCoursesTable.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull()
    .references(() => questionsTable.id),
  optionId: uuid('option_id').notNull()
    .references(() => optionsTable.id),
  answeredAt: timestamp('answered_at').notNull().defaultNow(),
}, (t) => ({
  // one row per (assignment, question) — overwritten on retake
  uniq: uniqueIndex('quiz_answers_assignment_question_uniq')
    .on(t.assignedCourseId, t.questionId),
}));
```

### `survey_answers`

```ts
export const surveyAnswersTable = pgTable('survey_answers', {
  id: uuid('id').primaryKey().defaultRandom(),
  assignedCourseId: uuid('assigned_course_id').notNull()
    .references(() => assignedCoursesTable.id, { onDelete: 'cascade' }),
  order: integer('order').notNull(),                         // index into SURVEY_QUESTIONS
  answer: text('answer').notNull(),
  answeredAt: timestamp('answered_at').notNull().defaultNow(),
}, (t) => ({
  uniq: uniqueIndex('survey_answers_assignment_order_uniq')
    .on(t.assignedCourseId, t.order),
}));
```

### `module_ai_attempts` (NEW — for AI simulation modules)

```ts
export const moduleAiAttemptsTable = pgTable('module_ai_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  moduleProgressId: uuid('module_progress_id').notNull()
    .references(() => moduleProgressesTable.id, { onDelete: 'cascade' }),
  attemptNumber: integer('attempt_number').notNull(),
  userResponse: text('user_response').notNull(),
  evaluatorVerdict: boolean('evaluator_verdict').notNull(),  // pass/fail per OpenAI
  evaluatorRationale: text('evaluator_rationale').notNull(),
  modelName: text('model_name').notNull(),                   // audit which model evaluated
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  uniq: uniqueIndex('module_ai_attempts_progress_attempt_uniq')
    .on(t.moduleProgressId, t.attemptNumber),
}));
```

### `tracks` + `track_courses` + `tracks_assignments` (question 8)

```ts
export const tracksTable = pgTable('tracks', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull()
    .references(() => organizationsTable.id),
  name: text('name').notNull(),
  description: text('description').notNull(),
  cycleMonths: integer('cycle_months').notNull(),            // was: complianceCycle timestamp (wrong type)
  isMandatory: boolean('is_mandatory').notNull(),
  updatedBy: uuid('updated_by').notNull()
    .references(() => usersTable.id),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  orgNameIdx: uniqueIndex('tracks_org_name_idx')
    .on(t.organizationId, t.name),
}));

export const trackCoursesTable = pgTable('track_courses', {  // NEW
  id: uuid('id').primaryKey().defaultRandom(),
  trackId: uuid('track_id').notNull()
    .references(() => tracksTable.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').notNull()
    .references(() => coursesTable.id),
  order: integer('order').notNull(),
}, (t) => ({
  uniq: uniqueIndex('track_courses_track_course_uniq')
    .on(t.trackId, t.courseId),
}));

export const tracksAssignmentsTable = pgTable('tracks_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull()
    .references(() => usersTable.id),
  trackId: uuid('track_id').notNull()
    .references(() => tracksTable.id),
  assignedBy: uuid('assigned_by').notNull()
    .references(() => usersTable.id),
  assignedAt: timestamp('assigned_at').notNull().defaultNow(),
  cycleStartedOn: date('cycle_started_on').notNull(),        // NEW — this user's current cycle anchor
  status: trackAssignmentStatusEnum('status').notNull().default('not_started'),
}, (t) => ({
  uniq: uniqueIndex('tracks_assignments_user_track_uniq')
    .on(t.userId, t.trackId),
}));
```

When a track is assigned, the procedure also inserts an `assigned_courses` row (`source='track_assigned'`) for each `track_courses.course_id` the user doesn't already have. See `procedures/organizations.assignTrack`.

`tracks_assignments.status` is recomputed nightly (or on dashboard read) from the underlying assigned-course completions and the track's cycle.

## Indexes summary

| Table | Index | Purpose |
| --- | --- | --- |
| `users` | unique `(email)` | login lookup, dedupe |
| `users` | `(organization_id, role)` | admin user list |
| `assigned_courses` | unique `(user_id, course_id)` | invariant + lookup |
| `assigned_courses` | `(organization_id, completed_at)` | compliance rollups |
| `courses` | `(access_type, organization_id)` | catalog filtering |
| `course_approvals` | unique `(course_id, approved_by)` | dedupe |
| `modules` | unique `(course_id, order)` | ordering |
| `questions` | unique `(course_id, order)` | ordering |
| `options` | unique `(question_id, order)` | ordering |
| `module_progress` | unique `(assigned_course_id, module_id)` | dedupe |
| `quiz_answers` | unique `(assigned_course_id, question_id)` | dedupe / replace on retake |
| `survey_answers` | unique `(assigned_course_id, order)` | dedupe |
| `module_ai_attempts` | unique `(module_progress_id, attempt_number)` | ordering |
| `tracks` | unique `(organization_id, name)` | name uniqueness per org |
| `track_courses` | unique `(track_id, course_id)` | dedupe |
| `tracks_assignments` | unique `(user_id, track_id)` | dedupe |
| `verified_users` | unique `(email, organization_id)` | dedupe invites |

## Things deliberately not modeled (yet)

- **Payments / Stripe entitlements.** Premium courses are gated by app-layer rejection; no entitlement row exists yet.
- **Certificate persistence.** `generateCertificate.ts` exists; we generate PDFs on demand and don't store them.
- **Course versioning.** If an instructor edits questions after users have answered them, the old answers stay valid (the option IDs still resolve). We don't fork a course version. Documented as known limitation.
- **Audit log.** Every mutating procedure should eventually write to an `audit_log` table; deferred until we have a real compliance customer asking for it.
