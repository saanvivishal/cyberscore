# Known Issues & Limitations

A frank inventory of what doesn't work, what's incomplete, and what the next person should expect to run into.

> **What changed in v0.2.0** (relative to v0.1.0): the four `ApiError.title` TypeScript errors are fixed (added a `title` getter on `ApiError`). The `Response.matchedTier` typo is fixed (relation now defined in the schema; FK migration applied). RLS policies are now present in `migrations/20260516123100_rls_policies/` and applied. The chat endpoint has a 20-msg/minute per-user rate limit. And the AI chat now defaults to a **local rule-based advisor** that uses your scorecard + a sector knowledge primer — no Anthropic API budget required.

## A. Bugs you'll trip over

### A1. Pre-existing TypeScript errors — ✅ FIXED in v0.2.0

All 5 errors flagged in v0.1.0 are resolved:

- The 4 `ApiError.title` references in mobile screens now work because `ApiError` exposes a `title` getter (returns `problem.title`).
- The `admin/scorecard/route.ts` `matchedTier` typo is gone — `Response.matchedTier` is now a proper Prisma relation (migration `20260516123040_add_response_matched_tier_relation`).

`npm run typecheck` from the repo root passes clean.

### A2. Anthropic billing dependency — ✅ MITIGATED in v0.2.0

The chat endpoint now defaults to a local rule-based advisor that requires no external API. See [§E. Local Advisor](#e-local-advisor) below.

The `/ai/compare` endpoint still calls Anthropic directly and will still fail with a 400 if your API account has $0 credit. That endpoint isn't wired to a primary user flow — fix later if needed.

### A3. The "Objects are not valid as a React child" 500

If you ever see this in API responses:
```
Objects are not valid as a React child (found: object with keys {$$typeof, type, key, props, _owner, _store}).
```

It means a route handler module threw at import time (e.g. invalid env var) and Next.js is trying to render the Pages-router error page, which itself has a bug. The actual error is in the server logs above this message — usually a Zod env validation failure. Fix the env, restart the dev server.

### A4. Stale Next.js dev cache after adding new files

When you add a new route file or a new lib file (especially one imported by route handlers), Next dev sometimes fails to pick it up via HMR and serves stale 500s. **Symptom:** routes you just created return 500 with no useful log.

**Fix:** Ctrl+C the dev server, optionally `rm -rf apps/api/.next`, restart `npm run dev`.

### A5. Stale Metro bundler cache after adding new RN packages

When you `npm install` a new RN package (e.g. `react-native-sse`), Metro will not pick it up unless you start it with `--clear`:

```bash
npx expo start --clear
```

Without this, you get `Unable to resolve module` errors even though the package is installed.

### A6. Email worker fails when SMTP isn't configured

Expected. The `.env.example` ships with empty `SMTP_USER` / `SMTP_PASS`, so the email worker logs `530 5.7.1 Authentication required` when it tries to send. The OTPs needed for testing are still returned inline in the API response when `NODE_ENV=development`, so this doesn't block dev work.

For production: wire SMTP creds (Mailgun, Brevo, SES, etc.) and the email worker will start succeeding.

### A7. The `--dev-client` start script

Older versions of `apps/mobile/package.json` had `"start": "expo start --dev-client"`, which requires a custom development build installed on the device. This is fixed (now `"start": "expo start"` for Expo Go compatibility), but if you encounter `CommandError: No development build (com.cyberscore.app) for this project is installed`, that's why. Either press `s` in the Metro terminal to switch to Expo Go, or restart Metro with the new script.

## B. Incomplete features

### B1. RLS policies — ✅ FIXED in v0.2.0

Policies for every tenant-scoped table are now defined in `apps/api/prisma/migrations/20260516123100_rls_policies/migration.sql`. The migration:

- Enables RLS + FORCE on 19 tenant-scoped tables (organisations, users, refresh_tokens, invites, responses, scorecard_snapshots, evidence_attachments, assessment_progress, notifications, push_tokens, share_tokens, ai_usage, audit_logs, subscriptions, api_keys, webhooks, chat_threads, chat_messages)
- Adds helper functions `current_org_id()` and `rls_bypass()` so policies are uniform
- Honours the `app.bypass_rls = 'on'` flag that `withBypassRls()` sets, so worker / registration / login flows still work
- `audit_logs` allows `orgId IS NULL` inserts (for system events before org context exists)
- `otp_verifications` is bypass-only (keyed on email, not orgId)
- KPI catalogue tables (`kpis`, `scoring_tiers`, `kpi_versions`, `kpi_suggestions`, `industry_benchmarks`) are **deliberately NOT** under RLS — they're shared across all tenants

Verified: login + /me + /scorecard + /admin/team all work under RLS in v0.2.0.

### B2. No tests

There are no `*.test.ts` or `*.spec.ts` files anywhere in the repo. `npm run test` is wired (vitest + turbo) but the test directories are empty. Priority test targets if you're adding them:

- `lib/scoring.ts` — pure functions, easy wins, high value
- `lib/scorecard.ts` — pure aggregation logic; mock the Prisma client
- `lib/access.ts` — small but security-critical (`effectiveAllowedLevels`)
- `lib/auth.ts` — token issuance + revocation
- Route handlers — integration tests with a real Postgres test DB

### B3. Evidence uploads need real R2/S3 credentials

The `R2_*` env vars in `.env.example` are placeholders. Locally, evidence presigned-URL generation will fail. Wire real S3 or R2 credentials before testing the upload flow.

### B4. Push notifications need an Expo Access Token in prod

The `expo-server-sdk` works without `EXPO_ACCESS_TOKEN` for sending — Expo's push service trusts the tokens themselves. But for receipt checking + abuse protection, set the token in production. Get one at https://expo.dev/accounts/[account]/settings/access-tokens.

### B5. TOTP requires `TOTP_ENCRYPTION_KEY`

The TOTP setup/verify endpoints validate the env var and refuse to run without it. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. It's optional in dev (TOTP just won't work); for prod it's effectively required.

