# Handover Checklist

> Companion to `Project Handover Checklist.docx` shared by Mohan Ram C. Every item from that checklist is reproduced below with its status and a link to where it's covered.

**Legend:** ✅ done · 🟡 partial · ⚪️ not done · ⚠️ deliberately deferred

---

## 0. Project Overview

| Item | Status | Where |
|---|---|---|
| Project title | ✅ | [README.md](README.md) |
| Short description (what problem it solves) | ✅ | [README.md](README.md) — top section |
| Team members (previous batch) | ⚪️ | **Saanvi to fill in** below |
| Guide/mentor details | 🟡 | Mohan Ram C, FISST — please confirm full title before publishing |
| Project duration | ⚪️ | **Saanvi to fill in** |
| Repository link | ⚪️ | **To be added once pushed to GitHub** |

### Team & timeline (please fill before submission)

- **Batch:** [IIITB batch name / year]
- **Team members:** Saanvi Vishal — [+ teammates if any]
- **Mentor:** Mohan Ram C (FISST)
- **Duration:** [start date] – [handover date]
- **Repository:** `https://github.com/[org-or-user]/cyberscore`

---

## 1. README

| Item | Status | Where |
|---|---|---|
| Project overview | ✅ | [README.md](README.md) — *What is this?* |
| Features list | ✅ | [README.md](README.md) — *Features at a glance* |
| Tech stack | ✅ | [README.md](README.md) — *Tech stack* table |
| Setup instructions (quick start) | ✅ | [README.md](README.md) — *Quick start* |
| Run instructions | ✅ | [README.md](README.md) — three-terminal block |
| Screenshots / demo link | ⚪️ | **Saanvi to add after recording the demo video** |
| FAQ / common issues | ✅ | [README.md](README.md) — *Common issues* + [docs/known-issues.md](docs/known-issues.md) |

---

## 2. Requirements Documentation

### Functional Requirements

