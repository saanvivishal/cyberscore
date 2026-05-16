# Deployment

How to take CyberScore from local dev to production. There are three things to deploy independently:

1. **API** (Next.js) — stateless, horizontally scalable
2. **Workers** (BullMQ consumers) — separate process, also stateless
3. **Mobile app** (Expo) — distributed via App Store / Play Store / EAS Update OTA

Plus three managed services:
- **Postgres 16+**
- **Redis** (any version BullMQ supports — 6+ works)
- **S3-compatible object storage** for evidence

## Recommended hosting

The stack is intentionally portable. Below is one validated combination; substitute equivalents at will.

| Component | Recommended | Alternatives |
|---|---|---|
| API | Vercel (Next.js native) | Fly.io, Render Web Service, AWS App Runner |
| Workers | Render Background Worker | Fly.io machine, AWS ECS task, plain Docker on a VM |
| Postgres | Supabase or Neon | AWS RDS, Render Postgres, self-hosted |
| Redis | Upstash | Redis Cloud, AWS ElastiCache |
| Object storage | Cloudflare R2 | AWS S3, Backblaze B2 |
| Mobile distribution | Expo EAS | Bare RN + Fastlane |
| Errors | Sentry | Bugsnag, Honeybadger |

## Environment variables

The single source of truth is `.env.example` at the repo root. Copy it to `.env` (local) or set the same keys in your hosting provider's secret manager (prod).

**Required:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
REDIS_URL=rediss://default:pass@host:6379
JWT_SECRET=<64+ random characters>
REFRESH_TOKEN_SECRET=<64+ random characters>
ANTHROPIC_API_KEY=sk-ant-...
```

**Recommended for full feature parity:**
```env
DIRECT_DATABASE_URL=postgresql://...      # bypass pooler for migrations (Supabase / Neon)
TOTP_ENCRYPTION_KEY=<64 hex chars>        # required to enable TOTP
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=cyberscore-evidence
R2_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://evidence.cyberscore.app
SMTP_HOST=smtp.eu.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@mg.cyberscore.app
SMTP_PASS=...
SMTP_FROM=CyberScore <no-reply@cyberscore.app>
EXPO_ACCESS_TOKEN=<from expo.dev>
SENTRY_DSN=https://...
ANTHROPIC_MODEL_PRIMARY=claude-sonnet-4-6
ANTHROPIC_MODEL_FALLBACK=claude-haiku-4-5
ANTHROPIC_DAILY_BUDGET_USD=200
AI_FREE_DAILY_CALLS=50
RATE_LIMIT_LOGIN_MAX=5
RATE_LIMIT_LOGIN_WINDOW_MS=900000
```

**Generate strong secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"   # JWT_SECRET, REFRESH_TOKEN_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"          # TOTP_ENCRYPTION_KEY (must be exactly 64 hex chars)
```

## Deployment runbooks

### A. API on Vercel

**One-time setup:**

1. Create a Vercel project from the GitHub repo. Set the **Root Directory** to `apps/api`.
2. Override the build command:
   ```
   cd ../.. && npm install && npx turbo run build --filter=@cyberscore/api
   ```
3. Override the output directory to `.next`.
4. Add all environment variables from the list above in **Project Settings → Environment Variables**.
5. Add a **Custom Build Environment** to install the workspace properly. Vercel handles this automatically if the root `package.json` declares `workspaces`.

**Migrations:**

Vercel doesn't run migrations on deploy by default. Two options:

- **Option 1 (recommended)** — run migrations from CI before promoting the Vercel deployment to production. GitHub Actions:
  ```yaml
  - name: Run migrations
    run: cd apps/api && npx prisma migrate deploy
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL_DIRECT }}   # use direct URL, not pooler
  ```
- **Option 2** — add `prisma migrate deploy` to the Vercel build command:
  ```
  cd ../.. && npm install && cd apps/api && npx prisma migrate deploy && cd ../.. && npx turbo run build --filter=@cyberscore/api
  ```
  Risk: every preview deployment runs migrations against the prod DB. Use Option 1 unless you have a separate preview DB.

**Health checks:** Vercel auto-monitors deployment health. The internal `/api/v1/health` endpoint returns 200 only when DB + Redis are reachable — point any external uptime monitor at it.

### B. Workers on Render

**One-time setup:**

1. Create a **Background Worker** service from the same GitHub repo.
2. Set:
   - **Root Directory:** `apps/api`
   - **Build Command:** `cd ../.. && npm install && cd apps/api && npx prisma generate`
   - **Start Command:** `npx tsx --env-file=.env src/workers/index.ts`
   - **Environment:** Same vars as the API (workers share the same `lib/`)