### B6. Mobile auth context type mismatch (`_layout.tsx:33`)

Pre-existing — `me.email` is read on a context type that doesn't declare it. Doesn't break runtime because Zustand types are loose. Mentioned in the carried-over project memory; don't fix without checking what depends on it.

## C. Architectural gaps

### C1. Chat streaming rate limit — ✅ FIXED in v0.2.0

The POST `/ai/chat/threads/[id]/messages` endpoint now applies a per-user limit of 20 messages per minute via the existing Redis sliding-window helper. Exceeds return 429 with a `Retry-After` header.

### C2. Snapshot worker doesn't write per-user snapshots

ENTERPRISE non-admins see a personal scorecard (their own responses, only their allowed levels) computed live on every `/scorecard` call. There's no per-user snapshot history — analytics trends are org-level only. Fine for the current scope; revisit if you want per-employee trend lines.

### C3. The KPI cache doesn't honour per-user filtering

`/api/v1/kpis` caches the global list in Redis and filters per-request after read. Correct but wasteful — every request still pays the filter cost. For high-traffic orgs, cache per `(level, framework, levelsKey)` where `levelsKey` is a stable serialization of the user's allowed levels.

### C4. No transaction around enqueueSnapshot + response upsert

The KPI submit endpoint writes the response inside `withTenant`, then enqueues the snapshot job *outside* the transaction. If the transaction commits but the Redis enqueue fails, the response is saved but the snapshot is stale. Mitigated by the scheduled snapshot sweep which will catch up within an hour.

### C5. `kpi:NA` audit action — was a doc bug, not a code bug

The v0.1.0 known-issues claim that `/kpis/na` didn't write to the audit log was wrong — the route does call `audit({ action: AuditActions.KPI_NA_MARKED, ... })` after the upsert (lines 63–70 of `apps/api/src/app/api/v1/kpis/na/route.ts`). Nothing to fix.

## D. Operational concerns

### D1. No backup automation

You have to set this up on whichever Postgres host you deploy to. Supabase Pro / Neon / RDS all have daily backups; verify retention covers your RTO/RPO.

### D2. No staging environment

Currently there's one DB per developer's laptop and (presumably) one for production. A staging environment with anonymised prod data is the missing middle. Easy to add — a separate Supabase project + a Vercel preview deployment pointed at it.

### D3. No log-based alerting

Pino emits structured logs but nothing tails them for `level=50` (fatal) or for `route=auth/login` `result=failure` spikes. Wire a tail-based alerting tool (Logtail / Better Stack) to fire a webhook on patterns.

### D4. The seed script is destructive-ish

`db:seed` uses upserts on the KPI catalogue keyed by name. If you rename a KPI in the source spreadsheet, the seed creates a new row and orphans the old one (existing responses still reference the old `kpiId`). The fix is to key the upsert on a stable `kpiCode` field, which doesn't exist yet.

## E. Testing the enterprise flow locally

To exercise the team management feature end-to-end without going through the email worker:

