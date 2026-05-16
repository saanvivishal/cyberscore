# Contributing

Welcome. This doc covers how to work on CyberScore — branching, commits, PRs, and the local dev expectations. For *what* the codebase looks like, read [docs/architecture.md](docs/architecture.md).

## Setup (one time)

```bash
git clone <repo-url>
cd cyberscore
./scripts/setup.sh        # installs deps, copies .env, runs migrations + seed
```

If the script doesn't work for you, [docs/database.md](docs/database.md) and [README.md](README.md) have the manual steps.

Confirm everything's wired:

```bash
npm run typecheck         # turbo runs typecheck across all workspaces
npm run lint              # turbo runs lint across all workspaces
```

## Running the project locally

You need three processes — one in each terminal tab:

```bash
# Tab 1 — API (Next.js dev server, :3000)
npm run dev --workspace @cyberscore/api

# Tab 2 — Workers (BullMQ consumers + scheduler)
npm run worker --workspace @cyberscore/api

# Tab 3 — Mobile (Metro bundler + Expo dev tools)
EXPO_PUBLIC_API_URL=http://$(ipconfig getifaddr en0):3000 \
  npm run start --workspace @cyberscore/mobile
```

If your LAN IP changes (different network), restart Metro with the new `EXPO_PUBLIC_API_URL`. The iOS Simulator and Android emulator both reach the host via the LAN IP.

## Branching

Single long-lived branch is `main`. Everything else is short-lived.

| Branch type | Prefix | Lifetime |
|---|---|---|
| Feature work | `feat/<short-name>` | Hours to a few days |
| Bug fixes | `fix/<short-name>` | Hours |
| Documentation | `docs/<short-name>` | Hours |
| Chores / tooling | `chore/<short-name>` | Hours |
| Refactor (no behaviour change) | `refactor/<short-name>` | Days |
| Experimental / spikes | `spike/<short-name>` | Disposable — usually not merged |

Examples:
- `feat/team-csv-export`
- `fix/login-rate-limit-key`
- `docs/onboarding-walkthrough`
- `chore/bump-expo-sdk-53`

**Never commit directly to `main`.** Every change goes through a PR — even for solo work, the diff review forces a second look.

## Commits

Conventional Commits style. Subject line is **imperative present** ("add X", not "added X"). Keep under 72 chars; details go in the body.

```
<type>(<scope>): <subject>

<body — what changed and why, not how>

<footer — e.g. "Closes #42">
```

Types:
- `feat` — user-facing new capability
- `fix` — bug fix
- `docs` — documentation only
- `refactor` — code change that neither fixes a bug nor adds a feature
- `perf` — performance improvement
- `test` — adding or updating tests
- `chore` — tooling, deps, build (no source change)

Scopes (use one when it helps; skip when not):
- `api`, `mobile`, `sdk`, `types`, `db`, `infra`

Examples:
```
feat(mobile): add tap-to-autofill OTP banner in dev mode
fix(api): correct rate-limit key for password-reset endpoint
docs(architecture): explain RLS bypass pattern
refactor(api): extract scorecard aggregation into pure function
```

### What not to do in commits

- Don't commit `.env` (the gitignore already blocks it; double-check before pushing)
- Don't commit `node_modules` (also gitignored)
- Don't commit `.DS_Store`, `*.log`, IDE configs
- Don't squash unrelated changes — one logical change per commit. A 200-line PR with 4 commits beats a 200-line PR with one "stuff" commit.

## Pull requests

Open a PR even for small fixes. The PR description should answer three questions:

1. **What** does this change?
2. **Why** does it change it? (link to issue / spec / Slack thread)
3. **How** would a reviewer verify it works?

Template (copy this into the PR description):

```markdown
## What

<1-2 sentences>

## Why

<link to issue, or short rationale>

## How to verify

- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes
- [ ] Manual check: <steps a reviewer can follow>

## Screenshots / demo

<for UI changes>

## Notes for reviewer

<anything subtle or controversial>
```

### Review etiquette

- **Reviewer's job:** look for correctness, security, and surprise. Style nits are fine but don't block. Approve with comments rather than request changes for cosmetic stuff.
- **Author's job:** respond to every comment, even with a 👍. If you disagree, push back — reviewers aren't always right.
- **Merging:** the author merges after at least one approval. Use "Squash and merge" so `main` stays linear and readable.

## Code style

We're not strict about formatting because Prettier handles it. But:

- **TypeScript only** — no JavaScript files (a `*.js` in the repo is a linting failure waiting to happen)
- **No `any`** — if you need a fast escape hatch use `unknown` and narrow with a type guard. CI's strict mode will catch most cases anyway.
- **Comments explain `why`, not `what`** — the code says what; comments say why this approach. Don't waste lines explaining what `useMemo` does.
- **Single export per route handler** — `export async function GET` etc. Don't co-locate helper functions in route files; move them to `lib/`.
- **Server-only helpers in `lib/`, shared types in `packages/types`** — if mobile needs a shape, it goes in `@cyberscore/types`.

## Database changes

Always via migrations:

```bash
cd apps/api
# Edit prisma/schema.prisma
npx prisma migrate dev --name what_changed
```

This creates a new folder in `prisma/migrations/` with a generated SQL file. Don't edit past migrations — write a new one to fix mistakes.

Migrations are append-only and idempotent (`migrate deploy` skips already-applied ones). Never rebase migration commits out of `main` once they've been applied to a shared DB.

## Tests

There are no tests yet (see [docs/known-issues.md §B2](docs/known-issues.md#b2-no-tests)). The framework is wired (`vitest` in the API, `turbo run test` from root) — just add `*.test.ts` files next to the code they test:

```
apps/api/src/lib/scoring.test.ts
apps/api/src/lib/scorecard.test.ts
```

Aim for behaviour tests, not implementation tests. Mock Prisma sparingly — a real Postgres test DB via `pg-mem` or a Docker `postgres` service in CI is preferable.

## Working with secrets

- `.env` is gitignored. Never commit it.
- The `.env.example` documents every variable. Update it when you add a new one.
- For prod secrets, use the hosting provider's secret manager (Vercel env vars / Render env / AWS Secrets Manager).
- If you accidentally push a secret: **rotate immediately**, then `git filter-repo` (or BFG) to scrub history. Don't trust commit deletion alone.

## Updating dependencies

- Patch + minor updates: open a `chore/deps-<date>` PR with the changes. Run lint + typecheck + manual sanity check.
- Major updates: separate PR per major upgrade. Read the changelog before merging.
- Expo SDK upgrades: follow https://docs.expo.dev/upgrade — never just bump the version, always run `npx expo install --fix`.

## Releasing

Each release is a Git tag of the form `vX.Y.Z`:

```bash
# After merging to main:
git checkout main && git pull
git tag -a v0.2.0 -m "0.2.0 — short summary"
git push --tags
```

Update `CHANGELOG.md` with the release section in the same commit that creates the tag. Move `[Unreleased]` items into the new version's section.

## Asking for help

Stuck? Open a draft PR with what you have and ask in the description. Or open an issue with the question — a written question is easier for the next person to find than a Slack message.

## Acknowledgements

CyberScore is a student project handed over from one IIITB batch to the next. If you're picking it up: welcome. Read [docs/known-issues.md](docs/known-issues.md) and `apps/mobile/HANDOFF.md` before making changes — there's context in there that isn't obvious from the code alone.