3. Add a **Health Check** — workers don't expose HTTP, so use Render's CLI/log monitoring or have the worker emit a heartbeat to a separate URL.

**Scaling:** workers scale horizontally. The deterministic `jobId` per (org, action) means parallel workers won't double-process the same job — BullMQ's locking handles it. Bump `INSTANCE_COUNT` in Render or change the worker file to spawn multiple BullMQ workers per process.

### C. Database (Supabase example)

1. Create a project. Note the **Connection string** (Pooler) and **Direct connection** strings.
2. Apply migrations from your machine the first time:
   ```bash
   DATABASE_URL='postgresql://...@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true' \
   DIRECT_DATABASE_URL='postgresql://...@db.<ref>.supabase.co:5432/postgres' \
   npx prisma migrate deploy
   ```
3. Seed the KPI catalogue (idempotent):
   ```bash
   DATABASE_URL='...' npm run db:seed --workspace @cyberscore/api
   ```
4. **Enable Row-Level Security** on every tenant-scoped table. The Prisma migrations don't apply RLS policies — those live in `apps/api/prisma/migrations/*/rls.sql` and must be run separately:
   ```bash
   psql "$DIRECT_DATABASE_URL" -f apps/api/prisma/migrations/<migration>/rls.sql
   ```
   (If no `rls.sql` exists yet, this is a known gap — see [known-issues.md](known-issues.md).)

### D. Mobile via EAS

**One-time setup:**

```bash
npm install -g eas-cli
cd apps/mobile
eas login
eas build:configure   # generates eas.json
```

**Build for production:**

```bash
# Set the API URL for the production build
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://api.cyberscore.app

# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

**Submit to stores:**

```bash
eas submit --platform ios --latest
eas submit --platform android --latest
```

**OTA updates (for non-native changes):**

```bash
eas update --branch production --message "Fix dashboard glow gradient"
```

Users on the latest binary get the update on next app open — no review cycle.

## CI/CD

There is **no CI/CD pipeline yet**. To add one (GitHub Actions, recommended):

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: cyberscore_test
        ports: ['5432:5432']
        options: --health-cmd pg_isready
      redis:
        image: redis:7
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx turbo run typecheck
      - run: npx turbo run lint
      - run: npx turbo run test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/cyberscore_test
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: ${{ secrets.CI_JWT_SECRET }}
          REFRESH_TOKEN_SECRET: ${{ secrets.CI_REFRESH_SECRET }}
```

Add a `deploy.yml` workflow that triggers on push to `main` and runs `prisma migrate deploy` against prod before letting Vercel build.

## Backups

Production checklist:

- **Postgres** — daily automated backups + 30-day retention. Supabase/Neon/RDS all offer this out of the box. Test restoration quarterly.
- **R2/S3** — versioning enabled on the bucket; lifecycle rule to expire old versions after 90 days.
- **Redis** — no backups needed (queue jobs are recreatable, cache is regeneratable, rate-limit windows are short-lived).

## Observability

- **Logs** — Pino emits structured JSON. Configure your hosting provider to ingest stdout into Vercel Logs / Render Logs / Datadog / Logtail.
- **Errors** — Sentry is wired in via `instrumentation.ts`. Set `SENTRY_DSN` and errors flow automatically.
- **Metrics** — not wired. Recommended: OpenTelemetry SDK (the env vars `OTEL_EXPORTER_OTLP_ENDPOINT` are already typed; just plug in `@opentelemetry/sdk-node`).
- **Uptime** — point an external monitor (BetterStack, UptimeRobot) at `/api/v1/health`.

## Rollback

- **API on Vercel** — instant; promote the previous deployment from the project dashboard.
- **Workers on Render** — redeploy the previous commit from the Render dashboard.
- **Database migrations** — Prisma has no automatic rollback. To revert: manually write a counter-migration. Always test migrations on staging first.
- **Mobile binary** — submit the previous version via EAS, or use phased rollout on the store side.
- **OTA update** — `eas update:rollback --branch production` reverts to the previous bundle.

## Cost ceiling (rough, for ~1000 active orgs)

| Service | Tier | Monthly |
|---|---|---|
| Vercel (API) | Pro | $20 + usage |
| Render (workers) | Starter | $7 |
| Supabase Postgres | Pro | $25 |
| Upstash Redis | Pay-as-you-go | ~$10 |
| Cloudflare R2 | Pay-as-you-go | ~$5 (1TB free egress) |
| Anthropic API | Pay-as-you-go | depends — see daily budget in `.env` |
| Sentry | Team | $26 |
| Expo EAS | Production | $99 |
| **Total** | | **~$200/mo + AI usage** |

AI cost is the swing variable. With prompt caching the per-chat-turn cost is fractions of a cent after the first turn; the daily budget guard prevents runaway spend.
