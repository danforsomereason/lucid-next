# 00 — Project overview

## The problem

Behavioral-health workers (counselors, social workers, addiction counselors, nurses, psychologists, physicians, peer-support specialists) are required to do two things at once:

1. Stay current on the **mandatory training** their employing organization assigns (handwashing, HIPAA, suicide-risk assessment, cultural-competency, etc.).
2. Accrue enough **Continuing Education Units (CEUs)** each renewal cycle to keep their personal license active with their state board.

Most existing LMS products do one of these well. Lucid does both, and it does them in a way that respects multi-tenant security so that an employer never sees a user's personal CEU history outside of the courses the employer assigned, and a peer admin in one org can never see staff or data of another.

## The users

| Role | Description | Typical day in Lucid |
| --- | --- | --- |
| `super_admin` | Lucid platform operator | Manage orgs, hard-fix data |
| `instructor` | Authors CEU-eligible courses | Create and publish courses with quizzes, surveys, modules |
| `admin` | Belongs to one org | Invite staff, assign mandated courses, watch compliance dashboards |
| `user` | Practitioner (org-bound or independent) | Take courses, pass quizzes, fill surveys, track CEUs toward their licensure goal |

Detailed permissions: [`04-rbac-and-tenancy.md`](./04-rbac-and-tenancy.md).

## The two core metrics

### Mandated compliance (org-facing)

> **% = (assigned courses completed within last 365 days) / (total assigned courses)**

Computed per user, rolled up per organization, sliced by track, license type, and job role.

### Personal CEU progress (user-facing)

> **% = (CEU hours earned within current cycle) / (target hours for current cycle)**

A user has **one** licensure goal (license type + target hours + cycle length + cycle start date). A course contributes its `ce_hours` toward the goal once it's "complete" (see below) AND the course's `course_approvals` row matches the user's `license_type`.

## What "complete" means

A course is complete when **all** of the following are true:

1. Every module has a `module_progress` row with `end_module IS NOT NULL`.
2. `assigned_courses.quiz_passed_at IS NOT NULL`.
3. `assigned_courses.completed_at IS NOT NULL` (this is set only when the survey is finished — never on quiz pass).
4. `assigned_courses.completed_at > NOW() - INTERVAL '365 days'`.

Quiz pass without survey ⇒ "in progress."
Survey before quiz pass ⇒ impossible (UI gates it; procedure rejects).

Full algorithm: [`07-completion-and-ceu-rules.md`](./07-completion-and-ceu-rules.md).

## Out of scope (for now)

- Live (synchronous) instruction
- Real-time chat / messaging
- Native mobile apps
- Webhooks / public API for 3rd-party LMS integrations
- Payment processing (premium course access is gated by a boolean entitlement; actual checkout is deferred)

## Glossary

### Licenses & boards

| Term | Definition |
| --- | --- |
| **LPC / LMHC** | Licensed Professional Counselor / Licensed Mental Health Counselor |
| **LCSW** | Licensed Clinical Social Worker |
| **LMFT** | Licensed Marriage and Family Therapist |
| **LADAC / LCDC** | Licensed Alcohol & Drug Counselor / Licensed Chemical Dependency Counselor |
| **RN / LPN / APRN** | Registered Nurse / Licensed Practical Nurse / Advanced Practice Registered Nurse |
| **MD / DO** | Doctor of Medicine / Doctor of Osteopathic Medicine |
| **NP / PA** | Nurse Practitioner / Physician Assistant |
| **Peer support specialist** | Certified person with lived recovery experience providing peer counseling |

### Approval bodies (the `approved_by` enum)

| Code | Full name | Approves for |
| --- | --- | --- |
| `NBCC` | National Board for Certified Counselors | Counselors (LPC, LMHC, NCC) |
| `APA` | American Psychological Association | Psychologists |
| `ASWB` | Association of Social Work Boards | Social workers (LCSW, LMSW) |
| `NAADAC` | Association for Addiction Professionals | Addiction counselors (LADAC, LCDC) |
| `CAMFT` | California Association of Marriage and Family Therapists | LMFTs (state-specific) |
| `Nursing` | State Board of Nursing | RNs, LPNs, APRNs |

### Compliance terms

| Term | Definition |
| --- | --- |
| **CEU (Continuing Education Unit)** | One hour of approved continuing education |
| **Renewal cycle** | The state-board window over which CEUs must accumulate; varies by license (commonly 1–3 years) |
| **Mandated training** | A course an employer requires (e.g. HIPAA, infection control, suicide risk assessment) |
| **Self-assigned** | A course a user picks for themselves from the public catalog |
| **Track** | An admin-curated bundle of courses with a shared compliance cycle |
| **Compliance cycle (org)** | The recurring window over which mandated courses must be completed (e.g. annual). Stored on `tracks.cycle_months`. |
