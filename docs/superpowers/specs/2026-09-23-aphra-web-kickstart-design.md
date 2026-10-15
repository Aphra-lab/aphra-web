# Aphra web: kickstart design

- Date: 2026-09-23
- Status: design approved. Implementation plan: `docs/superpowers/plans/2026-09-23-aphra-web-kickstart.md`.

## 1. Context

Aphra is a French brand of tasting drinks made with an artisanal clarification technique. The drinks contain alcohol.

| Asset | State on 2026-09-23 |
| --- | --- |
| GitHub organization `Aphra-lab` | Created, no repositories |
| Domains `aphralab.com`, `aphralab.fr`, `aphralab.online` | Registered at Hostinger until 2027-09-16. Hostinger nameservers, parking page, DNSSEC off, no CAA records |
| Mailbox `contact@aphralab.com` | Hostinger mail plan, 48 months, bought in September 2026 |
| Cloudflare account | Created, empty: no zone, no Worker, no `workers.dev` subdomain |

Roadmap after milestone 1, not built now: contact form and newsletter, online shop, pro area, bookings. The structure must leave room for an API, a database and authentication.

## 2. Milestone 1 scope

1. Public repository `Aphra-lab/aphra-web`, scaffolded with `@jeportie/create-tskickstart` (frontend type).
2. One Cloudflare Worker that serves the site and answers `/api/*`. Only `GET /api/health` exists.
3. A hello page: the brand mock image as-is, plus the legal health warning.
4. The three domains on Cloudflare DNS. `aphralab.com` serves the site. `www`, `aphralab.fr` and `aphralab.online` redirect to `https://aphralab.com`.
5. The mailbox `contact@aphralab.com` moves from Hostinger to Google Workspace. The Hostinger mail plan is refunded.
6. CI/CD on GitHub Actions: checks, E2E tests, staging deploy from `dev`, production deploy from `main`, release notes, daily smoke tests.
7. A `brand/` folder and a brand guide for Claude Design. The design system lives in a personal claude.ai account.
8. Issues on `jeportie/tskickstart` for each gap that reproduces during the scaffold.

Out of scope: see section 14.

## 3. Decisions

| Topic | Decision | Reason |
| --- | --- | --- |
| Repository shape | One app at the repository root: tskickstart frontend plus one Worker | Uses tskickstart as designed. Same shape as the Cloudflare React + Hono Workers template. A split into workspaces happens only when the API outgrows one Worker. |
| Hosting | Cloudflare Workers with static assets | Cloudflare recommends Workers over Pages for new projects. Static asset requests are free. |
| CI/CD | GitHub Actions with `cloudflare/wrangler-action` | Checks run before each deploy. One pipeline. Account-owned token with minimal permissions. Workers Builds was rejected: it uses a broad user token and runs checks only inside the build command. |
| DNS | Cloudflare, for the three domains | Worker custom domains need an active Cloudflare zone. |
| Registrar | Hostinger, unchanged | A transfer brings nothing now. |
| Mail | Google Workspace Business Starter | Gmail, Calendar, Drive and Meet. The Hostinger mail plan is still inside its 30-day refund window. |
| Visibility | Public repository | Branch rulesets and required checks are free on public repositories. |
| Node.js | 24 | Current LTS. Matches the local toolchain. tskickstart defaults to 22. |
| Package manager | npm | tskickstart installs with npm. |
| Design tool | Claude Design, personal claude.ai account | Claude Design shares design systems with the whole claude.ai organization. |
| Git identity | Repository-local config with a personal address | The global identity belongs to another organization. |
| Staging URL | `workers.dev` | No DNS or access setup. The URL is not linked from anywhere. |

## 4. Architecture

### 4.1 Repository and branches

- `main`: production. Versioned by semantic-release.
- `dev`: integration. Default branch.
- Short-lived branches from `dev`, one concern each: `feat/`, `bugfix/`, `support/`, `chore/`.
- Branch to `dev`: squash merge. The pull request title is a Conventional Commit and becomes the commit message.
- `dev` to `main`: merge commit, so semantic-release reads every commit.
- Rulesets on `dev` and `main`: pull request required, required checks, no force push, no deletion. One ruleset per branch enforces the merge method: squash only on `dev`, merge commit only on `main`.

### 4.2 Application

tskickstart answers, as environment variables for a non-interactive run:

| Variable             | Value                   |
| -------------------- | ----------------------- |
| `PROJECT_TYPE`       | `frontend`              |
| `LINTER`             | `eslint`                |
| `LINT_OPTIONS`       | `commitlint,secretlint` |
| `VITEST_PRESET`      | `coverage`              |
| `PLAYWRIGHT`         | `1`                     |
| `SETUP_PRECOMMIT`    | `husky`                 |
| `SETUP_CICD`         | `1`                     |
| `INCLUDE_AGENT_CREW` | `1`                     |

