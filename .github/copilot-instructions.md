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

- If any of these sections are unclear or you'd like additional examples (e.g., a PR template or recommended test scaffold), tell me which area to expand.
