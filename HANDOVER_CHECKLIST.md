# Handover Checklist

> Companion to `Project Handover Checklist.docx` shared by Mohan Ram C. Every one of the 20 sections from that checklist is reproduced below with its current status, where the supporting work lives, and what the next batch should pick up.

**Legend:** ✅ done · 🟡 partial / needs follow-up · ⚪️ not started · ⚠️ deliberately deferred (with reasoning)

**Document version:** v0.3.0 (handover) — 2026-05-18 · **Released to:** supervisor demo build · **Live URL:** https://cyberscore-api.vercel.app

---

## Snapshot at handover

CyberScore is **fully deployed and demoable** end-to-end. The mobile APK runs standalone on Android, talks to the live API hosted on Vercel, the live Postgres on Neon (Singapore region), and the live Redis on Upstash (Singapore region). Password-reset OTP emails arrive in real inboxes via Brevo's HTTP email API. A small `cron-job.org` job pings `/api/v1/health` every 2 minutes to keep the serverless functions warm (this turns the cold-start lag from 5-10 seconds into a fast, demo-friendly response).

For the supervisor:

- **Live API:** https://cyberscore-api.vercel.app  (health: `/api/v1/health`)
- **Demo user:** `saanvi.vishal@iiitb.ac.in` / `cyberscore-demo-2026`  (verified SOLO admin, IIIT Bangalore org, Banking industry)
- **Mobile APK download:** the Expo build artifact link is in [§14 Access & credentials](#14-access--credentials-transfer)
- **GitHub repo:** https://github.com/saanvivishal/cyberscore
- **Demo video:** see [§13 Demo & presentation](#13-demo--presentation) — recorded 2026-05-18

---

## 0. Project Overview

| Item | Status | Where |
|---|---|---|
| Project title | ✅ | **CyberScore — Cybersecurity Health Scorecard SaaS** |
| Short description | ✅ | A mobile-first product that lets organisations self-assess their cybersecurity posture across 46 KPIs (People / Process / Company), get a live numeric scorecard mapped to NIST CSF 2.0 + ISO 27001, and receive personalised remediation guidance from a built-in advisor. SOLO mode for individual users; ENTERPRISE mode for admins who invite employees with per-level access control. |
| Team members | ✅ | **Saanvi Vishal** (IIIT Bangalore, IMT2021043) — sole developer this batch |
| Guide / mentor | ✅ | **Mohan Ram C**, FISST (Foundation for Innovation in Security & Software Technology) |
| Project duration | ✅ | **2026-04-15 → 2026-05-18** (≈5 weeks) |
| Repository link | ✅ | https://github.com/saanvivishal/cyberscore |

### Team & timeline

- **Institution:** International Institute of Information Technology, Bangalore (IIIT-B)
- **Roll number:** IMT2021043
- **Developer:** Saanvi Vishal
- **Mentor:** Mohan Ram C, FISST
- **Total active development:** ≈5 weeks (mid-April through mid-May 2026)
- **Demo date:** 2026-05-18
- **Repository:** https://github.com/saanvivishal/cyberscore

---

## 1. README

| Item | Status | Where |
|---|---|---|
| Project overview | ✅ | [README.md](README.md) — *What is this?* section |
| Features list | ✅ | [README.md](README.md) — *Features at a glance* section |
| Tech stack | ✅ | [README.md](README.md) — *Tech stack* table |
| Setup instructions (quick start) | ✅ | [README.md](README.md) — *Quick start* + `./scripts/setup.sh` |
| Run instructions | ✅ | [README.md](README.md) — three-terminal block (API, worker, mobile) |
| Screenshots / demo link | ✅ | [§13 Demo & presentation](#13-demo--presentation) below — video link + screenshots in the demo folder |
| FAQ / common issues | ✅ | [README.md](README.md) — *Common issues* table + [docs/known-issues.md](docs/known-issues.md) |

---

## 2. Requirements Documentation

### Functional Requirements

| Item | Status | Where |
|---|---|---|
| Clearly listed features | ✅ | [docs/requirements.md §3](docs/requirements.md) — 40 functional requirements across 8 areas (auth, KPIs, scoring, AI chat, evidence, team, notifications, share) |
| User roles & permissions | ✅ | [docs/requirements.md §2](docs/requirements.md) — SOLO user, ENTERPRISE admin, ENTERPRISE employee with per-level access (`User.allowedLevels`) |
| Use cases / user stories | ✅ | Combined with FR list + the four sequence diagrams in [docs/system-design.md — Critical end-to-end flows](docs/system-design.md) |

### Non-Functional Requirements

| Item | Status | Where |
|---|---|---|
| Performance | ✅ | [docs/requirements.md §4.2](docs/requirements.md) — p95 API latency targets, AI streaming first-token < 1.5s |
| Scalability | ✅ | [docs/requirements.md §4.3](docs/requirements.md) — horizontal API + worker scaling, Redis cache, prompt caching |
| Security | ✅ | [docs/requirements.md §4.1](docs/requirements.md) — Argon2id + HIBP, TOTP 2FA, JWT + opaque refresh, RLS, RFC 7807 errors, audit log |
| Usability | ✅ | [docs/requirements.md §4.5](docs/requirements.md) — accessibility targets, dev-mode OTP autofill, glassmorphism design system |

### Software Requirements

| Item | Status | Where |
|---|---|---|
| Programming languages | ✅ | [docs/requirements.md §5.1](docs/requirements.md) — TypeScript (strict), SQL, small Python for KPI extraction |
| Frameworks / libraries | ✅ | [docs/requirements.md §5.2](docs/requirements.md) — Next.js 15, Expo SDK 52, Prisma 6, BullMQ, Zod, Pino, Anthropic SDK |
| Tools | ✅ | [docs/requirements.md §5.3](docs/requirements.md) — Turbo, npm workspaces, Prettier, ESLint, Prisma Studio, EAS CLI |

---

## 3. System Design

### High-Level Design (HLD)

| Item | Status | Where |
|---|---|---|
| System overview diagram | ✅ | [docs/system-design.md — System context](docs/system-design.md) — mermaid flowchart of mobile → API → Postgres + Redis + Anthropic + Expo Push + SMTP |
| Major components / modules | ✅ | [docs/system-design.md — Major modules](docs/system-design.md) — auth, scorecard, AI advisor, evidence, team, snapshot worker, SDK, mobile UI |
| External integrations | ✅ | [docs/system-design.md — External integrations](docs/system-design.md) — Anthropic, Brevo (email), Cloudflare R2 (object storage), Expo Push, Sentry |

### Low-Level Design (LLD)

| Item | Status | Where |
|---|---|---|
| Module-level breakdown | ✅ | [docs/system-design.md — Low-Level Design](docs/system-design.md) — scoring algorithm, auth/token flow, AI streaming pipeline, access control, snapshot worker, SDK error mapping, AuthGate hydration |
| Class diagrams | ✅ | Mermaid `classDiagram` block for the auth module |
| Sequence diagrams | ✅ | Four end-to-end flows: onboarding (register → OTP → first login), AI chat streaming, invite + accept-invite, KPI submit → snapshot recompute |

---

## 4. Architecture

| Item | Status | Where |
|---|---|---|
| Architecture diagram | ✅ | [docs/architecture.md](docs/architecture.md) — modular monolith pattern + mermaid flowchart |
| Data flow diagram | ✅ | [docs/architecture.md — Data flow](docs/architecture.md) — representative request walk-through |
| Tech stack justification | ✅ | [docs/architecture.md — Tech stack table](docs/architecture.md) — every choice has a one-line "why" |
| Key design decisions + rationale | ✅ | [docs/architecture.md — Key design decisions](docs/architecture.md) — 7 decisions documented (Next.js over Express, RLS for tenancy, BullMQ for async, etc.) |

---

## 5. Codebase Readiness

| Item | Status | Notes |
|---|---|---|
| Clean folder structure | ✅ | npm workspaces + Turbo monorepo. `apps/` (api + mobile), `packages/` (sdk + types), `docs/`. Documented in [README.md — Repository layout](README.md). |
| No unnecessary files | ✅ | `.next`, `node_modules`, `.turbo`, build artifacts, `.env`, .DS_Store all gitignored. Verified with `git status --ignored`. |
| Naming conventions | ✅ | camelCase TS, kebab-case file routes, PascalCase React components, snake_case Postgres tables (mapped via `@@map` in Prisma). |
| Comments for complex logic | ✅ | Block comments above non-obvious functions, particularly in `lib/scorecard.ts` (tiered scoring with consensus rollup), `lib/auth.ts` (refresh-token rotation), `messages/route.ts` (SSE stream + prompt caching), `lib/advisor-local.ts` (intent detection + sector primer). |
| Docstrings / inline documentation | 🟡 | Route handlers carry header doc blocks explaining purpose + auth posture. Many `lib/` exports rely on TypeScript signatures alone. Acceptable for an internal codebase; if you publish `@cyberscore/sdk` externally, add JSDoc to public exports. |

---

## 6. Dependency & Environment Setup

| Item | Status | Where |
|---|---|---|
| Dependency files present | ✅ | `package.json` at root + each workspace (`apps/api`, `apps/mobile`, `packages/sdk`, `packages/types`) |
| Versions specified | ✅ | All package versions pinned with caret ranges (`^X.Y.Z`). `package-lock.json` committed for exact reproducibility. |
| `.env.example` file included | ✅ | Repo root [.env.example](.env.example) + per-app [apps/api/.env.example](apps/api/.env.example) and [apps/mobile/.env.example](apps/mobile/.env.example) |
| Environment variables documented | ✅ | Every var has an inline comment in `.env.example`; production vars also covered in [docs/deployment.md — Environment variables](docs/deployment.md) |
| Setup instructions verified | ✅ | Tested end-to-end. [scripts/setup.sh](scripts/setup.sh) automates: install deps → copy `.env` → `prisma migrate dev` → `prisma db seed`. |

---

## 7. Database Documentation

| Item | Status | Where |
|---|---|---|
| Database schema | ✅ | `apps/api/prisma/schema.prisma` is the single source of truth — 24 tables, ~150 columns, ~30 indexes |
| Migration files | ✅ | 7 migrations in `apps/api/prisma/migrations/`: init → enterprise_mode → per_user_progress → add_allowed_levels → add_chat_threads → add_response_matched_tier_relation → rls_policies |
| ER diagram | ✅ | [docs/database.md — ER diagram](docs/database.md) — mermaid `erDiagram` covering all 24 tables + their relationships |
| Sample / seed data | ✅ | `apps/api/prisma/seed.ts` upserts 46 KPIs + 212 scoring tiers + 92 personalised suggestions, extracted from `SCORE CARD_KPI_CYBER SEC_PPT_V0.9.xlsx` via `prisma/seed/extract-kpis.py`. Plus `apps/api/scripts/seed-demo-user.ts` plants the demo user against the live Neon DB. |
| Setup instructions | ✅ | [docs/database.md — Setup](docs/database.md) — covers local Postgres install, Prisma migrate, seed, plus Neon (production). |

---

## 8. Deployment — ✅ **LIVE**

This section was previously marked "planning document only." As of 2026-05-18 the project is fully deployed and accessible from any internet-connected device.

| Item | Status | Where |
|---|---|---|
| Deployment steps documented | ✅ | [docs/deployment.md](docs/deployment.md) — now reflects the *actual* deployed setup, not just a plan |
| Hosting platforms | ✅ | **API → Vercel** (https://cyberscore-api.vercel.app), **Postgres → Neon** (Singapore region), **Redis → Upstash** (Singapore region), **Email → Brevo** (300 emails/day free tier), **Mobile distribution → Expo EAS Build** (Android APK over-the-internet install). All on free tiers. |
| Environment configs for production | ✅ | All 15+ env vars configured in Vercel Project Settings → Environment Variables (Production + Preview). Secrets are marked Sensitive. Local dev vars stay in `.env` (gitignored). |
| CI/CD pipeline | 🟡 | Git push → GitHub triggers Vercel auto-deploy on `main`. No GitHub Actions workflow yet (no test suite to run). A template is in [docs/deployment.md — CI/CD](docs/deployment.md) for the next batch. |
| Cold-start mitigation | ✅ | A `cron-job.org` job (free, external) pings `/api/v1/health` every 2 minutes. This keeps Vercel's serverless functions warm so the first user request after idle doesn't pay the 5-10 second cold-start tax. Critical for demo perceived performance. |
| Email delivery | ✅ | Brevo HTTP API (not SMTP — Vercel serverless throttles raw TCP on 465/587). Auto-detected from `SMTP_PASS` prefix in `apps/api/src/lib/email.ts`. |
| Keep-warm cron | ✅ | https://console.cron-job.org — single job hitting `/api/v1/health` every 2 min. Account belongs to `saanvivishal@gmail.com`. |

See [docs/deployment.md](docs/deployment.md) for the full deployment runbook — every command, every env var, every gotcha encountered.

---

## 9. Testing

| Item | Status | Notes |
|---|---|---|
| Unit tests available | ⚪️ | **None yet.** vitest is wired in `apps/api/package.json`; test directories are empty. |
| Integration tests available | ⚪️ | Same — wired but empty. |
| Manual test coverage | ✅ | End-to-end smoke tested manually: register → OTP → login → assessment → scorecard → chat → team admin → password reset (live Brevo email). Documented in [docs/testing-manual.md](docs/testing-manual.md). |
| Test execution steps documented | ✅ | `npm run test` from repo root or `npm run test --workspace @cyberscore/api`. See [CONTRIBUTING.md — Tests](CONTRIBUTING.md). |
| Known failing tests | n/a | No tests means no failing tests. |

> **Priority test targets** for the next batch — pick at least the top 3 if you can:
> 1. `lib/scoring.ts` — pure functions, easy unit tests, high value
> 2. `lib/scorecard.ts` — pure aggregation logic, mock Prisma client
> 3. `lib/access.ts` — small but security-critical (`effectiveAllowedLevels()`)
> 4. `lib/auth.ts` — token issuance + revocation
> 5. Auth route handlers — integration tests with a Postgres test DB

---

## 10. Sprint Documentation — see [docs/sprints.md](docs/sprints.md)

A full sprint-by-sprint timeline of this 5-week build is in [docs/sprints.md](docs/sprints.md). Summary:

| Sprint | Window | Theme |
|---|---|---|
| Sprint 1 | Week 1 | Repo bootstrap, Prisma schema, auth foundation |
| Sprint 2 | Week 2 | KPI catalogue, scoring engine, dashboard UI |
| Sprint 3 | Week 3 | ENTERPRISE mode, per-user level permissions |
| Sprint 4 | Week 4 | AI chat (Anthropic Claude streaming), local advisor fallback, password reset |
| Sprint 5 | Week 5 | Production deployment (Vercel + Neon + Upstash + Brevo), Android APK build, demo |

| Item | Status |
|---|---|
| Sprint goals defined | ✅ |
| Task breakdown | ✅ — by sprint in [docs/sprints.md](docs/sprints.md) |
| Timeline per sprint | ✅ |
| Assigned responsibilities | ✅ — sole developer (Saanvi Vishal) |
| Completed tasks per sprint | ✅ |
| Sprint review summary | ✅ |
| Sprint retrospective | ✅ — *what worked / what didn't* at end of each sprint section |

---

## 11. Roadmap & Future Work

| Item | Status | Where |
|---|---|---|
| Pending features | ✅ | [docs/roadmap.md — Near-term](docs/roadmap.md) — 7 features sized at S / M / L |
| Suggested improvements | ✅ | [docs/roadmap.md — Highest priority](docs/roadmap.md) — production-readiness items: tests, CI, RLS verification |
| Priority areas for next batch | ✅ | [docs/roadmap.md — Highest priority](docs/roadmap.md) — start here; everything else is icing |
| What we deliberately rejected | ✅ | [docs/roadmap.md — Things we deliberately decided NOT to do](docs/roadmap.md) — context for "why didn't you just…?" questions |

---

## 12. Known Issues & Limitations

| Item | Status | Where |
|---|---|---|
| Bugs not fixed | ✅ | [docs/known-issues.md §A](docs/known-issues.md) — current open items + the long list of fixed-in-v0.3.0 items |
| Performance limitations | ✅ | [docs/known-issues.md §C](docs/known-issues.md) — Vercel cold starts (mitigated, not eliminated), per-user KPI cache, no transaction around snapshot enqueue |
| Edge cases not handled | ✅ | [docs/known-issues.md §B + §D](docs/known-issues.md) — incomplete features + operational gaps |

**What's been fixed since v0.1.0:** see the version-by-version log in [docs/known-issues.md](docs/known-issues.md). Highlights:

- ✅ RLS policies applied to 19 tenant-scoped tables (v0.2.0)
- ✅ All 5 pre-existing TypeScript errors resolved (v0.2.0)
- ✅ Local rule-based advisor replaces Anthropic for chat — zero API cost (v0.2.0)
- ✅ Vercel deployment working end-to-end through 5 different failure modes (v0.3.0)
- ✅ Brevo email delivery via HTTP API (v0.3.0)
- ✅ Cold-start mitigation via cron-job.org keep-warm (v0.3.0)
- ✅ Onboarding carousel reachable (v0.3.0 — `index.tsx` was hardcoded to skip it)
- ✅ KPI question screen perf — sequential writes parallelised, fire-and-forget invalidations (v0.3.0, ~2-3× faster click-to-next)

---

## 13. Demo & Presentation

| Item | Status | Notes |
|---|---|---|
| Final report (PDF/DOC) | 🟡 | Source content lives across `docs/*.md` — combine into one PDF before handover email. Pandoc command: `pandoc docs/*.md -o cyberscore-final-report.pdf --toc`. |
| Presentation slides (PPT) | 🟡 | **Saanvi to prepare** — recommended outline below |
| Demo video | ✅ | Recorded 2026-05-18. File: `demo/cyberscore-demo-2026-05-18.mp4` (link to upload). Length: ~4 minutes. |
| Screenshots | ✅ | `demo/screenshots/` — onboarding, dashboard, assessment, scorecard, AI chat, team admin |

### Demo video walkthrough (what's shown)

The recording covers the full happy path:

1. **(0:00–0:15)** App launch on Samsung — **onboarding carousel** (Security Scans / Live Scorecard / AI Insights) → Skip
2. **(0:15–0:35)** Login with `saanvi.vishal@iiitb.ac.in` / `cyberscore-demo-2026` — Vercel API responds, JWT issued, dashboard hydrates
3. **(0:35–1:15)** Dashboard tour — overall score ring, People/Process/Company level tiles, last-snapshot date, resume-assessment CTA
4. **(1:15–2:00)** Assessment flow — pick PEOPLE level, answer a few KPIs (multi-choice tiers + percentage input), observe the optimistic Next-button transition
5. **(2:00–2:30)** Scorecard breakdown — per-level scores, per-KPI breakdown, RED/AMBER/GREEN bands
6. **(2:30–3:15)** Analytics tab — historical snapshot timeline + personalised suggestions per underperforming KPI
7. **(3:15–4:00)** AI chat — ask "where am I weakest?" → local advisor streams a Banking-sector-specific reply mentioning PCI DSS + RBI guidelines, grounded in actual scorecard
8. **(4:00–4:30)** Profile + framework picker (admin-only)
9. **(4:30–5:00)** Password reset flow — Forgot? → enter email → OTP arrives in IIITB Gmail inbox (Brevo) → enter OTP → set new password → log back in

### Suggested presentation slides (Saanvi to prepare)

A 10-12 slide deck would be sufficient:

1. **Title** — CyberScore, presenter, mentor, institution, date
2. **Problem statement** — why cybersecurity self-assessment matters for SMBs / mid-market companies
3. **Solution overview** — mobile-first SaaS, 46 KPIs, two modes (SOLO + ENTERPRISE)
4. **Architecture** — the mermaid diagram from `docs/architecture.md`
5. **Tech stack** — table from `README.md`
6. **Live demo** — embed or link to the demo video
7. **Key design decisions** — pick 3 from `docs/architecture.md` (e.g. modular monolith, RLS for tenancy, local advisor over RAG)
8. **Sprint timeline** — bar chart from `docs/sprints.md`
9. **What's deployed today** — show the live URL, the Neon Singapore region, the Brevo email proof
10. **Known limitations & roadmap** — be honest about no tests, no CI, etc.
11. **What I learned** — short list from `docs/handover-notes.md`
12. **Thanks / Q&A**

---

## 14. Access & Credentials Transfer

Every cloud service used by CyberScore, with who controls it, where to log in, and how to gain access. **No secrets are written in this document** — secrets live in Vercel Environment Variables (production) and `apps/api/.env` (local, gitignored).

See [docs/access-credentials.md](docs/access-credentials.md) for the in-depth version with rotation procedures.

### Live services

| Service | What it does | Who owns the account | URL |
|---|---|---|---|
| **GitHub** | Source repo | `@saanvivishal` (saanvivishal@gmail.com) | https://github.com/saanvivishal/cyberscore |
| **Vercel** | Hosts the API | `saanvivishal@gmail.com` (Hobby tier, free) | https://vercel.com/saanvivishals-projects/cyberscore-api |
| **Neon** | Production Postgres (Singapore region) | `saanvivishal@gmail.com` (Free tier) | https://console.neon.tech |
| **Upstash** | Production Redis (Singapore region) | `saanvivishal@gmail.com` (Free tier) | https://console.upstash.com |
| **Brevo** | Transactional email (OTP, invites) — 300/day free | `saanvivishal@gmail.com` (Free tier, registered as "iiit bangalore") | https://app.brevo.com |
| **Expo / EAS** | Mobile app build + distribution | Expo username: `saanviiiiiiiiiiiiii` (GitHub OAuth) | https://expo.dev/accounts/saanviiiiiiiiiiiiii |
| **cron-job.org** | Free keep-warm cron pinging `/health` every 2 min | `saanvivishal@gmail.com` | https://console.cron-job.org |

### Local secrets (NOT in this repo)

These exist on Saanvi's laptop in `apps/api/.env` and (a copy of the same) in Vercel Environment Variables for production:

- `JWT_SECRET` (64+ random chars)
- `REFRESH_TOKEN_SECRET` (64+ random chars)
- `TOTP_ENCRYPTION_KEY` (64 hex chars)
- `DATABASE_URL` + `DIRECT_DATABASE_URL` (Neon connection strings)
- `REDIS_URL` (Upstash connection string)
- `SMTP_PASS` (Brevo API key, format `xkeysib-...`)
- `ANTHROPIC_API_KEY` (only used if `USE_LOCAL_ADVISOR=false`)

### Transferring access to the next batch

When the next batch / FISST takes over, the cleanest path is:

1. **GitHub:** add their email as a repo collaborator (Settings → Collaborators → Add people). Or transfer ownership to a FISST GitHub organisation.
2. **Vercel:** invite them to the project (Settings → Members → Invite). They'll get email link.
3. **Neon:** Free tier supports one user per project, so either transfer the project to their email or share the connection string and they'll add it to their own Vercel.
4. **Upstash:** same — share connection string or transfer project.
5. **Brevo:** can either share the API key (and rotate yours), or they can sign up fresh and update `SMTP_PASS` in Vercel.
6. **Expo:** add them as a team member to the Expo organisation (Settings → Members).
7. **cron-job.org:** they can sign up fresh and recreate the single cron job in 2 minutes (URL: `https://cyberscore-api.vercel.app/api/v1/health`, every 2 min).

### ⚠️ Before transfer — rotate every secret

The current secrets passed through development conversations, so they should not be the long-lived production secrets:

- [ ] Rotate `JWT_SECRET` + invalidate all existing sessions
- [ ] Rotate `REFRESH_TOKEN_SECRET` + invalidate all refresh tokens
- [ ] Rotate `TOTP_ENCRYPTION_KEY` (this will invalidate any existing TOTP enrolments — fine for this demo, but warn users in production)
- [ ] Regenerate Brevo API key + update Vercel env
- [ ] If Anthropic was ever switched on: regenerate the API key
- [ ] If Neon / Upstash connection strings were ever shared via chat or email: rotate those too (both consoles have a "Reset Password" button)
- [ ] Verify `.env` is not in any commit ever: `git log --all --full-history --source -- '*/.env'` (should return nothing)

---

## 15. Versioning & Releases

| Item | Status | Where |
|---|---|---|
| Version tags | ✅ | `v0.1.0` (initial docs), `v0.2.0` (advisor + RLS), `v0.3.0` (live deployment + demo). Tagged via `git tag -a vX.Y.Z -m "..."` |
| CHANGELOG.md maintained | ✅ | [CHANGELOG.md](CHANGELOG.md) — Keep a Changelog format, three releases documented |

---

## 16. Contribution Guidelines

| Item | Status | Where |
|---|---|---|
| Branching strategy | ✅ | [CONTRIBUTING.md — Branching](CONTRIBUTING.md) — `main` is protected, feature branches named `feat/foo` or `fix/bar`, squash-merge on PR |
| Commit message format | ✅ | [CONTRIBUTING.md — Commits](CONTRIBUTING.md) — Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `perf:`, `test:`) |
| Pull request process | ✅ | [CONTRIBUTING.md — Pull requests](CONTRIBUTING.md) — body must explain *why*, link to issue, include test plan |

---

## 17. GitHub Hygiene

| Item | Status | Notes |
|---|---|---|
| Issues cleaned and labeled | 🟡 | No open issues at handover. As the next batch picks up roadmap items, they should be opened as issues with labels (`bug`, `feature`, `tech-debt`, `good-first-issue`). |
| TODOs converted to issues | 🟡 | All TODO/FIXME comments stripped from code. Open issues live in [docs/known-issues.md](docs/known-issues.md) and [docs/roadmap.md](docs/roadmap.md). The next batch can convert each line item to a GitHub issue. |
| Dead branches removed | ✅ | Only `main` exists on the remote at handover. Verify with `git branch -r`. |
| `.env` in history | ✅ | Verified: `git log --all -- '*/.env'` returns nothing. Author email rewritten from old default to `saanvivishal@gmail.com` for clean attribution. |

---

## 18. License

| Item | Status | Where |
|---|---|---|
| License file added | ✅ | [LICENSE](LICENSE) — MIT (chosen for permissive academic + future commercial use) |

---

## 19. Handover Notes (Critical)

A standalone, longer narrative is in [docs/handover-notes.md](docs/handover-notes.md). Headlines for the supervisor:

| Item | Status | Where |
|---|---|---|
| Key decisions explained | ✅ | [docs/architecture.md — Key design decisions](docs/architecture.md) (7 architectural decisions with rationale) + [docs/handover-notes.md — Decision log](docs/handover-notes.md) (additional product-level decisions made during the build) |
| Challenges faced | ✅ | [docs/handover-notes.md — Challenges](docs/handover-notes.md) — covers the macOS Gatekeeper blocker on Android Studio, the 5-stage Vercel deployment debugging saga, the Resend → Brevo email pivot, and the cold-start mitigation discovery |
| Lessons learned | ✅ | [docs/handover-notes.md — Lessons learned](docs/handover-notes.md) — 8 lessons that would shorten the next batch's timeline by an estimated 2 weeks |
| Tips for next batch | ✅ | [docs/handover-notes.md — Tips for next batch](docs/handover-notes.md) — "before you touch anything, do these 5 things" |
| Things to avoid | ✅ | [docs/handover-notes.md — Things to avoid](docs/handover-notes.md) — common rabbit holes (Vercel SMTP, Android Studio for an Expo app, etc.) |

---

## 20. Misc

| Item | Status | Notes |
|---|---|---|
| Docker setup | ⚠️ deliberately deferred | Not needed for the current Vercel deployment. Next.js `output: 'standalone'` is configured (only for non-Vercel deployments — when `process.env.VERCEL` is unset), making a future `Dockerfile` straightforward (~half a day's work). Skipped now because adding a Docker config and not actually using it is dead weight. |
| Setup automation script | ✅ | [scripts/setup.sh](scripts/setup.sh) — bootstraps a fresh clone in one command |
| Seed-demo-user script | ✅ | [apps/api/scripts/seed-demo-user.ts](apps/api/scripts/seed-demo-user.ts) — plants the verified demo user against any DATABASE_URL (used to seed the live Neon DB) |
| Makefile / CLI shortcuts | ⚠️ deliberately deferred | npm scripts in `package.json` already cover this. A Makefile would just wrap them. |

---

## 📌 Folder structure compliance

The supervisor's checklist suggests:

```
project-root/
├── src/
├── docs/
│   ├── requirements/
│   ├── design/
│   ├── architecture/
│   ├── sprints/
│   ├── deployment/
├── tests/
├── scripts/
├── .env.example
├── README.md
├── HANDOVER_CHECKLIST.md
├── CHANGELOG.md
└── docker-compose.yml (optional)
```

**Our structure is monorepo, not single-app**, so the top-level `src/` doesn't apply. We replace it with `apps/` (api + mobile) + `packages/` (sdk + types). Everything else maps directly:

| Suggested | Our equivalent | Status |
|---|---|---|
| `src/` | `apps/`, `packages/` | ✅ |
| `docs/requirements/` | `docs/requirements.md` (single file — easier end-to-end read) | ✅ |
| `docs/design/` | `docs/system-design.md` | ✅ |
| `docs/architecture/` | `docs/architecture.md` | ✅ |
| `docs/sprints/` | `docs/sprints.md` | ✅ |
| `docs/deployment/` | `docs/deployment.md` | ✅ |
| `tests/` | Currently empty; tests will colocate next to source as `*.test.ts` when added (vitest auto-discovery) | ⚪️ |
| `scripts/` | ✅ | ✅ |
| `.env.example` | ✅ (root + per-app) | ✅ |
| `README.md` | ✅ | ✅ |
| `HANDOVER_CHECKLIST.md` | ✅ (this file) | ✅ |
| `CHANGELOG.md` | ✅ | ✅ |
| `docker-compose.yml` | Not added — see [§20 Misc](#20-misc) | ⚠️ |

---

## Final pre-handover checklist

The bullet list to run through right before emailing Mohan Ram C:

- [x] All 20 sections above have at least 🟡 status
- [x] `git status` is clean
- [x] `npm run typecheck` passes (0 errors)
- [x] `npm run lint` passes
- [x] `./scripts/setup.sh` runs cleanly on a fresh clone
- [x] `.env` is **not** committed; `git log --all -- '*/.env'` returns nothing
- [x] Repository pushed to GitHub with `v0.3.0` tag
- [x] Vercel API live + responding 200 at `/api/v1/health`
- [x] Neon DB seeded with KPI catalogue + demo user
- [x] Demo APK installed and tested on Samsung
- [x] Demo video recorded (~4 min)
- [ ] Demo video uploaded to YouTube / Google Drive; link in README + this file
- [ ] Slides + final report attached to the handover email
- [ ] FISST account added as GitHub repo collaborator
- [ ] All long-lived secrets rotated (see [§14](#14-access--credentials-transfer))
- [ ] Handover email sent to Mohan Ram C with: this checklist, demo video link, slides, final report, repo link, demo account credentials

---

**Status:** Handover-ready as of 2026-05-18. CyberScore is fully deployed, demoable, and documented. The next batch can clone the repo, run `./scripts/setup.sh`, and have a working local dev environment in under 10 minutes.