| Item | Status | Where |
|---|---|---|
| Clearly listed features | ✅ | [docs/requirements.md §3](docs/requirements.md#3-functional-requirements) — 40 FRs across 8 areas |
| User roles and permissions | ✅ | [docs/requirements.md §2](docs/requirements.md#2-user-roles--permissions) |
| Use cases / user stories | ✅ | Covered via the FR list + [docs/system-design.md flows](docs/system-design.md#critical-end-to-end-flows) |

### Non-Functional Requirements

| Item | Status | Where |
|---|---|---|
| Performance requirements | ✅ | [docs/requirements.md §4.2](docs/requirements.md#42-performance) |
| Scalability considerations | ✅ | [docs/requirements.md §4.3](docs/requirements.md#43-scalability) |
| Security requirements | ✅ | [docs/requirements.md §4.1](docs/requirements.md#41-security) |
| Usability expectations | ✅ | [docs/requirements.md §4.5](docs/requirements.md#45-usability) |

### Software Requirements

| Item | Status | Where |
|---|---|---|
| Programming languages | ✅ | [docs/requirements.md §5.1](docs/requirements.md#51-languages) |
| Frameworks/libraries | ✅ | [docs/requirements.md §5.2](docs/requirements.md#52-frameworks--key-libraries) |
| Tools used | ✅ | [docs/requirements.md §5.3](docs/requirements.md#53-tools) |

---

## 3. System Design

### High-Level Design (HLD)

| Item | Status | Where |
|---|---|---|
| System overview diagram | ✅ | [docs/system-design.md — System context](docs/system-design.md#system-context) (mermaid) |
| Major components/modules | ✅ | [docs/system-design.md — Major modules](docs/system-design.md#major-modules) |
| External integrations (APIs/services) | ✅ | [docs/system-design.md — External integrations](docs/system-design.md#external-integrations) |

### Low-Level Design (LLD)

| Item | Status | Where |
|---|---|---|
| Module-level breakdown | ✅ | [docs/system-design.md — Low-Level Design](docs/system-design.md#low-level-design-lld) (scoring, auth, AI streaming, access control, snapshot worker, SDK, AuthGate) |
| Class diagrams | ✅ | Mermaid `classDiagram` for auth module |
| Sequence diagrams (if applicable) | ✅ | Four end-to-end sequence diagrams: onboarding, chat streaming, invite + accept, KPI submit + snapshot |

---

## 4. Architecture

| Item | Status | Where |
|---|---|---|
| Architecture diagram (e.g., MVC, microservices) | ✅ | [docs/architecture.md](docs/architecture.md) — modular monolith pattern + mermaid flowchart |
| Data flow diagram | ✅ | [docs/architecture.md — Data flow](docs/architecture.md#data-flow--a-representative-request) |
| Tech stack justification | ✅ | [docs/architecture.md — Tech stack table](docs/architecture.md#tech-stack--why-each-piece) |
| Key design decisions + rationale | ✅ | [docs/architecture.md — Key design decisions](docs/architecture.md#key-design-decisions) — 7 decisions documented |

---

## 5. Codebase Readiness

| Item | Status | Notes |
|---|---|---|
| Clean folder structure | ✅ | npm workspaces + Turbo monorepo; documented in [README.md](README.md#repository-layout) |
| No unnecessary files | ✅ | `.next`, `node_modules`, `.turbo`, build artifacts all gitignored |
| Proper naming conventions | ✅ | camelCase TS, kebab-case file routes, PascalCase components |
| Comments for complex logic | ✅ | Inline explanations especially in `lib/scorecard.ts`, `lib/auth.ts`, `messages/route.ts` |
| Docstrings / inline documentation | 🟡 | Route handlers carry header doc blocks; many `lib/` exports lack JSDoc. Acceptable for an internal codebase; revisit if opening up the SDK externally |

---

## 6. Dependency & Environment Setup

| Item | Status | Where |
|---|---|---|
| Dependency file present | ✅ | `package.json` at root + each workspace |
| Versions specified | ✅ | All package versions pinned (`^X.Y.Z`) |
| `.env.example` file included | ✅ | Repo root |
| Environment variables documented | ✅ | [docs/deployment.md — Environment variables](docs/deployment.md#environment-variables) + comments in `.env.example` |
| Setup instructions verified | ✅ | Tested end-to-end; [scripts/setup.sh](scripts/setup.sh) automates it |

---

## 7. Database Documentation

| Item | Status | Where |
|---|---|---|
| Database schema (SQL / migration files) | ✅ | `apps/api/prisma/schema.prisma` (authoritative) + 5 migrations in `apps/api/prisma/migrations/` |
| ER diagram | ✅ | [docs/database.md — ER diagram](docs/database.md#er-diagram) (mermaid) |
| Sample/seed data | ✅ | `apps/api/prisma/seed.ts` + `prisma/seed/extract-kpis.py` populate 46 KPIs / 212 tiers / 92 suggestions |
| Setup instructions | ✅ | [docs/database.md — Setup](docs/database.md#setup) |

---

## 8. Deployment

| Item | Status | Where |
|---|---|---|
| Deployment steps documented | ✅ | [docs/deployment.md](docs/deployment.md) — per-component runbook |
| Hosting platform details | ✅ | Recommended: Vercel + Render + Supabase + Upstash + R2 + EAS. See [docs/deployment.md — Recommended hosting](docs/deployment.md#recommended-hosting) |
| Environment configs for production | ✅ | [docs/deployment.md — Environment variables](docs/deployment.md#environment-variables) |
| CI/CD pipeline | ⚪️ | Not yet wired. Template provided in [docs/deployment.md — CI/CD](docs/deployment.md#cicd) for next batch to drop in |

---

## 9. Testing

| Item | Status | Notes |
|---|---|---|
| Unit tests available | ⚪️ | **None yet.** vitest is wired (`apps/api`); test directories empty |
| Integration tests available | ⚪️ | Same |
| Test execution steps documented | ✅ | `npm run test` from root or workspace; see [CONTRIBUTING.md — Tests](CONTRIBUTING.md#tests) |
| Known failing tests (if any) | n/a | No tests = no failing tests |

> **Priority test targets** for the next batch: `lib/scoring.ts`, `lib/scorecard.ts`, `lib/access.ts`, `lib/auth.ts`. See [docs/roadmap.md](docs/roadmap.md) and [docs/known-issues.md §B2](docs/known-issues.md#b2-no-tests).

---

## 10. Sprint Documentation

### Sprint Planning

| Item | Status |
|---|---|
| Sprint goals defined | ⚪️ |
| Task breakdown (Jira / GitHub Issues / docs) | ⚪️ |
| Timeline per sprint | ⚪️ |
| Assigned responsibilities | ⚪️ |

### Sprint Execution

| Item | Status |
|---|---|
| Completed tasks per sprint | ⚪️ |
| Daily/weekly updates | ⚪️ |
| Sprint review summary | ⚪️ |
| Sprint retrospective (what worked / didn't) | ⚪️ |

> **Saanvi:** these are the items where my code can't help — only you know your sprint history. If you have notes / a Jira board / a Notion doc, drop them into `docs/sprints/` and link them here. If not, a short retrospective covering: weeks worked, major milestones (e.g. "Week 3: shipped enterprise mode"), what slipped, and what you'd do differently is sufficient.

---

## 11. Roadmap & Future Work

| Item | Status | Where |
|---|---|---|
| Pending features | ✅ | [docs/roadmap.md](docs/roadmap.md) — near-term + mid-term sections |
| Suggested improvements | ✅ | [docs/roadmap.md](docs/roadmap.md) — production-readiness section |
| Priority areas for next batch | ✅ | [docs/roadmap.md — Highest priority](docs/roadmap.md#highest-priority--production-readiness) |

---

## 12. Known Issues & Limitations

| Item | Status | Where |
|---|---|---|
| Bugs not fixed | ✅ | [docs/known-issues.md §A](docs/known-issues.md#a-bugs-youll-trip-over) — 7 items |
| Performance limitations | ✅ | [docs/known-issues.md §C](docs/known-issues.md#c-architectural-gaps) |
| Edge cases not handled | ✅ | [docs/known-issues.md §B+C](docs/known-issues.md) |

---

## 13. Demo & Presentation

| Item | Status |
|---|---|
| Final report (PDF/DOC) | ⚪️ **Saanvi to compile** — most of the content is in docs/ ready to be exported |
| Presentation slides (PPT) | ⚪️ **Saanvi to create** |
| Demo video | ⚪️ **Saanvi to record** — suggested 3–5min walkthrough: register → assessment → scorecard → AI chat → team admin |
| Screenshots | ⚪️ **Saanvi to capture** from the running app |

> Suggested order for the demo video:
> 1. (10s) Splash + login as the seed account
> 2. (30s) Dashboard tour — score ring, level tiles, company rollup
> 3. (60s) Pick a KPI, answer it, watch the score update
> 4. (30s) Analytics tab — trend chart + personalised suggestions
> 5. (60s) CHAT tab — ask "where am I weakest?", watch streaming response
> 6. (30s) Profile → switch framework (if admin) or show locked framework (if employee)
> 7. (30s) [Optional] Show enterprise team management — invite an employee with restricted levels
> 8. (10s) Quick code peek: schema.prisma + one route handler

---

## 14. Access & Credentials Transfer

| Item | Status | Notes |
|---|---|---|
| GitHub repository access | ⚪️ | **Once pushed:** add the FISST email Mohan Ram C provides as a repo admin |
| Deployment platform access | n/a | No prod deployment yet |
| API/service accounts | ⚪️ | Anthropic API key in `apps/api/.env` (rotate before handover) |

### ⚠️ Before handover

- [ ] **Rotate the Anthropic API key** — the one currently in `.env` passed through development conversations and should not be the prod key
- [ ] Verify `.env` is in `.gitignore` (it is)
- [ ] Run `git log --all --full-history --source -- '*/.env'` to confirm no `.env` ever got committed
- [ ] If found in history, use `git filter-repo` to scrub before pushing public

---

## 15. Versioning & Releases

| Item | Status | Where |
|---|---|---|
| Version tags (v1.0, v1.1) | ✅ | `v0.1.0` tagged on initial handover commit |
| CHANGELOG.md maintained | ✅ | [CHANGELOG.md](CHANGELOG.md) — pre-populated with the 0.1.0 release notes |

---

## 16. Contribution Guidelines

| Item | Status | Where |
|---|---|---|
| Branching strategy documented | ✅ | [CONTRIBUTING.md — Branching](CONTRIBUTING.md#branching) |
| Commit message format defined | ✅ | [CONTRIBUTING.md — Commits](CONTRIBUTING.md#commits) — Conventional Commits |
| Pull request process explained | ✅ | [CONTRIBUTING.md — Pull requests](CONTRIBUTING.md#pull-requests) |

---

## 17. GitHub Hygiene

| Item | Status | Notes |
|---|---|---|
| Issues cleaned and labeled | n/a | Repo not yet pushed |
| TODOs converted to issues | 🟡 | Open TODOs are documented in [docs/known-issues.md](docs/known-issues.md) and [docs/roadmap.md](docs/roadmap.md); convert each to a GitHub issue after pushing |
| Dead branches removed | n/a | Will apply after push |

---

## 18. License

| Item | Status | Where |
|---|---|---|
| License file added | ✅ | [LICENSE](LICENSE) — MIT |

---

## 19. Handover Notes

| Item | Status | Where |
|---|---|---|
| Key decisions explained | ✅ | [docs/architecture.md — Key design decisions](docs/architecture.md#key-design-decisions) — 7 explained |
| Challenges faced | 🟡 | [docs/known-issues.md](docs/known-issues.md) — bugs and gotchas. Personal/process challenges → **Saanvi to add** if relevant |
| Lessons learned | ⚪️ | **Saanvi to add** — a short "if I were starting over" section, even 5 bullets, helps the next batch |
| Tips for next batch | ✅ | [docs/known-issues.md](docs/known-issues.md) + [docs/roadmap.md — Highest priority](docs/roadmap.md#highest-priority--production-readiness) — the next batch should start by applying RLS policies, fixing the 4 TS errors, and writing the first tests |
| Things to avoid | ✅ | [docs/roadmap.md — Things we deliberately decided NOT to do](docs/roadmap.md#things-we-deliberately-decided-not-to-do) |

### Suggested "Lessons learned" section (Saanvi to expand)

A starting point — replace with your own:

- **Single source of truth pays off.** Putting Zod schemas in `packages/types` and importing them from both API and mobile saved hours of "request shape drift" debugging.
- **RLS over application-layer tenant checks.** The `withTenant(orgId, fn)` pattern made it impossible to forget a `where: { orgId }` clause. (Caveat: need to actually apply the policies — see known-issues.)
- **Prompt caching is huge for chat cost.** First turn pays full price; every follow-up within 5 min is ~10%. Structure your system prompt so the cacheable part comes first.
- **React Native old-arch + streaming fetch don't mix.** Use `react-native-sse`. Don't waste a day trying to make `Response.body.getReader()` work.
- **Dev-mode OTP inline saved testing.** Returning OTPs in API responses when `NODE_ENV=development` means SMTP isn't a hard dependency for local work. Worth replicating in any future flow that sends codes by email.

---

## 20. Misc

| Item | Status | Notes |
|---|---|---|
| Docker setup (Dockerfile, docker-compose.yml) | ⚪️ | Not included. Next.js `output: 'standalone'` is configured, making it Docker-friendly; a `Dockerfile` is a few hours of work for the next batch |
| Setup automation script | ✅ | [scripts/setup.sh](scripts/setup.sh) |
| Makefile / CLI shortcuts | ⚪️ | The npm scripts cover this; a Makefile would just wrap them |

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

| Suggested | Our equivalent |
|---|---|
| `src/` | `apps/`, `packages/` |
| `docs/requirements/` | `docs/requirements.md` (single file — easier to read end-to-end) |
| `docs/design/` | `docs/system-design.md` |
| `docs/architecture/` | `docs/architecture.md` |
| `docs/sprints/` | ⚪️ to be added by Saanvi |
| `docs/deployment/` | `docs/deployment.md` |
| `tests/` | Currently empty; tests will colocate next to source as `*.test.ts` when added |
| `scripts/` | ✅ |
| `.env.example` | ✅ |
| `README.md` | ✅ |
| `HANDOVER_CHECKLIST.md` | ✅ (this file) |
| `CHANGELOG.md` | ✅ |
| `docker-compose.yml` | ⚪️ optional, not added |

---

## Final pre-handover checklist

Run through this list right before emailing Mohan Ram C:

- [ ] All 20 sections above have at least 🟡 status
- [ ] `git status` is clean
- [ ] `npm run typecheck` passes (4 pre-existing TS errors are documented, not new ones)
- [ ] `npm run lint` passes
- [ ] `./scripts/setup.sh` works on a fresh clone (test on a different folder or VM)
- [ ] `.env` is **not** committed; `git log --all -- '*/.env'` returns nothing
- [ ] Anthropic API key in local `.env` has been **rotated** (the one currently there passed through development conversation)
- [ ] Repository pushed to GitHub with `v0.1.0` tag
- [ ] FISST account added as repository admin
- [ ] Demo video uploaded; link in README + this file
- [ ] Slides + final report attached to the handover email
- [ ] Team & timeline section at the top of this file filled in
