# CyberScore

> Cybersecurity health scorecard for organisations — self-assess 46 KPIs across People, Process, and Company; get personalised AI-guided remediation.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node](https://img.shields.io/badge/Node-22.x-brightgreen)
![Postgres](https://img.shields.io/badge/Postgres-16-blue)
![Expo SDK](https://img.shields.io/badge/Expo-SDK_52-black)
![Next.js](https://img.shields.io/badge/Next.js-15.5-black)
![Status: Live](https://img.shields.io/badge/Status-Live-success)

🚀 **Live API:** https://cyberscore-api.vercel.app  ·  [Health check](https://cyberscore-api.vercel.app/api/v1/health)
🎥 **Demo video:** [Watch on OneDrive](https://iiitbac-my.sharepoint.com/:v:/g/personal/saanvi_vishal_iiitb_ac_in/IQA6_RpGKPsHTp2JsEX8W6dVAdQG0jaFrzJQZSFKEfj32Wk?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=B6uqLC) (IIIT Bangalore SharePoint)
📱 **Demo APK:** see latest EAS build in [docs/access-credentials.md](docs/access-credentials.md)
🔑 **Demo login:** `saanvi.vishal@iiitb.ac.in` / `cyberscore-demo-2026`

---

## What is this?

A **mobile-first SaaS** that lets organisations self-assess cybersecurity posture and turn the result into a concrete action plan. The KPI set is mapped to **NIST CSF 2.0** and **ISO 27001** control families. The product has:

- A **React Native mobile app** (Expo SDK 52, iOS + Android)
- A **Next.js 15 API** with Prisma 6 / Postgres 16 / BullMQ workers on Redis
- **AI-powered chat advisor** that knows your live scorecard (Claude Sonnet 4.5, streaming, prompt-cached)
- **Two operating modes:** SOLO (single user) and ENTERPRISE (admin + employees with per-user level permissions)

```mermaid
flowchart LR
  M[📱 Mobile<br/>Expo SDK 52] -- HTTPS/JWT --> A[🚀 API<br/>Next.js 15]
  A <--> PG[(Postgres 16<br/>RLS)]
  A <--> R[(Redis<br/>queues + cache)]
  W[⚙️ Workers<br/>BullMQ] <--> R
  W <--> PG
  A -- streaming --> AI[🧠 Anthropic<br/>Claude]
  W --> EXPO[Expo Push]
  W --> SMTP[SMTP]
```

## Quick start

```bash
git clone <repo-url>
cd cyberscore

# One-shot bootstrap: installs deps, copies .env, runs migrations + seed
./scripts/setup.sh
```

Then three terminals:

```bash
# Terminal 1 — API on :3000
npm run dev --workspace @cyberscore/api

# Terminal 2 — Workers (email / snapshot / push / abandonment)
npm run worker --workspace @cyberscore/api

# Terminal 3 — Mobile (Metro on :8081)
EXPO_PUBLIC_API_URL=http://$(ipconfig getifaddr en0):3000 \
  npm run start --workspace @cyberscore/mobile
```

Once Metro shows the QR code, press **`i`** for iOS Simulator or scan the QR with Expo Go on your phone.

### Login

After `db:seed`, you can either:
- **Use the test account:** `saanvi.vishal@iiitb.ac.in` — password reset via the **Forgot?** flow (dev mode shows the OTP inline on the next screen, no email needed)
- **Register fresh** in Solo mode — the verify-OTP screen shows an amber DEV MODE banner with the code; tap to autofill

## Prerequisites

| | Minimum |
|---|---|
| Node.js | 20.x |
| npm | 10.9+ (or 11.x) |
| PostgreSQL | 16 |
| Redis | 6+ |
| Xcode + iOS Simulator | for iOS dev — macOS only |
| Android Studio | for Android dev |

Install Postgres + Redis on macOS:

```bash
brew install postgresql@16 redis
brew services start postgresql@16
brew services start redis
createdb cyberscore
```

## Repository layout

```
cyberscore/
├── apps/
│   ├── api/                    # Next.js 15 API + BullMQ workers
│   │   ├── src/
│   │   │   ├── app/api/v1/     # ~46 REST routes (auth, kpis, scorecard, ai, admin, ...)
│   │   │   ├── lib/            # auth, prisma, ai, scoring, access, ...
│   │   │   └── workers/        # email, snapshot, push, abandonment + scheduler
│   │   └── prisma/             # schema, migrations, seed
│   └── mobile/                 # Expo SDK 52 / RN 0.76.9
│       ├── app/                # expo-router file-based routes
│       │   ├── (auth)/         # login, register, verify-otp, forgot, reset-password, invite
│       │   └── (app)/          # dashboard, assessment, analytics, insights (chat), profile, team
│       └── src/
│           ├── components/     # Screen, TopBar, Card, Button, Input, ScoreRing, ...
│           ├── lib/            # api client, chatStream, queryClient
│           ├── stores/         # zustand auth store
│           └── theme/          # colors, typography
├── packages/
│   ├── sdk/                    # @cyberscore/sdk — typed fetch client with auto-refresh
│   └── types/                  # @cyberscore/types — Zod schemas shared by API + mobile
├── docs/
│   ├── architecture.md         # system architecture + tech-stack rationale
│   ├── system-design.md        # HLD + LLD with mermaid diagrams
│   ├── requirements.md         # FR / NFR / SR
│   ├── database.md             # schema + ER diagram + RLS notes
│   ├── deployment.md           # production runbook
│   ├── known-issues.md         # bugs, incomplete features, gotchas
│   └── roadmap.md              # what to build next
├── scripts/setup.sh            # one-shot bootstrap
├── package.json                # workspaces + turbo orchestration
├── turbo.json                  # task pipelines
├── HANDOVER_CHECKLIST.md       # checklist tracker for batch handover
├── CHANGELOG.md
├── CONTRIBUTING.md
└── LICENSE
```

## Features at a glance

### For solo users
- Onboarding with email OTP (dev mode skips real email)
- Self-assessment across 46 KPIs, three levels, four tiers each
- Live scorecard with per-level breakdown and color bands (RED/AMBER/GREEN)
- Trend chart from historical snapshots
- AI advisor chat — ask "where am I weakest?" and get answers grounded in your actual scorecard
- Personalised remediation suggestions per underperforming KPI
- Evidence file uploads attached to responses
- TOTP-based 2FA
- Shareable read-only scorecard URLs

### For enterprise admins
- Everything above, plus:
- Invite employees by email with **pre-assigned level access** (any subset of People / Process / Company)
- Team dashboard: per-member completion, score, last activity
- Edit any employee's allowed levels on the fly
- Locked framework — employees can't change it
- Aggregated team scorecard with consensus signals on ORG-scope KPIs
- Audit log for every team change

### For developers
- **Type-safe end-to-end** — Zod schemas in `@cyberscore/types` are the single source of truth for request/response shapes
- **Strict TypeScript** everywhere (`noUnusedLocals`, `noUncheckedIndexedAccess`, all the strict flags)
- **Append-only migrations** with Prisma 6
- **Append-only audit log** for security-relevant actions
- **RFC 7807 Problem Details** for every error response
- **Structured Pino logs** in production
- **Turbo pipelines** for cacheable lint/typecheck/build across the monorepo

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Mobile UI | Expo SDK 52, React Native 0.76, NativeWind 4 | Single codebase, native APIs via Expo |
| Mobile state | TanStack Query 5, Zustand 5 | Server cache + auth store |
| Server | Next.js 15 (App Router) | One framework for route handlers, no Express layer |
| Database | PostgreSQL 16 with Prisma 6 | RLS for tenant isolation, schema-as-source-of-truth |
| Queue | BullMQ 5 on Redis | Battle-tested, built-in retries + scheduling |
| Auth | Argon2id passwords + JWT + opaque refresh tokens | OWASP-recommended, stateless access, revocable refresh |
| AI | Anthropic Claude (Sonnet 4.5 primary, Haiku 4.5 fallback) | Streaming responses, prompt caching, daily budget guard |
| Validation | Zod 3 | Shared schemas across API + mobile |
| Logging | Pino | Structured JSON, low overhead |
| Mobile SSE | react-native-sse | Works on RN old-arch where fetch streaming doesn't |
| Build | Turbo 2 + npm workspaces | Cacheable task graph for the monorepo |

See [docs/architecture.md](docs/architecture.md) for the full rationale.

## Documentation

| If you want to... | Read |
|---|---|
| Understand the system at a glance | [docs/architecture.md](docs/architecture.md) |
| See HLD + LLD with diagrams | [docs/system-design.md](docs/system-design.md) |
| Know what the product does | [docs/requirements.md](docs/requirements.md) |
| Set up the database | [docs/database.md](docs/database.md) |
| Deploy to production *(now: an actual runbook for the live stack)* | [docs/deployment.md](docs/deployment.md) |
| Know what's broken or incomplete | [docs/known-issues.md](docs/known-issues.md) |
| Plan the next batch's work | [docs/roadmap.md](docs/roadmap.md) |
| Read the sprint-by-sprint build history | [docs/sprints.md](docs/sprints.md) |
| Find every external service + how to take it over | [docs/access-credentials.md](docs/access-credentials.md) |
| Read the narrative of key decisions / lessons / tips | [docs/handover-notes.md](docs/handover-notes.md) |
| Manually verify everything works | [docs/testing-manual.md](docs/testing-manual.md) |
| Contribute | [CONTRIBUTING.md](CONTRIBUTING.md) |
| See what changed when | [CHANGELOG.md](CHANGELOG.md) |
| Verify handover deliverables | [HANDOVER_CHECKLIST.md](HANDOVER_CHECKLIST.md) |

There's also `apps/mobile/HANDOFF.md` from the prior batch — useful design context.

## Common issues

| Symptom | Cause | Fix |
|---|---|---|
| `Network error: Could not reach the AI service` | LAN IP changed; Metro started with old IP | Restart Metro with current IP: `EXPO_PUBLIC_API_URL=http://$(ipconfig getifaddr en0):3000 npm run start --workspace @cyberscore/mobile` |
| API returns 500 with "Objects are not valid as a React child" | A route handler module threw at import — usually invalid `.env` | Check server logs; fix env var; restart `npm run dev` |
| "Unable to resolve module react-native-sse" | Metro cache stale after `npm install` | `npx expo start --clear` |
| `npm run worker` exits with code 1 | `.env` has a placeholder that fails Zod URL validation (e.g. `R2_ENDPOINT=https://<accountid>...`) | Comment out or fix the offending env var |
| Chat returns "Your credit balance is too low" | Anthropic API account has $0 credit | Add credits at [console.anthropic.com/settings/billing](https://console.anthropic.com/settings/billing) |
| `EADDRINUSE :3000` when starting API | Another API process is already running | `lsof -nP -iTCP:3000 -sTCP:LISTEN` to find it, kill, retry |
| Login says "Invalid email or password" but you swear it's right | Password was reset by something else, or typo | Reset via in-app **Forgot?** — dev mode shows the OTP inline |
| Mobile app shows "Opening project..." forever | Expo Go stuck on stale connection | In Metro terminal: press `s` if `--dev-client` is set, then press `i`. Or kill Expo Go on simulator and `i` again. |

See [docs/known-issues.md](docs/known-issues.md) for the full list.

## Environment variables

Copy `.env.example` to `apps/api/.env` and fill in:

```env
# Required for local dev
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cyberscore?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=<64+ random chars>            # node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
REFRESH_TOKEN_SECRET=<64+ random chars>
ANTHROPIC_API_KEY=sk-ant-...             # required for AI chat; leave placeholder if testing only non-AI flows

# Optional (features degrade gracefully without them)
SMTP_HOST=smtp.mailtrap.io
R2_ACCESS_KEY_ID=
EXPO_ACCESS_TOKEN=
SENTRY_DSN=
```

See [docs/deployment.md](docs/deployment.md) for the production set.

## Scripts

From the repo root:

```bash
npm run dev                  # turbo: dev across all workspaces
npm run build                # turbo: build (Next.js compile + Prisma generate)
npm run lint                 # turbo: lint
npm run typecheck            # turbo: tsc --noEmit
npm run test                 # turbo: vitest (none yet)
npm run db:generate          # prisma generate
npm run db:migrate           # prisma migrate dev
npm run db:seed              # populates KPI catalogue + suggestions

# Workspace-scoped:
npm run dev --workspace @cyberscore/api
npm run worker --workspace @cyberscore/api
npm run start --workspace @cyberscore/mobile
```

API workspace also has:
- `npm run db:studio --workspace @cyberscore/api` — opens Prisma Studio (DB GUI at localhost:5555)
- `npm run db:migrate:deploy --workspace @cyberscore/api` — non-interactive prod migration

## License

MIT — see [LICENSE](LICENSE).

## Acknowledgements

CyberScore began as a student capstone project at IIIT Bangalore, mentored by Mohan Ram C. Subsequent batches: please read [docs/known-issues.md](docs/known-issues.md) and [apps/mobile/HANDOFF.md](apps/mobile/HANDOFF.md) before making changes. They document context that isn't obvious from the code alone.

---

**Status:** v0.3.0 — handover release. Project is **fully deployed and demoable**: API live on Vercel, Postgres on Neon (Singapore), Redis on Upstash (Singapore), email through Brevo. Demo APK runs standalone on Android. See [HANDOVER_CHECKLIST.md](HANDOVER_CHECKLIST.md) for deliverables status and [CHANGELOG.md](CHANGELOG.md) for what shipped in this release.
