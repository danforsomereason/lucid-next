# 06 — Procedure catalog

This folder contains a spec per RPC procedure (or per small group of related procedures). Every new procedure starts here with a spec PR before any code is written. See [`AGENTS.md`](../../AGENTS.md#7-the-default-agent-workflow).

## Catalog

| Procedure | File | Roles | Description |
| --- | --- | --- | --- |
| `auth.signup` | [`auth.md`](./auth.md) | public | Create user, attach org via `verified_users` if invited, issue cookie |
| `auth.login` | [`auth.md`](./auth.md) | public | Verify bcrypt, issue cookie |
| `auth.logout` | [`auth.md`](./auth.md) | any | Clear cookie |
| `auth.me` | [`auth.md`](./auth.md) | any | Return current user or null |
| `users.updateProfile` | [`users.md`](./users.md) | any (self) | Update first/last/license/CEU goal |
| `users.list` | [`users.md`](./users.md) | admin+ | List users in caller's org |
| `organizations.invite` | [`organizations.md`](./organizations.md) | admin+ | Add email to `verified_users` for caller's org |
| `organizations.removeInvite` | [`organizations.md`](./organizations.md) | admin+ | Remove a pending invite |
| `tracks.create` | [`organizations.md`](./organizations.md) | admin+ | Create a track in caller's org |
| `tracks.addCourse` | [`organizations.md`](./organizations.md) | admin+ | Add a course to a track |
| `tracks.assignToUser` | [`organizations.md`](./organizations.md) | admin+ | Assign track → fan out `assigned_courses` |
| `courses.list` | [`courses.md`](./courses.md) | any (auth optional) | Catalog with visibility filters |
| `courses.get` | [`courses.md`](./courses.md) | any (auth optional) | Single course |
| `courses.create` | [`courses.md`](./courses.md) | instructor+ | Author a draft course |
| `courses.publish` | [`courses.md`](./courses.md) | instructor (author) / super_admin | Flip `is_published` |
| `courses.assign` | [`courses.md`](./courses.md) | user+ | Self-assign |
| `courses.adminAssign` | [`courses.md`](./courses.md) | admin+ | Assign to an org member |
| `modules.start` | [`learning.md`](./learning.md) | any | Insert `module_progress` row |
| `modules.end` | [`learning.md`](./learning.md) | any | Set `end_module` for current module |
| `quiz.check` | [`learning.md`](./learning.md) | any | Grade quiz, set `quiz_passed_at` if passing |
| `survey.answer` | [`learning.md`](./learning.md) | any | Append survey answer; on last, set `completed_at` |
| `aiSimulation.evaluate` | [`ai.md`](./ai.md) | any | Send user's response to OpenAI, store attempt |
| `dashboards.userCompliance` | [`dashboards.md`](./dashboards.md) | any | Mandated %, broken out by track |
| `dashboards.userCeuProgress` | [`dashboards.md`](./dashboards.md) | any | Personal goal % per cycle |
| `dashboards.adminCompliance` | [`dashboards.md`](./dashboards.md) | admin+ | Org-wide rollup |
| `certificates.download` | [`certificates.md`](./certificates.md) | any | Stream PDF of completed course |

## Spec template

Every per-procedure entry uses this shape:

```markdown
## <domain>.<verb>

**Roles:** ...
**Touched tables:** ...
**Transactional:** yes/no (and why)

### Input
\`\`\`ts
z.object({ ... })
\`\`\`

### Output
\`\`\`ts
...
\`\`\`

### Behavior
1. ...
2. ...

### Error codes
- `BAD_REQUEST`: ...
- `FORBIDDEN`: ...
- `NOT_FOUND`: ...
- `CONFLICT`: ...

### Side effects
- Sets cookie, writes audit row, sends email, etc.

### Invariants enforced
- ...

### Playwright validation
- Steps the agent must walk through before declaring this procedure done.
```

When the agent writes a new procedure, it copies this template into the appropriate domain file (or creates a new domain file if the new procedure doesn't fit) and fills it out **before** writing any TS.

## Coverage status

Procedures already implemented as REST routes that need RPC ports + the fixes called out in `12-migration-from-rest.md`:

- ✅ Spec-defined and ready to implement: all rows in the table above.
- 🚧 Implementation tracking lives in the project board; this folder only carries specs.
