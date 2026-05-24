# learning procedures: modules.*, quiz.*, survey.*

The path a user walks once a course is assigned. All four procedures live in `lib/rpc/procedures/{modules,quiz,survey}.ts`.

---

## modules.start

**Roles:** any (owner of assignment).
**Touched tables:** `module_progress`.
**Transactional:** no.

### Input

```ts
z.object({
  assignedCourseId: z.string().uuid(),
  moduleId:         z.string().uuid(),
})
```

### Output

`moduleProgressSchema`

### Behavior

1. Load assignment. Verify `assignment.userId = ctx.user.id`. → `FORBIDDEN` if not.
2. Load module. Verify `module.courseId = assignment.courseId`. → `BAD_REQUEST` if mismatched.
3. Verify all prior modules (`order < module.order` on the same course) have `module_progress.end_module IS NOT NULL` for this assignment. → `BAD_REQUEST: PRIOR_MODULE_INCOMPLETE`.
4. Insert `module_progress` row if not exists. `ON CONFLICT (assigned_course_id, module_id) DO NOTHING`.
5. Re-select and return.

### Playwright validation

- Hit module 2 before module 1 → server rejects.
- Hit module 1 → row appears with `startModule` set.

---

## modules.end

**Roles:** any (owner of assignment).
**Touched tables:** `module_progress`.
**Transactional:** no.

### Input

```ts
z.object({
  assignedCourseId: z.string().uuid(),
  moduleId:         z.string().uuid(),
})
```

> ⚠️ `assignedCourseId` is **required** here. The legacy REST route at `app/api/v1/modules/end/route.ts` finds the "first" assignment for the user and assumes it's the right one — that's bug #17. Don't repeat it.

### Output

`moduleProgressSchema`

### Behavior

1. Load `module_progress` WHERE `(assigned_course_id, module_id)`. → `NOT_FOUND` if missing.
2. Verify `assignment.userId = ctx.user.id`.
3. If `end_module IS NOT NULL` → return existing row (idempotent), don't bump the timestamp.
4. Update `end_module = NOW()`.

### Playwright validation

- End module 1 → row has `endModule` set; UI advances to module 2.

---

## quiz.check

**Roles:** any (owner of assignment).
**Touched tables:** `quiz_answers`, `assigned_courses`, `module_progress` (only on max-attempts reset).
**Transactional:** yes — multiple writes must succeed atomically.

### Input

```ts
z.object({
  courseId: z.string().uuid(),
  answers: z.array(z.object({
    questionId: z.string().uuid(),
    optionId:   z.string().uuid(),
  })).min(1),
})
```

### Output

```ts
z.object({
  passing:   z.boolean(),
  maximized: z.boolean(),    // attempts >= maximumAttempts
  score:     z.number(),     // 0-100
  results:   z.array(z.object({
    questionId:    z.string(),
    correct:       z.boolean(),
    correctAnswer: z.string(),    // the option text
    explanation:   z.string(),
  })),
})
```

### Behavior (transactional)

1. Load the assignment WHERE `(userId = ctx.user.id, courseId = input.courseId)`. → `NOT_FOUND`.
2. Load course with `modules` and `questions { options }`.
3. Verify every module has `module_progress.endModule != null` for this assignment. → `BAD_REQUEST: MODULES_INCOMPLETE`.
4. Verify `input.answers` length === `course.questions` length; each `questionId` exists; each `optionId` belongs to its question. → `BAD_REQUEST` otherwise.
5. Replace prior `quiz_answers` rows for this assignment + these questions (delete + insert, or `ON CONFLICT DO UPDATE`).
6. Grade: `score = (correctCount / total) * 100`, rounded to nearest int.
7. Let `newAttempts = assignment.quizAttempts + 1`. Let `passing = score >= course.passingScore`. Let `maximized = newAttempts >= course.maximumAttempts`.
8. If `passing`:
   - Set `assigned_courses.quizPassedAt = NOW()` (only if currently null OR newer score is also passing — see invariant 5 in `02-domain-model.md`).
   - Set `assigned_courses.quizAttempts = newAttempts`.
   - **Do NOT touch `completedAt`** (question 6 — survey-only).
9. Else if `maximized`:
   - Reset: `quizAttempts = 0`.
   - Delete all `module_progress` rows for this assignment except the first module's.
   - Update the first module's `end_module = NULL`.
   - User has to restart the course.
10. Else (failed but more attempts left):
    - Set `quizAttempts = newAttempts`.
11. Return `{ passing, maximized, score, results }`.

### Notes

- "Replace prior answers" mirrors current REST behavior — the user effectively re-submits the whole quiz each time.
- The result `correctAnswer` field exposes the right answer **only after submission** so the UI can show "you missed: X". This is by design; we don't expose the correct option in `courses.get`.

### Playwright validation

- Submit all-correct quiz on a 2-question course with `passingScore: 70` → `passing: true`, `quizPassedAt` set, `completedAt` still null.
- Submit failing answers `maximumAttempts` times → assignment reset, modules reopened, attempts back to 0.

---

## survey.answer

**Roles:** any (owner).
**Touched tables:** `survey_answers`, `assigned_courses` (on last question).
**Transactional:** yes when finishing the survey.

### Input

```ts
z.object({
  assignedCourseId: z.string().uuid(),
  order:            z.number().int().min(0),
  answer:           z.string().min(1).max(2000),
})
```

### Output

`surveyAnswerSchema`

### Behavior

1. Load assignment; verify owner.
2. Verify `assignment.quizPassedAt IS NOT NULL` → `FORBIDDEN: QUIZ_NOT_PASSED`. Survey is gated by quiz pass.
3. Verify `order` equals current `survey_answers.length` for this assignment (strict ordering). → `BAD_REQUEST: WRONG_ORDER`.
4. Verify `order < SURVEY_QUESTIONS.length`. → `BAD_REQUEST`.
5. Insert the answer.
6. If this was the last survey question (`order === SURVEY_QUESTIONS.length - 1`):
   - In the same transaction, set `assigned_courses.completedAt = NOW()`. This is the **only** code path that ever writes `completedAt`. (Question 6.)
7. Return inserted row.

### Playwright validation

- Try to answer the survey before quiz pass → 403.
- Submit out-of-order (e.g. order=5 when no prior) → 400.
- Submit all questions in order → after the last one, `assigned_courses.completedAt` is set and the user's dashboard shows the course as "complete."