Result: React, Vite, Tailwind CSS 4, React Router, TanStack Query, ESLint and Prettier, Vitest, Playwright, Husky, commitlint, secretlint.

Added on top:

- `@cloudflare/vite-plugin` and a pinned `wrangler` (4.135.0 or later).
- `wrangler.jsonc`: Worker `aphra-web`, static assets with single-page-application fallback, `run_worker_first: ["/api/*"]`.
- `worker/index.ts`: the Worker entry. `GET /api/health` returns `{ "status": "ok", "environment": "<name>", "commit": "<sha>" }`. Other `/api/*` paths return a 404 JSON body.

Request flow:

```
request -> Cloudflare edge -> Worker aphra-web
                                 |- /api/*          -> worker/index.ts
                                 |- existing file   -> static asset
                                 '- any other path  -> index.html (React Router)
```

Backend path, later: Hono routes in `worker/`, D1 with Drizzle (one database per environment), authentication, Cloudflare Email Service for transactional mail. When the API grows, it moves to its own Worker behind a service binding.

### 4.3 Environments

| Environment | Worker | URL | Source |
| --- | --- | --- | --- |
| production | `aphra-web` | `https://aphralab.com` | `main` |
| staging | `aphra-web-staging` | `https://aphra-web-staging.aphralab.workers.dev` | `dev` |
| local | none | `vite dev`, `vite preview` | working tree |

- `env.staging` overrides `routes` (inherited otherwise) and sets `workers_dev: true`. Production sets `workers_dev: false`.
- `ENVIRONMENT` comes from `vars` per environment. `COMMIT_SHA` is set at deploy time.
- The account `workers.dev` subdomain is `aphralab`. Fallback if taken: `aphra-lab`.

## 5. Domains, DNS and mail

### 5.1 Target state

`aphralab.com` zone:

| Name | Type | Content | Proxy |
| --- | --- | --- | --- |
| `@` | Worker custom domain | `aphra-web` | yes |
| `www` | A | `192.0.2.0` (placeholder) | yes |
| `@` | MX | `1 smtp.google.com` | DNS only |
| `@` | TXT | `v=spf1 include:_spf.google.com ~all` | DNS only |
| `google._domainkey` | TXT | key from the Google Admin console | DNS only |
| `_dmarc` | TXT | `v=DMARC1; p=none` | DNS only |
| `@` | TXT | Google site verification value | DNS only |

Settings: Always Use HTTPS on. Single Redirect: `www.aphralab.com/*` to `https://aphralab.com/*`, 301, query string kept. Email Routing off.

`aphralab.fr` and `aphralab.online` zones:

| Name     | Type | Content                   | Proxy    |
| -------- | ---- | ------------------------- | -------- |
| `@`      | A    | `192.0.2.0` (placeholder) | yes      |
| `www`    | A    | `192.0.2.0` (placeholder) | yes      |
| `@`      | MX   | `0 .` (null MX, RFC 7505) | DNS only |
| `@`      | TXT  | `v=spf1 -all`             | DNS only |
| `_dmarc` | TXT  | `v=DMARC1; p=reject`      | DNS only |

Settings: Always Use HTTPS on. Single Redirect: every request to `https://aphralab.com` with the same path, 301, query string kept.

Registrar: each domain uses the two nameservers that Cloudflare assigns to its zone. Auto-renew on.

### 5.2 Migration

Phase A, DNS move. Mail stays at Hostinger.

1. Create the three zones on the Free plan.
2. In `aphralab.com`, compare the imported records with the live Hostinger records and add any missing one:
   - MX `5 mx1.hostinger.com` and MX `10 mx2.hostinger.com`
   - TXT `v=spf1 include:_spf.mail.hostinger.com ~all`
   - TXT `_dmarc`: `v=DMARC1; p=none`
   - CNAME `hostingermail-a._domainkey`, `hostingermail-b._domainkey` and `hostingermail-c._domainkey` to `hostingermail-a.dkim.mail.hostinger.com`, `hostingermail-b.dkim.mail.hostinger.com` and `hostingermail-c.dkim.mail.hostinger.com`, DNS only
   - CNAME `autodiscover` to `autodiscover.mail.hostinger.com` and CNAME `autoconfig` to `autoconfig.mail.hostinger.com`, DNS only
