# Web Structure Guide

This guide defines a stable and scalable structure for `apps/web`.

## Tooling (single source of truth)

- **Import boundaries** for `apps/web`: edit `apps/web/.eslintrc.cjs` (`restrictedPatternsBase` + `overrides` for `features/index` and `features/admin`).
- **Verify locally**: `npm run lint --workspace web` and `npm run build --workspace web`.

## Core Principles

- Keep imports explicit and domain-based.
- Separate app shell, page layout, brand assets, and feature logic.
- Keep route constants in one place.
- Prefer feature folders for business logic; keep shared UI generic.

## Folder Layout

```text
apps/web/src/
  app/                       # Next.js App Router entry points
  components/
    shell/index.ts           # Barrel: AppProviders, AppChrome, …
    layout/index.ts          # Barrel: Footer, Navbar, …
    brand/index.ts           # Barrel: BrandLogo, icons, …
    navigation/index.ts      # Barrel: LocaleLink
    ui/                      # Generic primitives (import files directly)
  config/                    # Centralized app configuration (e.g. APP_ROUTES)
  features/                  # Feature-first modules (see public barrels below)
  hooks/                     # Shared reusable hooks
  lib/
    api/                     # HTTP clients + DTO-ish types (auth, quiz, admin, …)
    auth.ts                  # Client-side auth/session helpers
    i18n-routing.ts          # Locale path helpers
    utils.ts                  # Small shared utilities (e.g. cn)
    …                        # Other app-level helpers (no barrel required)
  screens/index.ts           # Barrel: all route-level screen components
  screens/*.tsx              # One file per major route / screen
```

## Component Import Rules

Use **barrel entrypoints** (each folder has an `index.ts`):

- `@/components/shell` — `AppProviders`, `AppChrome`, `SetDocumentLang`, `RequireAuthClient`
- `@/components/layout` — `Footer`, `Navbar`, `AuthSplitLayout`, `LanguageDropdown`, `FloatingContactButton`
- `@/components/brand` — `BrandLogo`, `BRAND_LOGO_IMAGE_SRC`, and all icons from `BrandIcons`
- `@/components/navigation` — `LocaleLink` (+ `LocaleLinkProps` type)
- `@/components/ui/*` — keep direct file imports for primitives (no barrel)

**Inside** `components/layout/`, import sibling files with **relative** paths (`./Footer`, `./Navbar`) to avoid circular re-exports through the barrel.

Do not use:

- Legacy flat imports (`@/components/Footer`, `@/components/BrandLogo`, …)
- Deep imports (`@/components/layout/Footer`, `@/components/shell/AppChrome`, …)

ESLint enforces this to prevent structure drift: `@/features/profile/*`, `@/features/quiz-take/*`, `@/features/index/*`, and `@/features/admin/*` are blocked **outside** `src/features/index/` and `src/features/admin/` (see `overrides` in `.eslintrc.cjs`).

## App Router vs screens

- `app/**/page.tsx` stays thin and server-first: metadata + render one screen from `@/screens`.
- Import screens only from the barrel: `import { Profile } from '@/screens'`.
- Put `'use client'` on `screens/*.tsx` (not on every `app/**/page.tsx`) when the screen uses hooks/browser APIs.
- When you add a new top-level screen file under `screens/`, export it from `screens/index.ts` and wire a matching `app/.../page.tsx`.
- Avoid naming a screen file `Index.tsx` next to `screens/index.ts` on case-insensitive filesystems (macOS default); the home screen is `Home.tsx` exporting `Home`.

## Routing Config Rules

- Use `APP_ROUTES` from `@/config/routes` only.

## Feature public barrels (stable imports)

Prefer importing from the feature root when an `index.ts` exists:

- `@/features/index` — home data hooks, selectors, constants, quiz-type helpers
- `@/features/admin` — full public surface for the admin feature (constants, hooks, sections, helpers — see `features/admin/index.ts`)
- `@/features/profile` — profile helpers, UI helpers, `ProfileQuizHistory`
- `@/features/quiz-take` — `quizTake.helpers` + `quizTake.ui.helpers`

Inside `src/features/admin/` you may keep deep `@/features/admin/...` imports between modules. **Outside** that folder, import admin only from `@/features/admin` (ESLint enforces this).

## Feature Structure Recommendation

Inside `src/features/<feature-name>/`, group by responsibility:

- `api/` for API calls
- `hooks/` for feature hooks
- `components/` for feature-specific UI
- `<feature>.selectors.ts` for derived state
- `<feature>.helpers.ts` for pure logic helpers
- `index.ts` when the feature has a clear public API for screens or other features

Keep cross-feature shared logic in `src/lib` or `src/hooks`.

## `lib/` conventions

- **`lib/api/*`**: one module per remote domain (`auth`, `quiz`, `materials`, `admin`, `upload`, `client`, `types`). Import explicitly, e.g. `@/lib/api/auth` — **no** `lib/api` barrel (keeps bundles and deps obvious).
- **`lib/*.ts`**: cross-cutting helpers used by many layers; add a file when the concern is not feature-specific.

## Large Screen Split Playbook

When a screen grows too large (for example `Admin`, `QuizTake`, `Profile`), split safely in this order:

1. Move pure logic to `features/<feature>/...helpers.ts` or `...selectors.ts`.
2. Move data orchestration to `features/<feature>/hooks/`.
3. Move repeated UI blocks to `features/<feature>/components/`.
4. Export reusable parts through `features/<feature>/index.ts`.
5. Keep `screens/<Screen>.tsx` as composition only (layout + glue code).

Target: each extracted file has one responsibility and can be tested/reviewed independently.

## Merge checklist (quick)

- [ ] New route screen: add `screens/<Name>.tsx` + export in `screens/index.ts` + thin `app/.../page.tsx`.
- [ ] New shared UI in the right barrel (`layout` / `brand` / `shell` / `navigation`) or `ui/*` as appropriate.
- [ ] `APP_ROUTES` only from `@/config/routes`.
- [ ] API calls: import from `@/lib/api/<domain>` (no `lib/api` barrel).
- [ ] Feature exports: extend `features/<name>/index.ts` when exposing cross-folder API.
- [ ] `npm run lint --workspace web` and `npm run build --workspace web`.

## Definition of Done (Structure)

A change is considered structure-clean when:

- New code follows the folders above.
- Imports use domain paths, not old flat aliases.
- Route-level UI is imported from `@/screens` (barrel), not `@/screens/SomeScreen`.
- Route constants come from `@/config/routes` (no duplicate route modules).
- `npm run lint --workspace web` passes.
- `npm run build --workspace web` passes.
