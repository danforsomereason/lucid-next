# 08 — Frontend conventions

## Component vs. page conventions

| Path | Type | Rule |
| --- | --- | --- |
| `app/**/page.tsx` | Server Component by default | Marked `'use client'` ONLY when interactive top-to-bottom |
| `app/**/layout.tsx` | Server Component | Same |
| `components/**.tsx` | Mix | If it imports `react` hooks or browser APIs → `'use client'`. Otherwise leave server-side. |

When a page is server-rendered, fetch directly from Drizzle (`db.query.xTable.findFirst`). Don't call the RPC HTTP layer from a server page.

When a page is client, get first-paint data from a server component **wrapper** that passes initial props, then mutate via `rpc.x.y(...)` from the client.

## Theme

Defined in `theme.ts` and `styles/global.css`. Dark UI; primary purple `#6B31B8`, secondary `#5E21AD`. Use:

- `var(--secondary-color)`, `var(--primary-color)`, `var(--white-color)`, `var(--black-color)` for non-MUI styling.
- The `color="primary"` / `color="secondary"` props on MUI components (they pick up the theme).

Don't add new color values inline. If a new shade is needed, add it to `global.css` first.

## Layout

The standard authenticated layout:

```text
<RootLayout>
  <NavBar />          ← always on top (height ≈ 86 px)
  <DashboardLayout>   ← only under /dashboard
    <Sidebar />       ← left, 280 px, role-aware menu
    <main>{children}</main>
  </DashboardLayout>
</RootLayout>
```

The public layout omits the `Sidebar`.

`Sidebar` builds its menu from `ctx.role` (see `components/Sidebar.tsx`). When adding a new top-level page, add a menu entry there in the appropriate role's array.

## MUI conventions

- **`Grid2`** is the default; the old `Grid` is on the way out. New components use `Grid2`.
- Use the `sx` prop for one-off styling. Reserve `styled(...)` for components reused across pages.
- For charts, use **MUI X Charts**. Avoid mixing chart libraries.
- For tables of org data, use `DataGrid` from `@mui/x-data-grid` (add to deps when first needed). Don't roll your own table.
- For forms with > 3 fields, build with `FormControl` / `FormHelperText` blocks and surface Zod errors per-field via the `error` and `helperText` props.

## Form / data flow

Client forms must:

1. Define a Zod schema (or import one from `types.ts`).
2. On submit, run `schema.parse(input)` locally for a first-pass UX win. The server re-parses regardless.
3. Call `rpc.x.y(parsedInput)`.
4. On `RpcClientError`, branch on `code`:
   - `BAD_REQUEST` + `issues` → highlight the relevant field.
   - `FORBIDDEN` / `UNAUTHENTICATED` → toast and redirect when relevant.
   - `INTERNAL` → toast "Something went wrong" and log to console.

Don't `try/catch` around individual fetches without a plan — let `RpcClientError` propagate up to a form-level handler.

## Global state

Three React contexts, all in `context/`:

| Context | What it holds | Where it lives |
| --- | --- | --- |
| `globalContext` | `currentUser`, `setCurrentUser` | Wrapped in `RootLayout` |
| `courseModulesContext` | All state for the in-course player | Wrapped in `CourseModules` |
| `courseCreatorContext` | Form state for the "Create course" wizard | Wrapped in `app/courses/create/page.tsx` |

Don't add a 4th context casually. If you find yourself prop-drilling more than 3 levels, consider whether the data belongs in URL search params or in a colocated component.

## Loading and error UI

- Use Next's `loading.tsx` / `error.tsx` conventions per route segment.
- For client mutations, render a `<CircularProgress />` overlay on the button itself (disabled during submit). Don't block the whole page.
- 404s on org-restricted resources should look identical to genuine 404s; never expose "exists but forbidden."

## Accessibility

- Every interactive non-button (clickable `Typography`) must get `role="button"` and `tabIndex={0}` + keyboard handler. Prefer real `Button` elements; the LUCID logo click in `NavBar.tsx` is the only exception.
- All form fields require `<InputLabel>` or `label` prop. No placeholder-as-label.
- Color contrast minimum WCAG AA against the dark background.

## What NOT to do

- ❌ Don't import from `requests/` — that folder is deprecated (REST client). Use `lib/rpc/client.ts`.
- ❌ Don't hardcode `http://localhost:3000` anywhere. Calls go to relative URLs.
- ❌ Don't use `getCookies` from `next/headers` in client components — it's server-only.
- ❌ Don't ship `console.log` in PR-ready code.
- ❌ Don't introduce a global state library (Redux/Zustand/Jotai). React context + URL state is enough for the foreseeable scope.
- ❌ Don't add CSS-in-JS libraries beyond what MUI ships. No styled-components, no tailwind (yet).
