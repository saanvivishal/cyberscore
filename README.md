# CyberScore

A cybersecurity health scorecard for organisations. You answer 46 KPI questions across three areas (People, Process, Company), and the app gives you a live score, a colour band (red, amber, green), and an AI chat advisor that knows your scorecard and helps you fix the weak spots.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node](https://img.shields.io/badge/Node-22.x-brightgreen)
![Postgres](https://img.shields.io/badge/Postgres-16-blue)
![Expo SDK](https://img.shields.io/badge/Expo-SDK_52-black)
![Next.js](https://img.shields.io/badge/Next.js-15.5-black)
![Status: Live](https://img.shields.io/badge/Status-Live-success)

**Live API:** https://cyberscore-api.vercel.app (health check at `/api/v1/health`)
**Demo video:** [Watch on OneDrive](https://iiitbac-my.sharepoint.com/:v:/g/personal/saanvi_vishal_iiitb_ac_in/IQA6_RpGKPsHTp2JsEX8W6dVAdQG0jaFrzJQZSFKEfj32Wk) (IIIT Bangalore SharePoint)
**Demo APK:** see the latest EAS build in [docs/access-credentials.md](docs/access-credentials.md)
**Demo login:** `saanvi.vishal@iiitb.ac.in` / `cyberscore-demo-2026`

---

## What this is

CyberScore is a mobile-first SaaS product I built as my capstone at IIIT Bangalore, mentored by Mohan Ram C at FISST. The idea is that a lot of small and mid-size companies do not have a proper way to check how secure they are. They either pay for an expensive audit, or they just guess. CyberScore is the third option: you open the app, answer the questions, and you get a real, weighted score that maps to NIST CSF 2.0 and ISO 27001 control families. Then an AI advisor in the same app tells you exactly which weak spots to fix first.

The product has:

- A React Native mobile app built with Expo SDK 52 (works on iOS and Android)
- A Next.js 15 API that runs on Vercel
- A Postgres database on Neon (Singapore region) with row level security for tenant isolation
- A Redis cache on Upstash (Singapore region) for rate limits and job queues
- AI chat through Anthropic Claude (Sonnet 4.5 primary, Haiku 4.5 fallback) with a local rule-based fallback so the demo works even on zero budget
- Two operating modes: SOLO for a single user, and ENTERPRISE for an admin who invites employees and assigns them per-level access

```mermaid
flowchart LR
  M[Mobile app<br/>Expo SDK 52] -- HTTPS + JWT --> A[API<br/>Next.js 15]
  A <--> PG[(Postgres 16<br/>row level security)]
  A <--> R[(Redis<br/>queues + cache)]
  W[Workers<br/>BullMQ] <--> R
  W <--> PG
  A -- streaming SSE --> AI[Anthropic<br/>Claude]
  W --> EXPO[Expo Push]
  W --> SMTP[Brevo email]
```

## Quick start

```bash
git clone https://github.com/saanvivishal/cyberscore
cd cyberscore
./scripts/setup.sh
```

That one script installs dependencies, copies the env file, runs Prisma migrations, and seeds the 46 KPI questions. After it finishes you need three terminals:

```bash
# Terminal 1: API on port 3000
npm run dev --workspace @cyberscore/api

# Terminal 2: background workers (email, snapshots, push)
npm run worker --workspace @cyberscore/api

# Terminal 3: mobile (Metro on port 8081)
EXPO_PUBLIC_API_URL=http://$(ipconfig getifaddr en0):3000 \
  npm run start --workspace @cyberscore/mobile
```

Press `i` for the iOS Simulator or scan the QR code with Expo Go on your phone.

### Logging in

After the seed runs, you can either:

- Use the test account `saanvi.vishal@iiitb.ac.in` and reset the password through the in-app Forgot flow. In dev mode the OTP shows on screen, no real email needed.
- Register a fresh account in Solo mode. The verify-OTP screen shows a yellow DEV MODE banner with the code. Tap it to autofill.

## What you need to run this

| Thing | Minimum version |
|---|---|
| Node.js | 20.x (we use 22.x) |
| npm | 10.9 or newer |
| PostgreSQL | 16 |
| Redis | 6 or newer |
| Xcode + iOS Simulator | only on macOS, only for iOS dev |
| Android Studio | for Android dev |

On macOS:

```bash
brew install postgresql@16 redis
brew services start postgresql@16
brew services start redis
createdb cyberscore
```

## Repo layout

```
cyberscore/
  apps/
    api/                    Next.js 15 API + BullMQ workers
      src/
        app/api/v1/         REST routes (auth, kpis, scorecard, ai, admin, etc)
        lib/                auth, prisma, ai, scoring, access control
        workers/            email, snapshot, push, abandonment
      prisma/               schema, migrations, seed data
    mobile/                 Expo SDK 52, React Native 0.76.9
      app/                  expo-router file-based routes
        (auth)/             login, register, verify-otp, forgot, reset, invite
        (app)/              dashboard, assessment, analytics, chat, profile, team
      src/
        components/         Screen, TopBar, Card, Button, Input, ScoreRing, etc
        lib/                api client, chatStream, queryClient
        stores/             Zustand auth store
        theme/              colours and typography
  packages/
    sdk/                    @cyberscore/sdk: typed fetch client with auto-refresh
    types/                  @cyberscore/types: Zod schemas shared by API + mobile
  docs/
    architecture.md         system architecture and tech stack rationale
    system-design.md        HLD and LLD with mermaid diagrams
    requirements.md         functional, non-functional, software requirements
    database.md             schema, ER diagram, RLS notes
    deployment.md           production runbook (Vercel, Neon, Upstash, Brevo)
    known-issues.md         bugs, incomplete features, gotchas
    roadmap.md              what the next batch should build
  scripts/setup.sh          one-shot bootstrap
  package.json              workspaces + turbo orchestration
  HANDOVER_CHECKLIST.md
  CHANGELOG.md
  CONTRIBUTING.md
  LICENSE
```

## What the app does

### For a solo user
- Onboarding with email OTP. In dev the OTP is shown on screen.
- A 46-question self-assessment across three areas (People, Process, Company), with four scoring tiers each.
- A live scorecard with per-area breakdown and colour bands (red, amber, green).
- A trend chart from historical snapshots.
- An AI advisor chat where you can ask "where am I weakest" and it answers based on your real scorecard.
- Personalised remediation suggestions for each underperforming KPI.
- Evidence file uploads attached to each response.
- Two-factor authentication using TOTP (Google Authenticator, 1Password, etc).
- Shareable read-only scorecard URLs for vendors or board members.

### For an enterprise admin
- All of the above, plus:
- Invite employees by email with pre-assigned level access (any subset of People, Process, Company).
- Team dashboard showing per-member completion percentage, individual score, and last activity.
- Edit any employee's allowed levels on the fly.
- Framework is locked, so employees cannot change it.
- Aggregated team scorecard with consensus signals showing where employees disagree with the admin's authoritative answer.
- Append-only audit log of every team change.

### For developers reading the code
- Type-safe end to end. Zod schemas in `@cyberscore/types` are the single source of truth for request and response shapes.
- Strict TypeScript everywhere: `noUnusedLocals`, `noUncheckedIndexedAccess`, all the strict flags on.
- Append-only Prisma migrations.
- Append-only audit log for security-relevant actions.
- RFC 7807 Problem Details for every error response.
- Structured Pino logs.
- Turbo pipelines for cacheable lint, typecheck, and build across the monorepo.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Mobile UI | Expo SDK 52, React Native 0.76, NativeWind 4 | One codebase, native APIs through Expo |
| Mobile state | TanStack Query 5, Zustand 5 | Server cache plus a simple auth store |
| Server | Next.js 15 (App Router) | Single framework, no separate Express layer |
| Database | PostgreSQL 16 with Prisma 6 | RLS for tenant isolation, schema is the source of truth |
| Queue | BullMQ 5 on Redis | Reliable retries and scheduling |
| Auth | Argon2id + JWT + opaque refresh tokens | OWASP-recommended, stateless access, revocable refresh |
| AI | Anthropic Claude Sonnet 4.5 (Haiku 4.5 fallback) | Streaming, prompt caching, daily budget guard |
| Validation | Zod 3 | Shared schemas across API and mobile |
| Logging | Pino | Structured JSON, low overhead |
| Mobile SSE | react-native-sse | Works on RN old architecture where fetch streaming does not |
| Build orchestration | Turbo 2 + npm workspaces | Cacheable task graph for the monorepo |

The full design rationale is in [docs/architecture.md](docs/architecture.md).

## Where to find what

| If you want to | Read |
|---|---|
| Understand the system at a glance | [docs/architecture.md](docs/architecture.md) |
| See HLD and LLD with diagrams | [docs/system-design.md](docs/system-design.md) |
| Know what the product does | [docs/requirements.md](docs/requirements.md) |
| Set up the database | [docs/database.md](docs/database.md) |
| Deploy to production | [docs/deployment.md](docs/deployment.md) |
| See what is broken or incomplete | [docs/known-issues.md](docs/known-issues.md) |
| Plan the next batch's work | [docs/roadmap.md](docs/roadmap.md) |
| Read the sprint-by-sprint history | [docs/sprints.md](docs/sprints.md) |
| Take over the cloud services | [docs/access-credentials.md](docs/access-credentials.md) |
| Read the narrative on decisions, lessons, tips | [docs/handover-notes.md](docs/handover-notes.md) |
| Manually verify everything works | [docs/testing-manual.md](docs/testing-manual.md) |
| Contribute | [CONTRIBUTING.md](CONTRIBUTING.md) |
| See what changed when | [CHANGELOG.md](CHANGELOG.md) |
| Verify handover deliverables | [HANDOVER_CHECKLIST.md](HANDOVER_CHECKLIST.md) |

## Common issues

| Symptom | Cause | Fix |
|---|---|---|
| `Network error: Could not reach the AI service` | LAN IP changed and Metro started with the old IP | Restart Metro: `EXPO_PUBLIC_API_URL=http://$(ipconfig getifaddr en0):3000 npm run start --workspace @cyberscore/mobile` |
| API returns 500 with "Objects are not valid as a React child" | A route handler module threw at import, usually an invalid env var | Check server logs, fix the env, restart |
| `Unable to resolve module react-native-sse` | Metro cache went stale after `npm install` | `npx expo start --clear` |
| `npm run worker` exits with code 1 | A Zod URL check failed on a placeholder env var like `R2_ENDPOINT=https://<accountid>...` | Fix or remove the offending env var |
| Chat returns `Your credit balance is too low` | Anthropic account has zero balance | Add credits at console.anthropic.com or just leave `USE_LOCAL_ADVISOR=true` |
| `EADDRINUSE :3000` when starting the API | Another API is already running | `lsof -nP -iTCP:3000 -sTCP:LISTEN` then kill it |
| Login says invalid credentials | Password was reset elsewhere or there is a typo | Use the in-app Forgot flow, dev mode shows the OTP inline |
| Mobile shows `Opening project...` forever | Expo Go is stuck on a stale connection | Kill Expo Go on the simulator, press `i` in Metro again |

Full list in [docs/known-issues.md](docs/known-issues.md).

## Environment variables

Copy `.env.example` to `apps/api/.env` and fill in:

```env
# Required for local dev
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cyberscore?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=<64+ random chars>
REFRESH_TOKEN_SECRET=<64+ random chars>

# Optional. Features degrade gracefully without these.
USE_LOCAL_ADVISOR=true        # leave true to skip Anthropic
ANTHROPIC_API_KEY=
SMTP_PASS=
SENTRY_DSN=
```

For production values see [docs/deployment.md](docs/deployment.md). To generate a secret quickly:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## Scripts

From the repo root:

```bash
npm run dev                  # turbo: dev across all workspaces
npm run build                # turbo: build (Next.js compile + Prisma generate)
npm run lint                 # turbo: lint
npm run typecheck            # turbo: tsc --noEmit
npm run test                 # turbo: vitest (no tests yet)
npm run db:generate          # prisma generate
npm run db:migrate           # prisma migrate dev
npm run db:seed              # populates 46 KPIs + 212 tiers + 92 suggestions
```

Per workspace:

```bash
npm run dev --workspace @cyberscore/api
npm run worker --workspace @cyberscore/api
npm run start --workspace @cyberscore/mobile
npm run db:studio --workspace @cyberscore/api
npm run db:migrate:deploy --workspace @cyberscore/api
```

## License

MIT. See [LICENSE](LICENSE).

## Credits

CyberScore was built as a capstone project at IIIT Bangalore by Saanvi Vishal, mentored by Mohan Ram C at FISST. The next batch should read [docs/handover-notes.md](docs/handover-notes.md) and [apps/mobile/HANDOFF.md](apps/mobile/HANDOFF.md) first. Those have context that is not obvious from the code.

---

**Status:** v0.3.0, the handover release. The product is fully deployed and demoable end to end. API on Vercel, Postgres on Neon, Redis on Upstash, email through Brevo, Android APK built with EAS. See [HANDOVER_CHECKLIST.md](HANDOVER_CHECKLIST.md) for deliverables and [CHANGELOG.md](CHANGELOG.md) for what shipped.
