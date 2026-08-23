# Lucid – Agent Instructions

An LMS platform for continuing education (CE) courses, built with Next.js App Router, Drizzle ORM (Neon/PostgreSQL), MUI v6, and JWT-based authentication.

## Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Push schema | `npm run push` |
| Reset DB (drop + push) | `npm run reset` |
| Dead code check | `npm run deadcode` |

> `npm run drop` pushes the empty schema (`drizzleEmpty.config.ts`) to wipe all tables. `npm run reset` is the safe alias for drop + re-push.

## Architecture

```
schema.ts       – Single Drizzle schema file; all table and enum definitions live here
types.ts        – All Zod schemas and inferred TypeScript types (no separate types folder)
env.ts          – Zod-validated environment config (DATABASE_URL, JWT_SECRET)
db.ts           – Neon serverless pool + Drizzle client export
app/api/v1/     – All REST endpoints; grouped by resource (users/, courses/, modules/, questions/, survey/)
components/     – React components; *Provider.tsx files wrap contexts
context/        – React context definitions (no state — state lives in Providers)
utils/          – Pure server-side utilities; no Next.js-specific imports except authenticate.ts
```

## Key Conventions

### API Routes
- Parse the request body as `unknown` before Zod: `const body: unknown = await request.json()`
- Validate with a schema from `types.ts` immediately after: `const input = myInputSchema.parse(body)`
- Wrap routes that can throw in `try/catch` and return `handleApiError(error)` — import from `@/utils/handleApiError`
- Use `ApiError` from `next/dist/server/api-utils` for structured HTTP errors (status + message)

### Auth / Guards
- `authenticate()` – reads JWT cookie, returns `RelatedUser | undefined`
- `guardAuthAdmin()` – throws `ApiError(401)` if user is not `instructor`, `admin`, or `super_admin` with an org; returns `RelatedAdminUser`
- `guardRelatedUserById()` – fetches a user by ID and throws if not found
- Routes that require authentication call one of the guards at the top; wrap in `try/catch` + `handleApiError`

### Database
- Import `db` from `@/db`; import table/enum names from `@/schema`
- Prefer `db.query.<table>.findFirst/findMany` with `with:` for relations over raw joins
- Use `eq`, `and`, `inArray` etc. from `drizzle-orm`
- All primary keys are UUID (`uuid().primaryKey().defaultRandom()`)
- After changing `schema.ts` run `npm run push` (not a migration file — direct push to Neon)

### Types
- All Zod schemas and TypeScript types are in `types.ts`
- Naming: `fooSchema` (Zod), `Foo` (inferred type), `FooInsert` for insert types, `FooInput`/`FooOutput` for API shapes
- `Db` type is exported from `types.ts` for passing `db` into utilities

### State / Context
- Global user state: `GlobalContext` + `GlobalProvider` (wraps entire app in `layout.tsx`)
- Context files define the context object only; Providers hold the `useState` / `useCallback` logic
- Client components use `useGlobal()` from `@/context/GlobalContext` to access current user

### UI
- MUI v6 — use `@mui/material` components; icons from `@mui/icons-material`
- CSS variables for brand colors defined in `styles/global.css` (e.g. `var(--black-color)`, `var(--secondary-color)`)
- Custom MUI theme in `theme.ts`
- `LucidInput` is the project's styled wrapper around MUI `TextField` — prefer it over raw `TextField`

### Roles
- `user` < `instructor` / `admin` < `super_admin`
- `INSTRUCTOR_ROLES = ["instructor", "super_admin"]` (from `types.ts`)
- `isInstructing()` utility checks if the current user is an instructor for a given course
