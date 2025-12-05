# Copilot Instructions for AME Exam Trainer

This file gives focused, actionable guidance for AI coding agents working in this repository.

Project snapshot: Next.js 16 (App Router) + TypeScript + Tailwind v4; Supabase for auth/data; UI built with shadcn/ui.

Big picture:
- The app lives under `app/` (Next.js App Router). Pages and route groups map directly to folders there.
- Data/DB access is done server-side via Server Actions and Supabase. See `lib/db-actions.ts` and `lib/supabase/server.ts`.
- Client-side Supabase usage uses the singleton in `lib/supabase/client.ts`.
- Route protection is handled by `middleware.ts` which creates an SSR Supabase client and redirects unauthorized users.

Typical developer flows (copyable):
- Install: `pnpm install` (project has `pnpm-lock.yaml`).
- Dev server: `pnpm dev` (runs `next dev`).
- Build: `pnpm build` and `pnpm start` for production.
- Lint: `pnpm lint` (runs `eslint .`).

Environment & infra notes:
- Required env vars: `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Database schema and seeds live in `scripts/` (`001_create_tables.sql`, `002_seed_topics.sql`, etc.). Apply via Supabase CLI or psql against the DB.
- Deployment: app is designed for Vercel (see `README.md`).

Key Architecture Rules (MUST follow)

When generating code for this repository, Copilot MUST respect these conventions exactly. They are enforced architectural and security rules.

1) UI contains NO business logic
- UI components in `components/` and pages in `app/` must only be presentational and handle UI interactions. Business logic, domain logic and data orchestration belong in `features/*` or `lib/` server actions.

2) Supabase SSR client only in server actions / server utilities
- Do NOT call Supabase directly from client components.
- Use these clients only:
  - Browser: `import { supabaseBrowserClient } from "@/lib/supabase/client";`
  - Server: `import { createSupabaseServerClient } from "@/lib/supabase/server";`
  - Middleware: use `createServerClient` from `@supabase/ssr` as shown in `middleware.ts`.

3) `features/auth` required contract
- Required files/exports: `auth.api.ts`, `auth.validation.ts`, `AuthForm.tsx`, hooks `useLogin`, `useRegister`, `useLogout`, `UserProvider.tsx` (session + profile + role), and role utilities. Keep auth flows centralized here.

4) `features/profile` responsibilities
- Must include `updateProfile` (server action), avatar upload helper, Zod-based `profile.validation.ts`, and server actions for profile mutations.

5) Feature module pattern (questions, topics, exams, etc.)
- Each module must contain: `api.ts` (server actions), `validation.ts` (Zod), `types.ts`, `components/`, and `hooks/` for client helpers.

6) No duplicated logic — DRY
- Reuse shared helpers in `lib/` and shared validation/types. Factor repeated code into helper modules.

7) Clean code rules
- Favor pure functions, single responsibility, consistent naming. Use `try/catch` with clear error messages in server actions.

8) Preserve v0.dev UI
- Do NOT modify layouts, Tailwind classes, color tokens, or structure produced by v0.dev. Any UI change requires explicit approval.

Supabase integration conventions
- Use the repo-supplied clients (do not create new Supabase instances).
- Server actions should use `"use server"`, `createSupabaseServerClient()` and follow this pattern:

```ts
"use server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function createQuestion(payload) {
  const supabase = await createSupabaseServerClient()
  try {
    // validate with Zod, insert, return result
  } catch (err) {
    throw new Error("Failed to create question: " + String(err))
  }
}
```

Roles and helpers
- System roles: only `user`, `admin`, `super_admin`.
- Use helper guards in server actions and middleware, e.g., `requireUser()`, `requireAdmin()`, `requireSuperAdmin()` (implement these in `lib/` if not present) to enforce role restrictions.

Database & RLS expectations
- The codebase assumes the schema in `scripts/` and these tables/relations exist: `profiles` (references `auth.users.id`), `topics`, `questions`, `answers`, `comments`, `votes`, `reports`, `exams`, `exam_history`, `notifications`, `announcements`, `collections`, `badges`, `weekly_challenges`, `question_attempts`, `question_views`.
- RLS rules to respect in server behavior:
  - `profiles`: anyone can read; only owner can update; only `super_admin` can change roles.
  - `questions`: anyone can read; only authenticated users can create; only `admin`/`super_admin` can edit/delete; reports mark items for moderation; duplicates should be flagged as `pending_review`.

Questions & exams rules
- Questions must have 4 answers and exactly 1 correct option. Validate with Zod and set `status = "pending_review"` on create.
- Duplicate detection should be attempted before insert (use simple text similarity or a dedicated duplicate-check Server Action).
- Exams are per-user, must persist to `exam_history`, calculate scores and topic-level performance for recommendations.

Community features
- Implement comments, votes, reports, collections, notifications, badges, and announcements via feature folders and server actions.

What Copilot must produce
- Respect existing UI and do NOT alter v0.dev generated layout or styles.
- Produce clean, modular, feature-based code using Zod validations and server actions.
- Use the correct Supabase client depending on environment.
- Maintain role checks and RLS compatibility.
- Handle errors clearly; avoid leaking secrets.
- Ask clarifying questions when behavior is ambiguous before generating large code changes.

Next steps
- I can add a `.github/PULL_REQUEST_TEMPLATE.md` with a checklist (env vars, migrations, middleware/role changes, UI-preservation). Reply with "add PR template" if you'd like that.
# Copilot Instructions for AME Exam Trainer

This file gives focused, actionable guidance for AI coding agents working in this repository.

Project snapshot: Next.js 16 (App Router) + TypeScript + Tailwind v4; Supabase for auth/data; UI built with shadcn/ui.

Big picture:
- The app lives under `app/` (Next.js App Router). Pages and route groups map directly to folders there.
- Data/DB access is done server-side via Server Actions and Supabase. See `lib/db-actions.ts` and `lib/supabase/server.ts`.
- Client-side Supabase usage uses the singleton in `lib/supabase/client.ts`.
- Route protection is handled by `middleware.ts` which creates an SSR Supabase client and redirects unauthorized users.
---

## Project snapshot

Next.js 16 (App Router) + TypeScript + Tailwind v4; Supabase for auth/data; UI built with shadcn/ui.

## Big picture

- The app lives under `app/` (Next.js App Router). Pages and route groups map directly to folders there.
- Data/DB access is done server-side via Server Actions and Supabase. See `lib/db-actions.ts` and `lib/supabase/server.ts`.
- Client-side Supabase usage uses the singleton in `lib/supabase/client.ts`.
- Route protection is handled by `middleware.ts` which creates an SSR Supabase client and redirects unauthorized users.

## Typical developer flows (copyable):

- Install: `pnpm install` (project has `pnpm-lock.yaml`).
- Dev server: `pnpm dev` (runs `next dev`).
- Build: `pnpm build` and `pnpm start` for production.
- Lint: `pnpm lint` (runs `eslint .`).

## Environment & infra notes:

- Required env vars: `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Database schema and seeds live in `scripts/` (`001_create_tables.sql`, `002_seed_topics.sql`, etc.). Apply via Supabase CLI or psql against the DB.
- Deployment: app is designed for Vercel (see `README.md`).

## Project-specific patterns to follow:

- Server Actions: database mutations live in server code with the directive `"use server"`. Example: `lib/db-actions.ts`.
- Supabase SSR: prefer `createServerClient` from `@supabase/ssr` when handling requests in middleware or server functions. Example: `middleware.ts`, `lib/supabase/server.ts`.
- Client vs Server: components that access DB/state server-side do so through Server Actions; client-only UI uses `use client` at the top of the file.
- Route protection: `middleware.ts` lists protected paths (modify `PROTECTED_PATHS`, `ADMIN_PATHS`, `SUPER_PATHS` to change behavior).

## Conventions and code patterns to preserve:

- Feature folders: `features/*` contain domain-specific logic and pages — prefer adding new functionality there rather than adding mixed logic in `components/`.
- Reusable primitives live in `components/ui/` (shadcn/ui style). Keep presentational code there; put data orchestration in `lib/` or `features/`.
- Keep server-side data access inside `lib/db-actions.ts` or the `lib/supabase/*` helpers to centralize auth and cookies handling.

## Integration touchpoints for code changes:

- Authentication flows: `app/auth/*`, `lib/supabase/*`, and `middleware.ts` must stay consistent when adding protected routes or role checks.
- New DB tables: update SQL in `scripts/`, update `lib/types.ts`, and add Server Actions in `lib/db-actions.ts`.
- Client state/UX: update `components/` and `app/*` pages; keep server calls in Server Actions (no direct client DB secrets).

## Quick search patterns for contributors:

- Find server actions: search for `"use server"`.
- Find Supabase server client usage: search for `createServerClient` or `@supabase/ssr`.
- Find protected routes: open `middleware.ts` and `app/` route folders.

## When editing or adding features, be explicit in PRs about:

- Which env variables are required or new.
- Any new SQL migrations (add to `scripts/` with sequential numbering).
- Which routes are affected (update `middleware.ts` if protection changes).

If any of these sections are unclear or you'd like additional examples (e.g., a PR template or recommended test scaffold), tell me which area to expand.
# Copilot Instructions for AME Exam Trainer

This file gives focused, actionable guidance for AI coding agents working in this repository.

- Project snapshot: Next.js 16 (App Router) + TypeScript + Tailwind v4; Supabase for auth/data; UI built with shadcn/ui.

- Big picture:
  - The app lives under `app/` (Next.js App Router). Pages and route groups map directly to folders there.
  - Data/DB access is done server-side via Server Actions and Supabase. See `lib/db-actions.ts` and `lib/supabase/server.ts`.
  - Client-side Supabase usage uses the singleton in `lib/supabase/client.ts`.
  - Route protection is handled by `middleware.ts` which creates an SSR Supabase client and redirects unauthorized users.

- Typical developer flows (copyable):
  - Install: `pnpm install` (project has `pnpm-lock.yaml`).
  - Dev server: `pnpm dev` (runs `next dev`).
  - Build: `pnpm build` and `pnpm start` for production.
  - Lint: `pnpm lint` (runs `eslint .`).

- Environment & infra notes:
  - Required env vars: `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
  - Database schema and seeds live in `scripts/` (`001_create_tables.sql`, `002_seed_topics.sql`, etc.). Apply via Supabase CLI or psql against the DB.
  - Deployment: app is designed for Vercel (see `README.md`).

- Project-specific patterns to follow:
  - Server Actions: database mutations live in server code with the directive `"use server"`. Example: `lib/db-actions.ts`.
  - Supabase SSR: prefer `createServerClient` from `@supabase/ssr` when handling requests in middleware or server functions. Example: `middleware.ts`, `lib/supabase/server.ts`.
  - Client vs Server: components that access DB/state server-side do so through Server Actions; client-only UI uses `use client` at the top of the file.
  - Route protection: `middleware.ts` lists protected paths (modify `PROTECTED_PATHS`, `ADMIN_PATHS`, `SUPER_PATHS` to change behavior).

- Conventions and code patterns to preserve:
  - Feature folders: `features/*` contain domain-specific logic and pages — prefer adding new functionality there rather than adding mixed logic in `components/`.
  - Reusable primitives live in `components/ui/` (shadcn/ui style). Keep presentational code there; put data orchestration in `lib/` or `features/`.
  - Keep server-side data access inside `lib/db-actions.ts` or the `lib/supabase/*` helpers to centralize auth and cookies handling.

- Integration touchpoints for code changes:
  - Authentication flows: `app/auth/*`, `lib/supabase/*`, and `middleware.ts` must stay consistent when adding protected routes or role checks.
  - New DB tables: update SQL in `scripts/`, update `lib/types.ts`, and add Server Actions in `lib/db-actions.ts`.
  - Client state/UX: update `components/` and `app/*` pages; keep server calls in Server Actions (no direct client DB secrets).

- Quick search patterns for contributors:
  - Find server actions: search for `"use server"`.
  - Find Supabase server client usage: search for `createServerClient` or `@supabase/ssr`.
  - Find protected routes: open `middleware.ts` and `app/` route folders.

- When editing or adding features, be explicit in PRs about:
  - Which env variables are required or new.
  - Any new SQL migrations (add to `scripts/` with sequential numbering).
  - Which routes are affected (update `middleware.ts` if protection changes).

If any of these sections are unclear or you'd like additional examples (e.g., a PR template or recommended test scaffold), tell me which area to expand.