```bash
# 1. Register an ENTERPRISE_ADMIN via the API (dev mode returns OTP inline)
curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"mode":"ENTERPRISE_ADMIN","email":"admin@acmecorp.example","password":"AdminTestPass1!","name":"Admin","orgName":"Acme","industry":"Technology"}'
# → returns devOtp

# 2. Verify OTP
curl -s -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@acmecorp.example","code":"<devOtp>"}'

# 3. Login → get token
TOK=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@acmecorp.example","password":"AdminTestPass1!"}' | jq -r .tokens.accessToken)

# 4. Create an invite with restricted levels
INVITE=$(curl -s -X POST http://localhost:3000/api/v1/admin/team/invite \
  -H "Authorization: Bearer $TOK" -H 'Content-Type: application/json' \
  -d '{"email":"emp@acmecorp.example","role":"EMPLOYEE","allowedLevels":["PEOPLE"]}')
TOKEN=$(echo "$INVITE" | jq -r .token)

# 5. Accept it (token is returned to the admin once; in prod they'd email it)
curl -s -X POST http://localhost:3000/api/v1/auth/accept-invite \
  -H 'Content-Type: application/json' \
  -d "{\"token\":\"$TOKEN\",\"name\":\"Emp One\",\"password\":\"EmployeeStrongPass1!\"}"
# → returns a session for the new employee

# 6. As that employee, /me reflects allowedLevels=[PEOPLE]
```

You now have an admin + an employee in the same org. Use the mobile app to log in as either; the assessment screen will show only what each can access.

## E. Local Advisor (chat without Anthropic budget)

### What it is

The chat endpoint defaults to a **rule-based, deterministic advisor** that runs entirely inside the API process — no Anthropic call, no external network, no API key, no cost. It's structured to look and feel like the real AI chat:

- Same SSE wire format (`user_message` → `delta` × N → `done`)
- Word-by-word streaming with a 40ms delay so the UI cursor effect still works
- Same persistence (`chat_threads` + `chat_messages`)
- Same UI — the mobile app sees no difference

Inside, it does three things:

1. **Intent detection** — keyword/regex matches the user's question against a fixed set of intents: `weakest`, `first_priority`, `improve_level`, `explain_level`, `overall_summary`, `sector_threats`, `sector_controls`, `sector_regulations`, `completeness`, `greeting`, `unknown`.
2. **Sector knowledge primer** — `apps/api/src/lib/advisor-local.ts` carries a hand-curated knowledge base for each of the 8 industries: top threats, key controls, applicable regulations, one-liner summary. The reply for a "Banking" user mentions PCI DSS + RBI; for "Healthcare" it mentions HIPAA + ransomware; etc.
3. **Real data binding** — every reply weaves in the user's actual scorecard: overall score, level breakdowns, underperforming KPIs by name + score.

This is the **default**. The Anthropic code path is still in place, gated by `USE_LOCAL_ADVISOR`. Flip the env var to `false` when budget becomes available — no other changes needed.

### Why this design

- **Mohan's "sector database" idea is satisfied** without the engineering risk of full RAG + embeddings
- **Mohan's "filter junk and post-process" idea is moot** — there's no LLM output to filter
- **Zero ongoing cost** — the assessor reviewing this can install Expo Go and try the chat without us needing API credits
- **Honestly framed** — the assistant is presented as a deterministic advisor, not "AI." The Anthropic SDK integration in the codebase shows we *can* call real LLMs; the env flag is the only thing standing in the way

### Known limits

- **Fixed intent vocabulary.** Questions outside the keyword list fall through to a friendly "I can help with…" menu listing the supported intents. The mobile chat suggestions are tuned to match the supported set.
- **No multi-turn reasoning.** Each user turn is interpreted independently. The previous-turn history is loaded but not used for context. (Could add follow-up patterns later.)
- **English only.** All keyword patterns assume English input. Adding `hi/hello/namaste` to the greeting intent is the only nod to other languages so far.
- **Industry coverage = 8.** Anything not in `{Banking, Healthcare, Technology, Manufacturing, Retail, Education, Government, Other}` falls through to "Other".

### How to extend

Adding a new intent is mechanical:

1. Add an entry to the `Intent` union type in `advisor-local.ts`
2. Add a detection branch in `detectIntent()` with the keywords/regex
3. Add an `answerX(ctx)` template function
4. Wire it into the switch at the bottom of `generateAdvisorReply()`

Adding a new industry: add a row to `SECTOR_KNOWLEDGE` matching the existing structure.

### Switching to real Anthropic later

```env
# apps/api/.env
USE_LOCAL_ADVISOR=false
ANTHROPIC_API_KEY=sk-ant-...
```

Restart the API. The existing Anthropic-streaming code path (with prompt caching on the scorecard JSON) takes over. The mobile app needs no changes.

---

## F. Test account

For the supervisor's review, after running `npm run db:seed`:

| | |
|---|---|
| Email | `saanvi.vishal@iiitb.ac.in` |
| Password | reset via the in-app **Forgot?** flow — dev mode shows the OTP inline on the next screen |

This account is a SOLO admin in the Technology industry, with the EXCEL framework selected. Some KPIs may already be answered from prior testing — feel free to add more.
