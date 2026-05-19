# Roadmap

Where this project goes after the current handover. Items are tagged with rough effort (S = ≤1 day, M = 2 to 5 days, L = 1 to 2 weeks).

## Highest priority, production readiness

These block a real production launch.

| Item | Effort | Why |
|---|---|---|
| Apply RLS policies to all tenant tables | M | The schema assumes RLS; without it any authenticated user could query other orgs' data. See [known-issues.md §B1](known-issues.md#b1-rls-policies-arent-in-migrations) |
| Write a basic test suite | L | Zero tests today. Target ≥60% coverage on `lib/scoring.ts`, `lib/scorecard.ts`, `lib/access.ts`, `lib/auth.ts` first |
| Set up CI on GitHub Actions | S | Lint + typecheck + test on every PR, automated migration on merge to `main`. Template in [deployment.md](deployment.md#cicd) |
| Fix the four pre-existing TS errors | S | `ApiError.title` and `Response.matchedTier`, see [known-issues.md §A1](known-issues.md#a1-pre-existing-typescript-errors) |
| Wire real SMTP credentials | S | OTPs + invites + scorecard PDFs all depend on this in prod |
| Wire R2/S3 for evidence | S | The plumbing exists; just needs real credentials and a CORS policy on the bucket |
| Generate `EXPO_PUBLIC_API_URL` from EAS secrets | S | So the production mobile build hits the production API, not localhost |
| Add per-minute rate limit to AI chat | S | Prevents one user burning the org's daily Anthropic budget by spamming the chat |
| Map Anthropic errors to friendly UI text | S | Currently `Your credit balance is too low...` shows raw to the user |

## Near-term features

What a small follow-on batch could realistically ship.

### F1. Push notifications wired end-to-end (M)

The `push_tokens` table, the worker, and the Expo SDK plumbing all exist. What's missing:
- An admin trigger to send a custom push to a team
- Scheduled engagement pushes ("Your weekly score is in")
- A `/notifications` screen in the mobile app to show the in-app inbox (`notifications` table)

### F2. Scorecard PDF export (M)

The email worker handles a `SCORECARD_PDF` job type that's defined in `lib/queue.ts` but not wired up. Needs:
- A `lib/pdf.ts` that renders the scorecard via `pdfkit` or `puppeteer`
- A POST endpoint that enqueues the job
- A "Email me a PDF" button on the scorecard screen

### F3. Multi-framework view toggle (S)

The KPI catalogue is already tagged with NIST and ISO control IDs. The mobile UI shows scores under the org's *selected* framework only, adding a toggle to view the same data through a different framework's lens is mostly UI work.

### F4. Industry benchmarks in the dashboard (M)

The `industry_benchmarks` table exists and the seed populates a few rows. Surface them on the scorecard:
- "Your score: 62. Industry average: 71. Top quartile: 85."
- Wire into the AI chat system prompt so the advisor can reference real benchmarks

### F5. Onboarding improvements (S)

- Show progress meter during the first-assessment flow ("KPI 7 of 46")
- "Skip for now" option on the first OTP (deferred verification), currently mandatory
- Better welcome screen explaining the People/Process/Company taxonomy

### F6. Streaming thinking display (S)

The chat currently uses `thinking: {type: 'disabled'}` for snappy first-token latency. Toggling on adaptive thinking + display: 'summarized' (Anthropic SDK feature) would give richer reasoning for harder questions like "where do I start." Tradeoff: 2-3s pause before any text appears.

### F7. Better team analytics (M)

The admin dashboard shows per-member completion + score. Missing:
- Per-KPI consensus signals (where do employees disagree with admin?), the data is there via `rollupResponses`, just needs UI
- Drill-down: tap an employee to see their per-level breakdown
- Export team scorecard as CSV

## Mid-term

Strategic items, batch+1 territory.

### M1. SSO (L)

OIDC + SAML integration. Most ENTERPRISE customers will demand this. Auth0 / WorkOS would be the fastest path; rolling it ourselves with `passport-saml` is doable but high-maintenance.

### M2. Per-employee snapshot history (M)

Currently snapshots are org-level only. Adding per-(org, user) snapshots would unlock individual trend charts and "you've improved by 12% this month" nudges. Schema change: add `userId String?` to `scorecard_snapshots`, write personal snapshots from the worker for non-admins.

### M3. Continuous re-assessment (L)

KPIs decay, MFA coverage drifts when new employees join without onboarding. Periodically re-prompt users to confirm their answers ("Is this still accurate?"). Schema: add `assessedAt` per response, define a per-KPI staleness window in `kpis.reassessIntervalDays`.

### M4. Compliance report templates (L)

Generate filled SOC 2 / ISO 27001 / NIST CSF compliance checklists from the scorecard. The control-ID mapping is already in place, this is mostly rendering work.

### M5. Webhooks (M)

The `webhooks` table exists but is unwired. Customers want events like `scorecard.recomputed`, `kpi.submitted`, `member.removed` pushed to their Slack / Discord / Splunk. The worker side is straightforward; the security side (HMAC signing, replay protection) needs care.

### M6. API keys for programmatic access (M)

Same, `api_keys` table exists, no auth middleware reads from it. Add a `requireApiKey` helper next to `requireAuth` that hits a bcrypt verify path.

### M7. Web dashboard (L)

A read-only web view (Next.js can do this in the same monorepo) so users can pull up their scorecard at a desk without launching the phone. The SDK is already platform-agnostic, just needs a new `apps/web` consuming it.

### M8. Multi-region / data residency (L)

EU customers will eventually demand EU-hosted data. The app is region-agnostic; the work is mainly DevOps: deploy a second Vercel + Supabase pair in `eu-west-1` and add a `region` column to organisations that routes their traffic.

## Far-term / blue sky

Optimisation and breadth, not on the critical path.

| Item | Effort |
|---|---|
| Mobile dark/light theme toggle (currently dark-only) | S |
| Localisation (i18n), start with English/Hindi/Spanish | M |
| Anomaly detection, flag suspicious response patterns (an employee answering 46 KPIs in 10 seconds) | M |
| AI agent that drafts policies based on KPI gaps | M |
| Public benchmarking, opt-in anonymous scorecard sharing across customers, "you score in the 73rd percentile of Tech companies" | L |
| White-labelled product for MSPs | L |
| Audit log export to S3 (compliance) | S |

## Things we deliberately decided NOT to do

For the next batch's awareness, these came up and were rejected with reasoning:

- **Microservices**: the modular monolith handles the projected scale fine. Splitting it would only add ops complexity. Reconsider at >50K active users.
- **GraphQL**. REST + Zod schemas give us 90% of the type safety with 10% of the tooling complexity. Maybe at scale, not now.
- **A separate admin web app**: the admin features live in the mobile app and are gated by role. One app to maintain. If admins start demanding desktop-only features (CSV exports, bulk operations), revisit.
- **OAuth via Google/Apple at registration**: adds a UX corner case (Google account → org email mismatch) that complicates the ENTERPRISE_ADMIN domain-keying logic. Defer until SSO comes in M1.
- **Server-side rendering for any scorecard view**. Next.js App Router supports it but the API serves mobile primarily. No SEO concern. Keep it API-only.