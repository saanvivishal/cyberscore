# Known Issues & Limitations

A frank inventory of what doesn't work, what's incomplete, and what the next person should expect to run into.

## A. Bugs you'll trip over

### A1. Pre-existing TypeScript errors (3 mobile + 1 API + 1 in `reset-password.tsx`)

`npm run typecheck` from the repo root surfaces these. None block the build (Next.js / Metro both ignore TS errors at runtime), but they should be fixed before any production deploy.

| File | Line | Error | Why |
|---|---|---|---|
| `apps/mobile/app/(app)/team.tsx` | 625 | `Property 'title' does not exist on type 'ApiError'` | `ApiError` has `problem.title`, not `title` |
| `apps/mobile/app/(auth)/invite.tsx` | 388 | same | same |
| `apps/mobile/app/(auth)/register.tsx` | 507 | same | same |
| `apps/mobile/app/(auth)/reset-password.tsx` | 83 | same | same |
| `apps/api/src/app/api/v1/admin/scorecard/route.ts` | 54, 101 | `Property 'matchedTier' does not exist on type ResponseSelect` | The Response model has `matchedTierId` (FK), not a `matchedTier` relation |

**Fix sketch (mobile):** Replace `err.title` with `err.problem?.title ?? 'Request failed'` in all four files.

**Fix sketch (admin/scorecard):** Define a relation on `Response.matchedTierId` → `ScoringTier`, regenerate Prisma client, then `r.matchedTier?.tierLabel` works. Until then, the admin team scorecard endpoint will runtime-error if anyone calls it.

### A2. Anthropic billing dependency

The chat and `/ai/compare` endpoints both fail with a 400 from Anthropic if your API account has $0 credit:

```
Your credit balance is too low to access the Anthropic API.
Please go to Plans & Billing to upgrade or purchase credits.
```

This isn't a CyberScore bug — top up at https://console.anthropic.com/settings/billing. The error message in the mobile UI shows the raw Anthropic JSON; a polish task is to map common Anthropic errors to friendlier text.

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

### B1. RLS policies aren't in migrations

The schema *expects* RLS to be applied (the `withTenant(orgId, fn)` helper sets `app.current_org_id` for every transaction), but there's no `rls.sql` checked into `apps/api/prisma/migrations/`. In local dev this is invisible because no RLS = "permit all" — but **deploying to production without applying RLS policies leaves every org's data readable by every authenticated user via direct DB queries**.

**To fix:** write RLS policies for every tenant-scoped table:

```sql
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON responses
  USING (org_id = current_setting('app.current_org_id', true)::text);
```

Repeat for: `organisations`, `users`, `refresh_tokens`, `responses`, `scorecard_snapshots`, `evidence_attachments`, `assessment_progress`, `notifications`, `push_tokens`, `share_tokens`, `ai_usage`, `audit_logs`, `subscriptions`, `api_keys`, `webhooks`, `invites`, `chat_threads`, `chat_messages`.

The `users` table needs a slightly different policy because some auth flows (login, password reset) need to look up users by email *before* the tenant context is set — use `withBypassRls()` for those.

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

### C1. No rate limiting on the chat streaming endpoint

`/ai/chat/threads/[id]/messages` (POST) is auth-gated but not per-IP or per-org rate-limited. A user could spam the chat and burn through the daily Anthropic budget for their org. The daily call cap (`AI_FREE_DAILY_CALLS`) catches this eventually but per-minute would be friendlier.

### C2. Snapshot worker doesn't write per-user snapshots

ENTERPRISE non-admins see a personal scorecard (their own responses, only their allowed levels) computed live on every `/scorecard` call. There's no per-user snapshot history — analytics trends are org-level only. Fine for the current scope; revisit if you want per-employee trend lines.

### C3. The KPI cache doesn't honour per-user filtering

`/api/v1/kpis` caches the global list in Redis and filters per-request after read. Correct but wasteful — every request still pays the filter cost. For high-traffic orgs, cache per `(level, framework, levelsKey)` where `levelsKey` is a stable serialization of the user's allowed levels.

### C4. No transaction around enqueueSnapshot + response upsert

The KPI submit endpoint writes the response inside `withTenant`, then enqueues the snapshot job *outside* the transaction. If the transaction commits but the Redis enqueue fails, the response is saved but the snapshot is stale. Mitigated by the scheduled snapshot sweep which will catch up within an hour.

### C5. No `kpi:NA` audit action

`/kpis/na` writes to `responses` with `isNa: true` but doesn't emit an audit log entry. The action is in `AuditActions` but the route doesn't call `audit()`. Minor.

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

## F. Test account

For the supervisor's review, after running `npm run db:seed`:

| | |
|---|---|
| Email | `saanvi.vishal@iiitb.ac.in` |
| Password | reset via the in-app **Forgot?** flow — dev mode shows the OTP inline on the next screen |

This account is a SOLO admin in the Technology industry, with the EXCEL framework selected. Some KPIs may already be answered from prior testing — feel free to add more.
