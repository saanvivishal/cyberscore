# Handover Checklist

This is the companion to the `Project Handover Checklist.docx` that Mohan Ram C shared. Every one of the 20 sections in that document is reproduced below with its current status, where the supporting work lives, and what the next batch should pick up.

**Legend:** ✅ done, 🟡 partial or needs follow-up, ⚪ not started, ⚠️ deliberately deferred (with reasoning).

**Document version:** v0.3.0 (handover), 2026-05-18
**Released to:** supervisor demo build
**Live URL:** https://cyberscore-api.vercel.app

---

## Snapshot at handover

CyberScore is fully deployed and demoable end to end. The mobile APK runs standalone on Android, talks to the live API hosted on Vercel, the live Postgres on Neon (Singapore region), and the live Redis on Upstash (Singapore region). Password-reset OTP emails arrive in real inboxes through Brevo's HTTPS API. A small `cron-job.org` job pings `/api/v1/health` every 2 minutes to keep the serverless functions warm. That turns the cold-start delay from 5 to 10 seconds into a fast, demo-friendly response.

For the supervisor:

* **Live API:** https://cyberscore-api.vercel.app (health: `/api/v1/health`)
* **Demo user:** `saanvi.vishal@iiitb.ac.in` / `cyberscore-demo-2026` (verified SOLO admin, IIIT Bangalore org, Banking industry)
* **Mobile APK download:** the Expo build link is in section 14
* **GitHub repo:** https://github.com/saanvivishal/cyberscore
* **Demo video:** [Watch on OneDrive](https://iiitbac-my.sharepoint.com/:v:/g/personal/saanvi_vishal_iiitb_ac_in/IQA6_RpGKPsHTp2JsEX8W6dVAdQG0jaFrzJQZSFKEfj32Wk) (IIIT Bangalore SharePoint, recorded 2026-05-18)

---

## 0. Project Overview

| Item | Status | Where |
|---|---|---|
| Project title | ✅ | **CyberScore: Cybersecurity Health Scorecard SaaS** |
| Short description | ✅ | A mobile-first product that lets organisations self-assess their cybersecurity posture across 46 KPIs (People, Process, Company), get a live numeric scorecard mapped to NIST CSF 2.0 and ISO 27001, and receive personalised remediation guidance from a built-in advisor. SOLO mode for individual users; ENTERPRISE mode for admins who invite employees with per-level access control. |
| Team members | ✅ | **Saanvi Vishal** (IIIT Bangalore, IMT2021043). Sole developer this batch. |
| Guide and mentor | ✅ | **Mohan Ram C**, FISST (Foundation for Innovation in Security and Software Technology) |
| Project duration | ✅ | **2026-04-15 to 2026-05-18** (around 5 weeks) |
| Repository link | ✅ | https://github.com/saanvivishal/cyberscore |

### Team and timeline

* **Institution:** International Institute of Information Technology, Bangalore (IIIT-B)
* **Roll number:** IMT2021043
* **Developer:** Saanvi Vishal
* **Mentor:** Mohan Ram C, FISST
* **Total active development:** around 5 weeks (mid-April through mid-May 2026)
* **Demo date:** 2026-05-18
* **Repository:** https://github.com/saanvivishal/cyberscore

---

## 1. README

| Item | Status | Where |
|---|---|---|
| Project overview | ✅ | [README.md](README.md) "What this is" section |
| Features list | ✅ | [README.md](README.md) "What the app does" section |
| Tech stack | ✅ | [README.md](README.md) "Tech stack" table |
| Setup instructions (quick start) | ✅ | [README.md](README.md) "Quick start" plus `./scripts/setup.sh` |
| Run instructions | ✅ | [README.md](README.md) three-terminal block (API, worker, mobile) |
| Screenshots and demo link | ✅ | Section 13 below has the demo video link plus the screenshots folder |
| FAQ and common issues | ✅ | [README.md](README.md) "Common issues" table plus [docs/known-issues.md](docs/known-issues.md) |

---

## 2. Requirements Documentation

### Functional Requirements

| Item | Status | Where |
|---|---|---|
| Clearly listed features | ✅ | [docs/requirements.md §3](docs/requirements.md). 40 functional requirements across 8 areas (auth, KPIs, scoring, AI chat, evidence, team, notifications, share). |
| User roles and permissions | ✅ | [docs/requirements.md §2](docs/requirements.md). SOLO user, ENTERPRISE admin, ENTERPRISE employee with per-level access (`User.allowedLevels`). |
| Use cases / user stories | ✅ | Combined with the FR list and the four sequence diagrams in [docs/system-design.md](docs/system-design.md). |

### Non-functional Requirements

| Item | Status | Where |
|---|---|---|
| Performance | ✅ | [docs/requirements.md §4.2](docs/requirements.md). p95 API latency targets, AI streaming first-token under 1.5 seconds. |
| Scalability | ✅ | [docs/requirements.md §4.3](docs/requirements.md). Horizontal API and worker scaling, Redis cache, prompt caching. |
| Security | ✅ | [docs/requirements.md §4.1](docs/requirements.md). Argon2id + HIBP, TOTP 2FA, JWT + opaque refresh, RLS, RFC 7807 errors, audit log. |
| Usability | ✅ | [docs/requirements.md §4.5](docs/requirements.md). Accessibility targets, dev-mode OTP autofill, glassmorphism design system. |

### Software Requirements

| Item | Status | Where |
|---|---|---|
| Programming languages | ✅ | [docs/requirements.md §5.1](docs/requirements.md). TypeScript (strict), SQL, small Python for KPI extraction. |
| Frameworks and libraries | ✅ | [docs/requirements.md §5.2](docs/requirements.md). Next.js 15, Expo SDK 52, Prisma 6, BullMQ, Zod, Pino, Anthropic SDK. |
| Tools | ✅ | [docs/requirements.md §5.3](docs/requirements.md). Turbo, npm workspaces, Prettier, ESLint, Prisma Studio, EAS CLI. |

---

## 3. System Design

### High-Level Design (HLD)

| Item | Status | Where |
|---|---|---|
| System overview diagram | ✅ | [docs/system-design.md](docs/system-design.md). Mermaid flowchart of mobile to API to Postgres, Redis, Anthropic, Expo Push, SMTP. |
| Major components and modules | ✅ | [docs/system-design.md](docs/system-design.md). Auth, scorecard, AI advisor, evidence, team, snapshot worker, SDK, mobile UI. |
| External integrations | ✅ | [docs/system-design.md](docs/system-design.md). Anthropic, Brevo email, Cloudflare R2 object storage, Expo Push, Sentry. |

### Low-Level Design (LLD)

| Item | Status | Where |
|---|---|---|
| Module-level breakdown | ✅ | [docs/system-design.md](docs/system-design.md). Scoring algorithm, auth and token flow, AI streaming pipeline, access control, snapshot worker, SDK error mapping, AuthGate hydration. |
| Class diagrams | ✅ | Mermaid `classDiagram` block for the auth module. |
| Sequence diagrams | ✅ | Four end-to-end flows: onboarding (register, OTP, first login), AI chat streaming, invite plus accept-invite, KPI submit plus snapshot recompute. |

---

## 4. Architecture

| Item | Status | Where |
|---|---|---|
| Architecture diagram | ✅ | [docs/architecture.md](docs/architecture.md). Modular monolith pattern plus a mermaid flowchart. |
| Data flow diagram | ✅ | [docs/architecture.md](docs/architecture.md). A representative request walk-through. |
| Tech stack justification | ✅ | [docs/architecture.md](docs/architecture.md) tech stack table. Every choice has a one-line reason. |
| Key design decisions and rationale | ✅ | [docs/architecture.md](docs/architecture.md). 7 decisions documented (Next.js over Express, RLS for tenancy, BullMQ for async, etc.) |

---

## 5. Codebase Readiness

| Item | Status | Notes |
|---|---|---|
| Clean folder structure | ✅ | npm workspaces plus Turbo monorepo. `apps/` (api + mobile), `packages/` (sdk + types), `docs/`. Documented in the [README.md](README.md) "Repo layout" section. |
| No unnecessary files | ✅ | `.next`, `node_modules`, `.turbo`, build artifacts, `.env`, `.DS_Store` are all gitignored. Verified with `git status --ignored`. |
| Naming conventions | ✅ | camelCase TypeScript, kebab-case file routes, PascalCase React components, snake_case Postgres tables (mapped through `@@map` in Prisma). |
| Comments for complex logic | ✅ | Block comments above non-obvious functions, especially in `lib/scorecard.ts` (tiered scoring with consensus rollup), `lib/auth.ts` (refresh-token rotation), `messages/route.ts` (SSE stream and prompt caching), `lib/advisor-local.ts` (intent detection and sector primer). |
| Docstrings and inline docs | 🟡 | Route handlers carry header doc blocks explaining purpose and auth posture. Many `lib/` exports rely on TypeScript signatures alone. Fine for an internal codebase. If you publish `@cyberscore/sdk` externally, add JSDoc to public exports. |

---

## 6. Dependency and Environment Setup

| Item | Status | Where |
|---|---|---|
| Dependency files present | ✅ | `package.json` at the repo root plus one in each workspace (`apps/api`, `apps/mobile`, `packages/sdk`, `packages/types`). |
| Versions specified | ✅ | All package versions pinned with caret ranges (`^X.Y.Z`). `package-lock.json` is committed for exact reproducibility. |
| `.env.example` file included | ✅ | Repo root [.env.example](.env.example) plus per-app `apps/api/.env.example` and `apps/mobile/.env.example`. |
| Environment variables documented | ✅ | Every var has an inline comment in `.env.example`. Production vars are also covered in [docs/deployment.md](docs/deployment.md). |
| Setup instructions verified | ✅ | Tested end to end. [scripts/setup.sh](scripts/setup.sh) automates: install deps, copy `.env`, `prisma migrate dev`, `prisma db seed`. |

---

## 7. Database Documentation

| Item | Status | Where |
|---|---|---|
| Database schema | ✅ | `apps/api/prisma/schema.prisma` is the single source of truth. 24 tables, around 150 columns, around 30 indexes. |
| Migration files | ✅ | 7 migrations in `apps/api/prisma/migrations/`: init, enterprise_mode, per_user_progress, add_allowed_levels, add_chat_threads, add_response_matched_tier_relation, rls_policies. |
| ER diagram | ✅ | [docs/database.md](docs/database.md). Mermaid `erDiagram` covering all 24 tables and their relationships. |
| Sample / seed data | ✅ | `apps/api/prisma/seed.ts` upserts 46 KPIs, 212 scoring tiers, and 92 personalised suggestions, extracted from `SCORE CARD_KPI_CYBER SEC_PPT_V0.9.xlsx` through `prisma/seed/extract-kpis.py`. Plus `apps/api/scripts/seed-demo-user.ts` plants the demo user against the live Neon DB. |
| Setup instructions | ✅ | [docs/database.md](docs/database.md). Covers local Postgres install, Prisma migrate, seed, and Neon for production. |

---

## 8. Deployment ✅ LIVE

This section was previously marked "planning document only". As of 2026-05-18 the project is fully deployed and accessible from any internet-connected device.

| Item | Status | Where |
|---|---|---|
| Deployment steps documented | ✅ | [docs/deployment.md](docs/deployment.md) now reflects the actual deployed setup, not just a plan. |
| Hosting platforms | ✅ | API on Vercel (https://cyberscore-api.vercel.app). Postgres on Neon (Singapore region). Redis on Upstash (Singapore region). Email through Brevo (300 emails per day free tier). Mobile distribution through Expo EAS Build (Android APK installable over the internet). All on free tiers. |
| Environment configs for production | ✅ | All 15+ env vars configured in Vercel under Project Settings, Environment Variables (Production and Preview). Secrets are marked sensitive. Local dev vars stay in `.env` (gitignored). |
| CI/CD pipeline | 🟡 | Git push to GitHub triggers Vercel auto-deploy on `main`. No GitHub Actions workflow yet because there is no test suite to run. A template is in [docs/deployment.md](docs/deployment.md) for the next batch. |
| Cold-start mitigation | ✅ | A `cron-job.org` job (free) pings `/api/v1/health` every 2 minutes. This keeps Vercel's serverless functions warm so the first user request after idle does not pay the 5 to 10 second cold-start tax. Important for the demo. |
| Email delivery | ✅ | Brevo HTTPS API (not SMTP, because Vercel serverless throttles raw TCP on ports 465 and 587). Auto-detected from the `SMTP_PASS` prefix in `apps/api/src/lib/email.ts`. |
| Keep-warm cron | ✅ | https://console.cron-job.org. One job hits `/api/v1/health` every 2 minutes. Account belongs to `saanvivishal@gmail.com`. |

See [docs/deployment.md](docs/deployment.md) for the full deployment runbook with every command, every env var, and every gotcha encountered.

### The deployment story in short

1. **GitHub repo** is connected to **Vercel** through the Vercel GitHub app. Any push to `main` builds and deploys automatically. Preview deploys go up for every PR.
2. **Vercel** runs the Next.js API in serverless mode. There are no servers to manage. Cold starts are mitigated by the keep-warm cron.
3. **Neon** hosts Postgres in Singapore. The free tier gives 3 GB of storage which is plenty for the 24-table schema. Pooled connection through the Neon serverless driver.
4. **Upstash** hosts Redis in Singapore. Free tier is 10,000 commands per day, which fits rate limits and queue housekeeping.
5. **Brevo** sends transactional emails through their HTTPS REST API. 300 free emails per day, no credit card. The provider is detected automatically from the `SMTP_PASS` prefix.
6. **Cloudflare R2** holds evidence file uploads. The API mints a presigned PUT URL scoped to the tenant prefix, valid for 5 minutes.
7. **Expo EAS** builds the Android APK with `EXPO_PUBLIC_API_URL=https://cyberscore-api.vercel.app` baked into the bundle. Download link is in section 14.
8. **cron-job.org** runs the keep-warm cron. One job, no maintenance.

---

## 9. Testing

| Item | Status | Notes |
|---|---|---|
| Unit tests available | ⚪ | None yet. vitest is wired in `apps/api/package.json` but the test directories are empty. |
| Integration tests available | ⚪ | Same story. Wired but empty. |
| Manual test coverage | ✅ | End-to-end smoke tested manually: register, OTP, login, assessment, scorecard, chat, team admin, password reset (with a live Brevo email). Documented in [docs/testing-manual.md](docs/testing-manual.md). |
| Test execution steps documented | ✅ | `npm run test` from the repo root, or `npm run test --workspace @cyberscore/api`. See [CONTRIBUTING.md](CONTRIBUTING.md) "Tests" section. |
| Known failing tests | n/a | No tests means no failing tests. |

**Priority test targets** for the next batch. Pick at least the top 3 if you can:

1. `lib/scoring.ts`. Pure functions, easy unit tests, high value.
2. `lib/scorecard.ts`. Pure aggregation logic, mock the Prisma client.
3. `lib/access.ts`. Small but security-critical (`effectiveAllowedLevels()`).
4. `lib/auth.ts`. Token issuance and revocation.
5. Auth route handlers. Integration tests with a Postgres test DB.

---

## 10. Sprint Documentation, see [docs/sprints.md](docs/sprints.md)

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
| Task breakdown | ✅, by sprint in [docs/sprints.md](docs/sprints.md) |
| Timeline per sprint | ✅ |
| Assigned responsibilities | ✅, sole developer (Saanvi Vishal) |
| Completed tasks per sprint | ✅ |
| Sprint review summary | ✅ |
| Sprint retrospective | ✅, what worked and what did not, at the end of each sprint section |

---

## 11. Roadmap and Future Work

| Item | Status | Where |
|---|---|---|
| Pending features | ✅ | [docs/roadmap.md](docs/roadmap.md) "Near-term" section. 7 features sized as S, M, or L. |
| Suggested improvements | ✅ | [docs/roadmap.md](docs/roadmap.md) "Highest priority" section. Production-readiness items: tests, CI, RLS verification. |
| Priority areas for next batch | ✅ | [docs/roadmap.md](docs/roadmap.md) "Highest priority". Start here, everything else is icing. |
| What we deliberately rejected | ✅ | [docs/roadmap.md](docs/roadmap.md) "Things we deliberately decided NOT to do" section. Context for the "why didn't you just..." questions. |

---

## 12. Known Issues and Limitations

| Item | Status | Where |
|---|---|---|
| Bugs not fixed | ✅ | [docs/known-issues.md §A](docs/known-issues.md). Current open items plus the long list of fixed-in-v0.3.0 items. |
| Performance limitations | ✅ | [docs/known-issues.md §C](docs/known-issues.md). Vercel cold starts (mitigated, not eliminated), per-user KPI cache, no transaction around snapshot enqueue. |
| Edge cases not handled | ✅ | [docs/known-issues.md §B and §D](docs/known-issues.md). Incomplete features and operational gaps. |

**What got fixed since v0.1.0**, see the version-by-version log in [docs/known-issues.md](docs/known-issues.md). Highlights:

* RLS policies applied to 19 tenant-scoped tables (v0.2.0)
* All 5 pre-existing TypeScript errors resolved (v0.2.0)
* Local rule-based advisor replaces Anthropic for chat. Zero API cost. (v0.2.0)
* Vercel deployment working end to end through 5 different failure modes (v0.3.0)
* Brevo email delivery through the HTTP API (v0.3.0)
* Cold-start mitigation through cron-job.org keep-warm (v0.3.0)
* Onboarding carousel is reachable again (v0.3.0). `index.tsx` was hardcoded to skip it.
* KPI question screen perf. Sequential writes parallelised, fire-and-forget invalidations (v0.3.0, around 2 to 3 times faster click-to-next).

---

## 13. Demo and Presentation

| Item | Status | Notes |
|---|---|---|
| Final report (PDF) | ✅ | `docs/cyberscore-final-report.pdf`. Generated by `docs/generate_handover_pdf.py`. Combines the written report and the slide outline in one file. |
| Presentation slides outline | ✅ | Embedded as Part 2 of `docs/cyberscore-final-report.pdf` (slides 18 to 24 of the PDF). Saanvi to drop these onto her real slide template before the presentation. |
| Demo video | ✅ | Recorded 2026-05-18, around 4 to 5 minutes. Hosted on IIIT Bangalore SharePoint: [Watch on OneDrive](https://iiitbac-my.sharepoint.com/:v:/g/personal/saanvi_vishal_iiitb_ac_in/IQA6_RpGKPsHTp2JsEX8W6dVAdQG0jaFrzJQZSFKEfj32Wk). Access scoped to the IIITB tenant. Mohan Ram C should have view access through his FISST account. Verify before sharing externally. |
| Screenshots | ✅ | `demo/screenshots/` includes onboarding, dashboard, assessment, scorecard, AI chat, and team admin captures. |

### Demo video walkthrough (what is shown)

The recording covers the full happy path:

1. **(0:00 to 0:15)** App launch on Samsung. **Onboarding carousel** (Security Scans, Live Scorecard, AI Insights), then Skip.
2. **(0:15 to 0:35)** Login with `saanvi.vishal@iiitb.ac.in` and `cyberscore-demo-2026`. Vercel API responds, JWT issued, dashboard hydrates.
3. **(0:35 to 1:15)** Dashboard tour: overall score ring, People / Process / Company level tiles, last-snapshot date, resume-assessment CTA.
4. **(1:15 to 2:00)** Assessment flow: pick the PEOPLE level, answer a few KPIs (multi-choice tiers and percentage input), observe the optimistic Next-button transition.
5. **(2:00 to 2:30)** Scorecard breakdown: per-level scores, per-KPI breakdown, red / amber / green bands.
6. **(2:30 to 3:15)** Analytics tab: historical snapshot timeline plus personalised suggestions per underperforming KPI.
7. **(3:15 to 4:00)** AI chat: ask "where am I weakest" and the local advisor streams a Banking-sector-specific reply mentioning PCI DSS and RBI guidelines, grounded in the actual scorecard.
8. **(4:00 to 4:30)** Profile and framework picker (admin-only).
9. **(4:30 to 5:00)** Password reset flow. Forgot, enter email, OTP arrives in the IIITB Gmail inbox (Brevo), enter OTP, set a new password, log back in.

### Suggested presentation slides

A 6-slide deck is sufficient and is the layout used in `docs/cyberscore-final-report.pdf` Part 2:

1. **Title.** CyberScore, presenter, mentor, institution, date.
2. **Problem and Solution.** Why cybersecurity self-assessment matters and how CyberScore solves it.
3. **Architecture and Tech Stack.** The mermaid diagram from `docs/architecture.md` plus the tech stack table.
4. **Live Demo.** Embed or link to the demo video.
5. **Deployment and Process.** What is deployed, on what tier, plus the 5-sprint timeline.
6. **Lessons Learned and Thanks.** What was learned, what to avoid, gratitude to Mohan Ram and IIITB.

---

## 14. Access and Credentials Transfer

Every cloud service used by CyberScore, who controls it, where to log in, and how to gain access. **No secrets are written in this document.** Secrets live in Vercel Environment Variables (production) and `apps/api/.env` (local, gitignored).

See [docs/access-credentials.md](docs/access-credentials.md) for the in-depth version with rotation procedures.

### Live services

| Service | What it does | Who owns the account | URL |
|---|---|---|---|
| **GitHub** | Source repo | `@saanvivishal` (saanvivishal@gmail.com) | https://github.com/saanvivishal/cyberscore |
| **Vercel** | Hosts the API | `saanvivishal@gmail.com` (Hobby tier, free) | https://vercel.com/saanvivishals-projects/cyberscore-api |
| **Neon** | Production Postgres (Singapore region) | `saanvivishal@gmail.com` (Free tier) | https://console.neon.tech |
| **Upstash** | Production Redis (Singapore region) | `saanvivishal@gmail.com` (Free tier) | https://console.upstash.com |
| **Brevo** | Transactional email (OTP, invites). 300 per day free. | `saanvivishal@gmail.com` (Free tier, registered as "iiit bangalore") | https://app.brevo.com |
| **Expo / EAS** | Mobile app build and distribution | Expo username: `saanviiiiiiiiiiiiii` (GitHub OAuth) | https://expo.dev/accounts/saanviiiiiiiiiiiiii |
| **cron-job.org** | Free keep-warm cron pinging `/health` every 2 min | `saanvivishal@gmail.com` | https://console.cron-job.org |

### Local secrets (NOT in this repo)

These exist on Saanvi's laptop in `apps/api/.env` and a copy in Vercel Environment Variables for production:

* `JWT_SECRET` (64+ random chars)
* `REFRESH_TOKEN_SECRET` (64+ random chars)
* `TOTP_ENCRYPTION_KEY` (64 hex chars)
* `DATABASE_URL` and `DIRECT_DATABASE_URL` (Neon connection strings)
* `REDIS_URL` (Upstash connection string)
* `SMTP_PASS` (Brevo API key, format `xkeysib-...`)
* `ANTHROPIC_API_KEY` (only used if `USE_LOCAL_ADVISOR=false`)

### Transferring access to the next batch

When the next batch or FISST takes over, the cleanest path is:

1. **GitHub.** Add their email as a repo collaborator (Settings, Collaborators, Add people). Or transfer ownership to a FISST GitHub organisation.
2. **Vercel.** Invite them to the project (Settings, Members, Invite). They will get an email link.
3. **Neon.** Free tier supports one user per project, so either transfer the project to their email or share the connection string and they will add it to their own Vercel.
4. **Upstash.** Same. Share the connection string or transfer the project.
5. **Brevo.** Either share the API key (and rotate yours), or they can sign up fresh and update `SMTP_PASS` in Vercel.
6. **Expo.** Add them as a team member to the Expo organisation (Settings, Members).
7. **cron-job.org.** They can sign up fresh and recreate the single cron job in 2 minutes. URL: `https://cyberscore-api.vercel.app/api/v1/health`, every 2 minutes.

### ⚠️ Before transfer, rotate every secret

The current secrets have passed through development conversations, so they should not be the long-lived production secrets:

* Rotate `JWT_SECRET` and invalidate all existing sessions
* Rotate `REFRESH_TOKEN_SECRET` and invalidate all refresh tokens
* Rotate `TOTP_ENCRYPTION_KEY` (this will invalidate any existing TOTP enrolments; fine for this demo, but warn users in production)
* Regenerate the Brevo API key and update Vercel env
* If Anthropic was ever switched on, regenerate the API key
* If Neon or Upstash connection strings were ever shared through chat or email, rotate those too. Both consoles have a "Reset Password" button.
* Verify `.env` is not in any commit ever: `git log --all --full-history --source -- '*/.env'`. Should return nothing.

---

## 15. Versioning and Releases

| Item | Status | Where |
|---|---|---|
| Version tags | ✅ | `v0.1.0` (initial docs), `v0.2.0` (advisor and RLS), `v0.3.0` (live deployment and demo). Tagged with `git tag -a vX.Y.Z -m "..."`. |
| CHANGELOG.md maintained | ✅ | [CHANGELOG.md](CHANGELOG.md). Keep a Changelog format, three releases documented. |

---

## 16. Contribution Guidelines

| Item | Status | Where |
|---|---|---|
| Branching strategy | ✅ | [CONTRIBUTING.md](CONTRIBUTING.md) "Branching" section. `main` is protected, feature branches named `feat/foo` or `fix/bar`, squash-merge on PR. |
| Commit message format | ✅ | [CONTRIBUTING.md](CONTRIBUTING.md) "Commits" section. Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `perf:`, `test:`). |
| Pull request process | ✅ | [CONTRIBUTING.md](CONTRIBUTING.md) "Pull requests" section. Body must explain why, link to the issue, and include a test plan. |

---

## 17. GitHub Hygiene

| Item | Status | Notes |
|---|---|---|
| Issues cleaned and labeled | 🟡 | No open issues at handover. As the next batch picks up roadmap items, they should be opened as issues with labels (`bug`, `feature`, `tech-debt`, `good-first-issue`). |
| TODOs converted to issues | 🟡 | All TODO and FIXME comments are stripped from the code. Open work items live in [docs/known-issues.md](docs/known-issues.md) and [docs/roadmap.md](docs/roadmap.md). The next batch can convert each line item to a GitHub issue. |
| Dead branches removed | ✅ | Only `main` exists on the remote at handover. Verify with `git branch -r`. |
| `.env` in history | ✅ | Verified. `git log --all -- '*/.env'` returns nothing. The author email was rewritten from the old default to `saanvivishal@gmail.com` for clean attribution. |

---

## 18. License

| Item | Status | Where |
|---|---|---|
| License file added | ✅ | [LICENSE](LICENSE), MIT. Chosen for permissive academic and future commercial use. Copyright held by Saanvi Vishal. |

---

## 19. Handover Notes (Critical)

A longer narrative version is in [docs/handover-notes.md](docs/handover-notes.md). Headlines for the supervisor:

| Item | Status | Where |
|---|---|---|
| Key decisions explained | ✅ | [docs/architecture.md](docs/architecture.md) "Key design decisions" section (7 architectural decisions with rationale) plus [docs/handover-notes.md](docs/handover-notes.md) "Decision log" (additional product-level decisions made during the build). |
| Challenges faced | ✅ | [docs/handover-notes.md](docs/handover-notes.md) "Challenges" section. Covers the macOS Gatekeeper blocker on Android Studio, the 5-stage Vercel deployment debugging saga, the Resend to Brevo email pivot, and the cold-start mitigation discovery. |
| Lessons learned | ✅ | [docs/handover-notes.md](docs/handover-notes.md) "Lessons learned" section. 8 lessons that would shorten the next batch's timeline by an estimated 2 weeks. |
| Tips for next batch | ✅ | [docs/handover-notes.md](docs/handover-notes.md) "Tips for next batch" section. "Before you touch anything, do these 5 things". |
| Things to avoid | ✅ | [docs/handover-notes.md](docs/handover-notes.md) "Things to avoid" section. Common rabbit holes (Vercel SMTP, Android Studio for an Expo app, etc.). |

---

## 20. Misc

| Item | Status | Notes |
|---|---|---|
| Docker setup | ⚠️ deliberately deferred | Not needed for the current Vercel deployment. Next.js `output: 'standalone'` is configured (only when `process.env.VERCEL` is unset), so a future Dockerfile is about half a day's work. Skipped now because adding a Docker config we do not actually use is dead weight. |
| Setup automation script | ✅ | [scripts/setup.sh](scripts/setup.sh) bootstraps a fresh clone in one command. |
| Seed-demo-user script | ✅ | `apps/api/scripts/seed-demo-user.ts` plants the verified demo user against any DATABASE_URL. Used to seed the live Neon DB. |
| Makefile / CLI shortcuts | ⚠️ deliberately deferred | npm scripts in `package.json` already cover this. A Makefile would just wrap them. |

---

## Folder structure compliance

The supervisor's checklist suggests:

```
project-root/
  src/
  docs/
    requirements/
    design/
    architecture/
    sprints/
    deployment/
  tests/
  scripts/
  .env.example
  README.md
  HANDOVER_CHECKLIST.md
  CHANGELOG.md
  docker-compose.yml (optional)
```

Our structure is a monorepo, not single-app, so the top-level `src/` does not apply. We replace it with `apps/` (api + mobile) plus `packages/` (sdk + types). Everything else maps directly:

| Suggested | Our equivalent | Status |
|---|---|---|
| `src/` | `apps/`, `packages/` | ✅ |
| `docs/requirements/` | `docs/requirements.md` (single file, easier end-to-end read) | ✅ |
| `docs/design/` | `docs/system-design.md` | ✅ |
| `docs/architecture/` | `docs/architecture.md` | ✅ |
| `docs/sprints/` | `docs/sprints.md` | ✅ |
| `docs/deployment/` | `docs/deployment.md` | ✅ |
| `tests/` | Currently empty. Tests will live next to source as `*.test.ts` when added (vitest auto-discovery). | ⚪ |
| `scripts/` | ✅ | ✅ |
| `.env.example` | ✅ (root and per-app) | ✅ |
| `README.md` | ✅ | ✅ |
| `HANDOVER_CHECKLIST.md` | ✅ (this file) | ✅ |
| `CHANGELOG.md` | ✅ | ✅ |
| `docker-compose.yml` | Not added, see section 20 | ⚠️ |

---

## Final pre-handover checklist

The bullet list to run through right before emailing Mohan Ram C:

* [x] All 20 sections above have at least 🟡 status
* [x] `git status` is clean
* [x] `npm run typecheck` passes (0 errors)
* [x] `npm run lint` passes
* [x] `./scripts/setup.sh` runs cleanly on a fresh clone
* [x] `.env` is not committed. `git log --all -- '*/.env'` returns nothing
* [x] Repository pushed to GitHub with the `v0.3.0` tag
* [x] Vercel API is live and responding 200 at `/api/v1/health`
* [x] Neon DB seeded with the KPI catalogue and the demo user
* [x] Demo APK installed and tested on Samsung
* [x] Demo video recorded (around 4 minutes)
* [x] Demo video uploaded to IIITB SharePoint, link in [README.md](README.md) and in this file
* [x] Final report PDF generated at `docs/cyberscore-final-report.pdf`
* [ ] FISST account added as a GitHub repo collaborator
* [ ] All long-lived secrets rotated (see section 14)
* [ ] Handover email sent to Mohan Ram C with this checklist, the demo video link, the final report PDF, the repo link, and the demo account credentials

---

**Status:** Handover-ready as of 2026-05-18. CyberScore is fully deployed, demoable, and documented. The next batch can clone the repo, run `./scripts/setup.sh`, and have a working local dev environment in under 10 minutes.
