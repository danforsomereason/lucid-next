# 10 — Testing and validation

There is **no test suite** in this repository. No Jest, no Vitest, no Playwright spec files. This is a deliberate choice (question 24): we want the agent to validate features by driving a real browser through the actual flows. The cost of maintaining unit tests for a small product that's still finding its shape is higher than the benefit.

This document explains what the agent must do **in place of tests** before declaring a change done.

## Required pre-merge checks

For every PR the agent opens, the following must be true and shown in the PR description:

1. **`npm run build` succeeds** with no TypeScript errors and no Next.js build errors.
2. **`npm run deadcode`** does not report any new dead exports.
3. **A Playwright walkthrough** of the affected user flow has been executed against a local dev server (`npm run dev`) and the steps + screenshots are pasted into the PR.

## Using Playwright via the CLI / MCP

Cursor ships with the **Playwright MCP** (or, locally, `npx playwright`). The agent should drive these flows headed when developing, headless when verifying. The standard pattern:

```bash
# Optional one-time install
npx playwright install chromium

# Start the dev server in one terminal
npm run dev

# In another terminal (or via the agent's Playwright MCP):
#   navigate → screenshot → assert visible text → click → fill → submit
```

When using the Playwright MCP from inside an agent session, the steps are tool calls rather than shell — same idea, different syntax. Either way, capture screenshots at the key state transitions.

## Canonical flows the agent should know

Each flow has a "happy path" plus the most common failure-path. The agent should walk **at least** the happy path for any change that touches the flow, and the failure path if their change could plausibly affect it.

### Flow A: independent user signup → assign public course → complete

1. `goto /signup/individual` → fill form with a fresh email → submit.
2. Land on `/dashboard`. Verify CEU goal panel says "set your license."
3. `goto /courses` → click on any public course → click **Begin Course**.
4. `goto /course/<id>/modules` → walk each module → **Complete Module** on each.
5. Take the quiz; submit all-correct answers.
6. Verify `assigned_courses.quizPassedAt` is set (via a quick DB peek or by reloading the page and seeing the "Begin Survey" CTA).
7. Walk the survey to the last question. Submit.
8. Verify `assigned_courses.completedAt` is now set.
9. Return to `/dashboard/courses` → course shows as **Complete**.
10. Click **Download Certificate** → PDF downloads with the right filename.

### Flow B: org admin invites → user signs up → admin assigns track

1. As `admin` in Org A, `goto /dashboard/users` (when this page exists) → invite `colleague@example.com`.
2. Open a private window, `goto /signup/individual`, sign up with `colleague@example.com`.
3. Verify the new user has `organization_id` = Org A (via DB or by visiting `/dashboard` and seeing org-themed content).
4. Back as admin, create a track ("2026 Onboarding") with 2 courses.
5. Assign the track to the new user.
6. As the new user, verify `/dashboard/courses` shows 2 mandated courses with the track name.

### Flow C: instructor creates an AI simulation course

1. As `instructor`, `goto /courses/create`.
2. Fill course form. Add a text module ("Intro") and an AI simulation module with `aiInitialStatement` and `aiResponseCriteria`.
3. Add a quiz with 1 question.
4. Save → publish.
5. As a `user`, self-assign the course.
6. Walk text module → on the AI sim module, send a passing response → verify the module closes and the next step (quiz) unlocks.
7. Send a failing response first; verify it does NOT close the module; second attempt with a passing response closes it.

### Flow D: tenant isolation smoke test

1. Sign up Admin A in Org A. Create an org-restricted course.
2. Sign up Admin B in Org B. Verify that:
   - Admin B's `/courses` does NOT list Org A's restricted course.
   - Navigating directly to `/course/<orgA-course-id>` returns 404 (not 403).
   - `users.list` from Admin B returns only Org B's users.
3. Try to call `rpc.courses.adminAssign` from Admin B with a target `userId` belonging to Org A → 403.

## When to write down a flow

If a feature has a flow that isn't in the list above and is non-trivial to remember, add a section to this doc as part of the same PR. Future agents should be able to read this file and know how to validate any feature.

## Things the agent should never do

- ❌ Don't write `*.test.ts` files. There is no test runner; they're dead code.
- ❌ Don't add `jest`, `vitest`, `@testing-library/*`, `playwright/test` (the assertion framework) to `package.json`. Use raw `playwright` for browser automation only.
- ❌ Don't add CI test jobs.
- ❌ Don't skip validation because "the change is small." Type safety doesn't catch logic regressions.

## When this policy might change

If the project gains a real customer with an SLA, we'll revisit and add at least a smoke-test suite. That decision will be made in an ADR (e.g. `adr/0007-introduce-test-runner.md`) before any test code lands.