3. Delete the parking records (`@` A `2.57.91.91`, `www`) in the three zones. Add the placeholders, redirects and no-mail records from 5.1.
4. Change the nameservers at Hostinger for the three domains: Hostinger API, or hPanel if the API refuses.
5. Wait until Cloudflare marks each zone active.
6. Check the public records through the new nameservers. Send and receive one test mail, still through Hostinger.

Phase B, mailbox move to Google Workspace.

1. The owner signs up for Business Starter with `aphralab.com` and creates `contact@aphralab.com`.
2. The Google verification TXT goes into Cloudflare. The owner confirms the verification.
3. The mail records switch to Google: MX, SPF, DKIM (`google._domainkey`, generated by the owner in the Admin console). The Hostinger DKIM, `autodiscover` and `autoconfig` CNAMEs are deleted. DMARC stays `p=none`.
4. The owner sends and receives test mails, then checks the Hostinger mailbox one last time.
5. The owner requests the refund of the Hostinger mail plan in hPanel, within 30 days of the purchase.
6. The repository variable `MAIL_PROVIDER` changes from `hostinger` to `google`.

## 6. CI/CD

`.github/workflows/ci.yml` runs on pull requests to `dev` and `main`, and on pushes to `dev` and `main`:

| Job | When | Steps |
| --- | --- | --- |
| `checks` | always | `npm ci`, format check, lint, typecheck, Vitest with coverage, build |
| `e2e` | after `checks` | Playwright against the local production build |
| `deploy-staging` | push to `dev`, after `e2e` | staging build, deploy `aphra-web-staging`, `@site` smoke tests on the staging URL |
| `deploy-production` | push to `main`, after `e2e` | production build, deploy `aphra-web`, `@site` smoke tests on `https://aphralab.com` |
| `release` | push to `main`, after `deploy-production` | semantic-release: GitHub release and notes. No npm publish, no commit back. |

`.github/workflows/pr-title.yml` runs the `pr-title` job on pull requests to `dev` and `main`, title edits included: the title must be a Conventional Commit.

`.github/workflows/smoke.yml` runs every day at 06:00 UTC and on demand: the full smoke suite against production. A failed run sends the standard GitHub failure notification.

| Name | Kind | Content |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | secret | Account-owned token, Aphra account only, from the "Edit Cloudflare Workers" template, with Workers Routes Write limited to zone `aphralab.com` |
| `CLOUDFLARE_ACCOUNT_ID` | variable | Aphra account ID |
| `MAIL_PROVIDER` | variable | `hostinger`, then `google` |

- The template permissions created both Workers and the `aphralab.com` custom domain on the first deploys.
- The owner creates the token and stores it with `gh secret set`. The value goes through no other channel.
- Deploy jobs run on push events only, so pull requests from forks never see the secrets.
- GitHub environments `staging` and `production` keep the deploy history.
- Rollback: `npx wrangler rollback` restores the previous version.

## 7. Tests

| Layer | Tool | Target | Checks |
| --- | --- | --- | --- |
| Unit and integration | Vitest | components and the Worker handler, in memory | the image `alt` holds the full mock text; the health warning is present; `/api/health` JSON; unknown `/api/*` path returns 404 |
| E2E | Playwright (Chromium, Firefox, WebKit) | local production build (`vite preview` runs the Worker) | `lang="fr"`, title "Aphra", image loaded at 1004x650, warning visible, `/api/health` responds, unknown path shows the page |
| Smoke `@site` | Playwright request | deployed URL, after each deploy, gates the release | `/api/health` returns the deployed commit; `/` answers 200 with `server: cloudflare` and `cf-ray`; the image is served as `image/jpeg`. Production only: `http` to `https`, `www` to apex, `.fr` and `.online` (apex and `www`) to `https://aphralab.com`, all 301 |
| Smoke `@services` | Playwright, `node:dns`, RDAP | production, daily and on demand | the three domains use Cloudflare nameservers; each domain expires in more than 30 days; the mail records match `MAIL_PROVIDER`; `.fr` and `.online` publish the no-mail records |

DNS checks query the public resolvers 1.1.1.1 and 8.8.8.8 directly.

## 8. Hello page

- Route `/`: the mock image as-is (`public/aphra-hello.jpg`, 1004x650), responsive, centred on a background colour sampled from the image.
- `alt`: the full text of the mock: "Aphra. Bienvenue, voici le site internet d'Aphra. Marque de boisson de dégustation fabriquée à l'aide d'une technique de clarification artisanale. Notre numéro de téléphone : 06 24 51 14 04. Notre mail est : contact@aphralab.com".
- Below the image: "L'abus d'alcool est dangereux pour la santé, à consommer avec modération." (loi Évin, Code de la santé publique, article L3323-4).
- `index.html`: `lang="fr"`, title "Aphra", meta description, Open Graph title, description and image (`https://aphralab.com/aphra-hello.jpg`). The broken `/vite.svg` favicon link is removed.
- The tskickstart demo content (welcome component, demo SVGs) is removed.

