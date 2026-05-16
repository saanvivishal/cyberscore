# Changelog

All notable changes to CyberScore will be documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] — 2026-05-16

Quality + cost-control release. The chat advisor now runs without an Anthropic budget, and the highest-leverage known issues from v0.1.0 are fixed.

### Added
- **Local rule-based AI advisor** (`apps/api/src/lib/advisor-local.ts`) — same SSE wire format as the Anthropic path, with sector knowledge primers for all 8 industries (Banking, Healthcare, Technology, Manufacturing, Retail, Education, Government, Other). Gated by `USE_LOCAL_ADVISOR=true` (default).
- **RLS migration** (`migrations/20260516123100_rls_policies/`) — enables FORCE row-level security on 19 tenant-scoped tables with bypass support for system / login / registration flows
- **Response → ScoringTier relation** in the schema (migration `20260516123040_add_response_matched_tier_relation`) — unlocks the admin team scorecard's tier-distribution view
- **Per-user chat rate limit** — 20 messages per minute via Redis sliding window
- **`title` getter on `ApiError`** — fixes the 4 pre-existing TS errors in mobile UI files

### Changed
- Chat empty-state suggestions retuned to questions the local advisor handles confidently
- `known-issues.md`, `deployment.md`, `HANDOVER_CHECKLIST.md` reframed to reflect what's done vs what's still pending
- The deployment guide is now explicitly labelled as a planning document, not a runbook for an existing deployment

### Fixed
- `Property 'title' does not exist on type 'ApiError'` in `team.tsx`, `invite.tsx`, `register.tsx`, `reset-password.tsx`
- `Property 'matchedTier' does not exist on type ResponseSelect` in `admin/scorecard/route.ts`
- Chat endpoint hit `400 invalid_request_error` when the Anthropic account had zero balance (now bypassed by default via the local advisor)
- Migration `20260516123040_add_response_matched_tier_relation` includes a data-cleanup step (NULL out orphaned `matchedTierId` rows from prior reseeds) before adding the FK

## [0.1.0] — 2026-05-16

Initial documented release. Covers everything that exists in the repo as of handover.

### Mobile

- Expo SDK 52 / RN 0.76.9 monorepo workspace at `apps/mobile`
- Expo Router v4 with `(auth)` and `(app)` route groups
- AuthGate in root layout: hydrates from SecureStore, redirects between groups based on session status
- Auth screens: onboarding, login (with TOTP), register (Solo / Enterprise admin / Enterprise employee modes), verify-otp, forgot, reset-password, accept-invite
- Dashboard with overall score ring, per-level tiles (People / Process / Company), countdown timer, resume-assessment CTA
- Assessment level picker filtered by user's `allowedLevels`
- Per-KPI question screen with progress save
- Analytics screen with category comparison, snapshot timeline, and personalised suggestions
- AI chat screen with multi-thread support, streaming responses, suggested prompts, thread drawer
- Scorecard breakdown screen
- Profile screen with framework picker (admin only) + TOTP setup
- Team management screen for ENTERPRISE admins (invite with pre-assigned levels, edit member levels, revoke members)
- Glassmorphism design system: BlurView cards, white-opacity borders, brand blue (#3b82f6) primary
- Dev-mode helpers: amber OTP autofill banner on verify-otp and reset-password screens

### API

- Next.js 15.1 monolith at `apps/api` with App Router
- 46 REST routes across auth, kpis, scorecard, evidence, share, notifications, team, admin, ai
- Streaming AI chat endpoint with prompt caching (`cache_control: ephemeral` on the system block containing the scorecard JSON)
- BullMQ workers: email, snapshot, push, abandonment — plus a scheduler
- Auth: JWT (15min) + opaque refresh tokens (7d, bcrypt-hashed), Argon2id passwords, HIBP breach check on register, TOTP 2FA with AES-GCM-encrypted secrets
- Three registration modes (SOLO, ENTERPRISE_ADMIN, ENTERPRISE_EMPLOYEE) with email-domain keying
- Email-based invites with token bcrypt-hashed at rest, carries pre-assigned `allowedLevels`
- Per-user assessment access via `User.allowedLevels Level[]` + `effectiveAllowedLevels()` helper (admins effectively have all)
- Anthropic SDK integration with daily budget tracking + automatic Sonnet → Haiku fallback
- Audit log: append-only, captures actor / IP / user-agent / before-after for every security-relevant action
- Rate limiting via Redis sliding window
- RFC 7807 Problem Details for all error responses
- Structured logging via Pino, Sentry wired via `instrumentation.ts`
- Dev-only CORS middleware reflecting Origin for Expo dev server LAN IP flexibility

### Database

- 24-table Postgres 16 schema managed by Prisma 6.19
- Row-Level Security expected (policies need to be applied separately — see [docs/known-issues.md](docs/known-issues.md))
- 5 migrations:
  - `20260423115340_init` — initial 21-table schema
  - `20260429000000_enterprise_mode` — added `OrgMode`, `JoinMode`, `AnswerScope`, invites, enterprise fields on organisations
  - `20260429000001_per_user_progress` — moved `assessment_progress` from org-keyed to (org, user)-keyed
  - `20260506080246_add_allowed_levels` — added `User.allowedLevels` + `Invite.allowedLevels`
  - `20260516074342_add_chat_threads` — added `chat_threads` + `chat_messages`
- Seed: 46 KPIs / 212 tiers / 92 suggestions, extracted from `SCORE CARD_KPI_CYBER SEC_PPT_V0.9.xlsx` via `prisma/seed/extract-kpis.py`

### Shared packages

- `@cyberscore/types` — Zod schemas + TS types for auth, kpi, scorecard, ai, team, errors
- `@cyberscore/sdk` — `CyberScoreClient` with transparent 401 refresh, abortable fetch, typed error mapping

### Infrastructure

- npm workspaces + Turbo for cacheable task graph
- Strict TypeScript everywhere (`noUnusedLocals`, `noUncheckedIndexedAccess`, etc.)
- Prettier + ESLint configured per workspace

### Known gaps shipped in 0.1.0

See [docs/known-issues.md](docs/known-issues.md) for the full list. Headlines:
- No RLS policies committed to migrations
- No test suite
- No CI/CD
- 4 pre-existing TS errors (`ApiError.title` references) + 1 in `admin/scorecard/route.ts` (`matchedTier` typo)
- SMTP / R2 / Sentry / Expo push tokens default to placeholders in `.env.example`
- Mobile bridgeless / new architecture is **off** (`newArchEnabled: false` in `app.json`)
