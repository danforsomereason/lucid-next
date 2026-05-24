# Lucid

A secure, multi-tenant **Learning Management System (LMS) for behavioral-health workers** (counselors, social workers, addiction counselors, nurses, psychologists, physicians, peer-support specialists, and the administrators who manage them).

Lucid solves two problems at once:

1. **Organizational compliance** — admins assign mandatory courses to their staff and watch a live dashboard of who is current vs. overdue.
2. **Personal licensure CEUs** — individual practitioners track Continuing Education Unit hours against the goal their licensing board requires (e.g. 20 CEU hours every 2 years).

A course is only considered "complete" if the user has **passed the quiz** AND **completed the post-course survey within the last 365 days**. See [`docs/07-completion-and-ceu-rules.md`](./docs/07-completion-and-ceu-rules.md).

---

## Tech stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) | React Server Components default; client islands marked `'use client'` |
| Language | TypeScript (strict) | Path alias `@/*` → repo root |
| UI | Material UI v6 + MUI X Charts v7 | Custom theme in `theme.ts` (dark, primary purple) |
| API | Custom RPC (Zod-validated, TS-typed) | Single dispatcher at `POST /api/rpc/[procedure]` |
| Database | Neon Serverless Postgres | HTTP driver for reads, WebSocket `Pool` for transactional writes |
| ORM | Drizzle ORM 0.45 + `drizzle-zod` | `drizzle-kit push` (no migration history — see ADR-0002) |
| Auth | Custom: bcryptjs + JWT in httpOnly cookie | Secret in `env.ts` |
| PDF | pdf-lib | Certificates of completion |
| Dead-code | knip | `npm run deadcode` |

See [`docs/01-architecture.md`](./docs/01-architecture.md) for the full picture.

---

## Quick start

```bash
# 1. Install
npm install

# 2. Set up environment
cp .env.example .env   # then fill in DATABASE_URL and JWT_SECRET

# 3. Push schema to your Neon database
npm run push

# 4. Run the dev server
npm run dev
```

Open <http://localhost:3000>.

### Available scripts

```bash
npm run dev        # Next dev server
npm run build      # Production build
npm run start      # Run production build
npm run push       # Sync schema.ts → Neon (drizzle-kit push)
npm run drop       # Drop all tables (uses emptySchema.ts)
npm run reset      # drop + push (destroys all data)
npm run deadcode   # knip dead-code report (custom reporter)
```

### Required environment variables

| Var | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string (pooled, `sslmode=require`) |
| `JWT_SECRET` | Secret used to sign session JWTs. **Must be ≥ 32 chars in production.** |
| `CLOUDINARY_*` | Currently unused; kept for future asset hosting if needed |

`env.ts` validates these at boot via Zod and crashes early if anything is missing or malformed.

---

## Repository layout

```text
app/                          # Next.js App Router (pages + API routes)
  api/rpc/[procedure]/        # Single RPC dispatcher (target architecture)
  api/v1/                     # Legacy REST endpoints (being migrated — see docs/12)
  course/, courses/,
  dashboard/, signin/,
  signup/                     # User-facing pages
components/                   # MUI components (mix of server + client)
context/                      # React Context providers (global user, course modules, etc.)
docs/                         # Specs the AGENT reads to lead development
lib/                          # (target) auth, rpc dispatcher, db helpers
requests/                     # Client-side fetchers (axios)
utils/                        # Pure helpers (authenticate, checkQuiz, generateCertificate)
schema.ts                     # Drizzle table definitions + relations (source of truth)
types.ts                      # Zod schemas derived from schema.ts via drizzle-zod
db.ts                         # Neon client + Drizzle instance
env.ts                        # Validated environment variables
theme.ts                      # MUI theme
constants.ts                  # SURVEY_QUESTIONS, NEW_MODULE, NEW_QUIZ_QUESTION
```

---

## Where to read next

This project follows **spec-driven, agent-led development**. Before changing code, read the relevant doc and update it first.

- **Agent operators** → start with [`AGENTS.md`](./AGENTS.md).
- **New engineers** → read [`docs/00-overview.md`](./docs/00-overview.md) then [`docs/01-architecture.md`](./docs/01-architecture.md).
- **Designing a new procedure** → [`docs/05-rpc-contract.md`](./docs/05-rpc-contract.md) and the templates under [`docs/06-procedures/`](./docs/06-procedures/).
- **Touching the schema** → [`docs/03-schema.md`](./docs/03-schema.md) and write an ADR in [`docs/adr/`](./docs/adr/).
- **Compliance / CEU math** → [`docs/07-completion-and-ceu-rules.md`](./docs/07-completion-and-ceu-rules.md).

---

## Deployment

Target: **Vercel**. Neon Postgres is colocated; Vercel envs hold `DATABASE_URL` and `JWT_SECRET`. See [`docs/01-architecture.md`](./docs/01-architecture.md#runtime).