## 9. Claude Design

- Account: a personal claude.ai account on a paid plan. Claude Design is a beta on paid plans.
- Repository content from day one:
  - `brand/`: the mock image now. Later: logo, moon illustration, font files, palette.
  - `docs/guides/brand.md`: name, contacts, language (French), the health warning on every page, tone. `/design-sync` copies `docs/guides/*.md` into the design system guidelines.
- Setup, by the owner at claude.ai/design: create the Aphra design system from the public repository and the `brand/` files, then publish it.
- Loop for each page: design in Claude Design, "Send to local coding agent", paste the prompt into Claude Code inside this repository, `feat/*` branch, pull request, CI, staging, production.
- The local Claude Code install is signed in with another organization. `/design-login` authorizes the personal account for design sync. If a handoff link does not open, the design is exported as a `.zip` and placed in the working directory.
- Later, not in milestone 1: when real React components exist, `/design-sync` pushes them to the design system.

## 10. Upstream issues (`jeportie/tskickstart`)

Each item is filed only after it reproduces in this scaffold:

1. Frontend type: no Cloudflare Workers deploy target.
2. Frontend CI: `npm run check` on pull requests only. No build, no Playwright, no deploy.
3. `commitlint` without `cspell`: the config loads `commitlint-plugin-cspell`, which is not installed.
4. `npm run check` formats in write mode, so CI never fails on formatting.
5. Default Node.js 22, while the current LTS is 24.
6. `index.html` links `/vite.svg`, but no `public/` folder is generated.
7. `npm init -y` leaves license ISC and no `"private": true`.

## 11. Owner actions

1. Cloudflare: create the API token from section 6 and store it with `gh secret set CLOUDFLARE_API_TOKEN`.
2. Hostinger: change the nameservers in hPanel if the API refuses.
3. Google Workspace: sign up, create `contact@aphralab.com`, confirm the domain verification, generate the DKIM key.
4. Mail: test send and receive, then request the Hostinger refund within 30 days of the purchase.
5. Claude Design: create and publish the design system in the personal account.
6. Approve the commands that run outside the local sandbox (`gh`, `git push`, `npm`).

## 12. Risks

| Risk | Mitigation |
| --- | --- |
| Mail lost during the nameserver change | All mail records exist in Cloudflare before the change. Both nameserver sets answer the same records during propagation. Test mail after activation. |
| Mail lost during the Google switch | `contact@` exists in Workspace before the MX change. The Hostinger mailbox is checked after the switch. The refund comes last. |
| Loss of access to accounts that sign in with `contact@` (Cloudflare) | Same order: the address never stops receiving mail. |
| Refund window missed | Phase B ends before the 30-day limit shown in hPanel. |
| Hostinger API refuses the nameserver change | The owner changes it in hPanel. |
| CI token broader than needed | Account-owned, Aphra account only; Workers Routes limited to `aphralab.com`; the secret exists only in the `staging` and `production` environments, which accept only `dev` and `main`. Unused permission groups (KV and similar) can be removed from the token. |
| `workers.dev` subdomain taken | Fallback name `aphra-lab`. |
| Alcohol advertising rules (loi Évin) | Health warning on every page. Future product copy follows the loi Évin content rules. |

## 13. Success criteria

1. `https://aphralab.com` serves the hello page over HTTPS from Cloudflare. `http://`, `www`, `aphralab.fr` and `aphralab.online` redirect to it with a 301.
2. A pull request to `dev` runs `checks`, `e2e` and `pr-title`.
3. A merge to `dev` deploys staging and passes the `@site` smoke tests.
4. A merge to `main` deploys production, passes the `@site` smoke tests and publishes a GitHub release.
5. The daily smoke run passes, `@services` included.
6. `contact@aphralab.com` sends and receives through Google Workspace. The Hostinger mail plan is refunded.
7. The Aphra design system exists in Claude Design.
8. Each tskickstart gap that reproduced has an issue.

## 14. Deferred

- Preview deployment per pull request (Cloudflare Worker Previews, launched on 2026-09-22).
- `/design-sync`, design tokens and components, after the first real designs.
- API routes beyond `/api/health`, database, authentication, contact form, newsletter, shop, pro area, bookings.
- DMARC policy beyond `p=none`.
- Age gate, analytics, cookie banner.
- Gradual deploys and automatic rollback.
