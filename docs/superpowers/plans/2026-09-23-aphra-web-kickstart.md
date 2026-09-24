# Aphra Web Kickstart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve the Aphra hello page on `https://aphralab.com` through a GitHub to Cloudflare pipeline, with smoke tests that prove the registrar, DNS, hosting, CI/CD and mail links work.

**Architecture:** One React + Vite single-page app (tskickstart frontend output) and one Cloudflare Worker at the repository root. The Worker serves the static build with a single-page-application fallback and handles `/api/*` first. GitHub Actions runs checks and E2E tests on every pull request, deploys `dev` to staging and `main` to production, runs `@site` smoke tests after each deploy, and runs the full smoke suite every day.

**Tech Stack:** Node.js 24, npm, React, Vite, Tailwind CSS 4, React Router, Vitest 2, Playwright, `@cloudflare/vite-plugin`, Wrangler 4, GitHub Actions, semantic-release, Cloudflare API (through the Cloudflare MCP server), Hostinger API (through the Hostinger MCP server), Google Workspace.

**Spec:** `docs/superpowers/specs/2026-09-23-aphra-web-kickstart-design.md`

## Global Constraints

- Node.js `24` (`.nvmrc`), `engines.node` `>=24`, npm, one lockfile (`package-lock.json`).
- `wrangler` devDependency `^4.135.0` or later; `compatibility_date` `"2026-09-23"`.
- Wrangler environment: chosen at build time with `CLOUDFLARE_ENV`. `wrangler deploy` never gets `--env`; it deploys the build output config.
- Worker names: `aphra-web` (production), `aphra-web-staging` (staging). `workers.dev` subdomain: `aphralab` (fallback `aphra-lab`).
- Production URL `https://aphralab.com`. Staging URL `https://aphra-web-staging.aphralab.workers.dev`.
- Cloudflare account: `507e2472cb49976c013eb085e2d4a004` ("Contact@aphralab.com's Account"). An account ID is not a secret.
- Git identity in this repository: `Jerome Portier <jeromep.dev@gmail.com>` (repository-local config, already set).
- Commits and pull request titles: Conventional Commits, lower-case subject, header at most 100 characters. No `Co-Authored-By`, no "Generated with" line, no AI attribution anywhere.
- Branches from `dev`, one concern each: `feat/`, `bugfix/`, `support/`, `chore/`. Agents open pull requests and stop. The owner merges (`gh pr merge` is denied in `.claude/settings.json`).
- Text for pull requests, issues, docs and code comments: simple English, no first person, facts only. Code comments only when needed, one line.
- Site language: French. Health warning, exact text: `L'abus d'alcool est dangereux pour la santé, à consommer avec modération.`
- Hello image: `public/aphra-hello.jpg`, 1004x650, byte-identical copy of `~/Downloads/WhatsApp Image 2026-09-23 at 19.11.36.jpeg`. Page background `#FCFCF2` (sampled from the image).
- Mail DNS: a mail record is removed only after its replacement exists (spec section 5.2).
- Local sandbox: writes to `.git/config` and `.git/hooks`, `gh`, `git push`, `npm install`/`npm ci`/`npx` downloads, and Playwright browser installs run outside the sandbox (one permission prompt each).
- MCP calls: Cloudflare through `mcp__cloudflare__execute` with `account_id` `507e2472cb49976c013eb085e2d4a004`; Hostinger through `mcp__hostinger__*` tools.

## Review Focus

1. A phone screen (375 px wide) shows the 1004 px image with no horizontal scroll. Owner: Task 6, E2E test `fits a phone screen without horizontal scroll`.
2. Old or typed links keep their path and query: `http://`, `www.`, `aphralab.fr` and `aphralab.online` URLs with `/visite?source=test` land on `https://aphralab.com/visite?source=test` after a 301. Owner: Task 7, smoke tests in the `redirects` block.
3. Link previews (messaging apps, social networks) load: `og:image` is the absolute production URL and answers 200 `image/jpeg`. Owner: Task 6 (E2E meta test) and Task 7 (smoke `link preview image is served`).
4. A wrong method or a bare `/api` path returns a JSON error, never the HTML page: `POST /api/health` gives 405 with `allow: GET, HEAD`; `GET /api` and `GET /api/nope` give 404 JSON. Owner: Task 5, unit and E2E tests.
5. A staging deploy never claims the production domain: `env.staging` overrides `routes` with an empty list and enables `workers_dev`. Owner: Task 5, `wrangler-config.unit.test.ts`.

---

## File map

| Path | Responsibility | Task |
| --- | --- | --- |
| generated tskickstart files (`package.json`, `vite.config.ts`, `vitest.config.ts`, `tsconfig*.json`, `eslint.config.js`, `playwright.config.ts`, `index.html`, `src/`, `tests/`, `.husky/`, `.claude/`, `CLAUDE.md`, `AGENTS.md`, `README.md`, `.github/workflows/ci.yml`) | project baseline | 4 |
| `.nvmrc`, `package.json`, `commitlint.config.js`, `.gitignore`, `README.md` (prerequisites) | Node 24, package metadata, generator fixes | 4 |
| `worker/index.ts` | Worker entry: `/api/health`, JSON 404 and 405 | 5 |
| `wrangler.jsonc` | Worker config: production and `env.staging` | 5 |
| `tsconfig.worker.json`, `tsconfig.json` | Worker TypeScript project | 5 |
| `vite.config.ts` | adds `cloudflare()` plugin | 5 |
| `eslint.config.js`, `vitest.config.ts` | lint and coverage for `worker/` | 5 |
| `tests/unit/worker.unit.test.ts`, `tests/unit/wrangler-config.unit.test.ts`, `tests/e2e/api.spec.ts` | Worker tests | 5 |
| `src/pages/Home.tsx`, `src/App.tsx` | hello page and routes | 6 |
| `index.html`, `public/aphra-hello.jpg` | document metadata, served image | 6 |
| `tests/unit/Home.unit.test.tsx`, `tests/unit/App.unit.test.tsx`, `tests/integration/App.int.test.tsx`, `tests/e2e/home.spec.ts` | page tests | 6 |
| `brand/mock-hello-2026-09-23.jpg`, `docs/guides/brand.md`, `README.md` (intro) | brand files for Claude Design, project intro | 6 |
| `playwright.smoke.config.ts`, `tests/smoke/site.spec.ts`, `tests/smoke/services.spec.ts`, `tests/smoke/support/dns.ts`, `tests/smoke/support/mail.ts` | smoke tests | 7 |
| `.github/workflows/ci.yml`, `.github/workflows/pr-title.yml`, `.github/workflows/smoke.yml`, `.github/rulesets/protect-dev-and-main.json`, `release.config.mjs` | pipeline, branch rules and releases | 8 |

Deleted in Task 6: `src/Welcome.tsx`, `src/assets/react.svg`, `src/assets/tailwind.svg`, `src/assets/vite.svg`, `tests/e2e/welcome.spec.ts`.

## Order and dependencies

```
Task 1 repo ──► Task 2 zones ──► Task 3 nameservers (activation can take hours)
   │
   └──► Task 4 scaffold (PR) ─► Task 5 worker (PR) ─► Task 6 page (PR) ─► Task 7+8 smoke + CI (one PR)
                                                                                 │
Task 9 delivery setup ◄──────────────────────────────────────────────────────────┘
   └──► Task 10 staging ─► Task 11 rulesets ─► Task 12 production (needs Task 3 done)
                                                   └──► Task 13 ─► Task 14 mail (Phase B)
Task 15 Claude Design, Task 16 tskickstart issues: after Task 6. Task 17: last.
```

Each pull request ends with a stop: the owner reviews and merges it (squash into `dev`, merge commit into `main`). Afterwards:

```bash
cd ~/src/aphra-web && git switch dev && git pull --ff-only
```

---

## Phase 1: Repository

### Task 1: Publish the repository

**Files:**

- Commit: `docs/superpowers/plans/2026-09-23-aphra-web-kickstart.md` (this plan)

**Interfaces:**

- Consumes: local repository `~/src/aphra-web` with `main` (`f44247d chore: initial commit`) and `dev` (spec commit).
- Produces: `github.com/Aphra-lab/aphra-web`, public, default branch `dev`, remote `origin`.

- [ ] **Step 1: Commit this plan on `dev`**

```bash
cd ~/src/aphra-web
git add docs/superpowers/plans/2026-09-23-aphra-web-kickstart.md
git commit -m "docs: add kickstart implementation plan"
```

Expected: `1 file changed`.

- [ ] **Step 2: Check the GitHub account (outside the sandbox)**

```bash
gh auth status --active
login="$(gh api user -q .login)"; echo "$login"
gh api "orgs/Aphra-lab/memberships/$login" -q '.role + " " + .state'
```

Expected: the owner's personal account, then `admin active`. If another account is active, the owner runs `gh auth switch` and the step is repeated.

- [ ] **Step 3: Create the empty public repository**

```bash
gh repo create Aphra-lab/aphra-web --public --description "Aphra website" --homepage https://aphralab.com --disable-wiki
```

Expected: `✓ Created repository Aphra-lab/aphra-web on GitHub`. No README, no `.gitignore`, no license: tskickstart then writes its own README and `.gitignore`.

- [ ] **Step 4: Add the remote and push both branches (outside the sandbox)**

```bash
cd ~/src/aphra-web
if [ "$(gh config get git_protocol -h github.com)" = ssh ]; then
  git remote add origin git@github.com:Aphra-lab/aphra-web.git
else
  git remote add origin https://github.com/Aphra-lab/aphra-web.git
fi
git push -u origin main dev
```

Expected: `main` and `dev` pushed.

- [ ] **Step 5: Repository settings**

```bash
gh repo edit Aphra-lab/aphra-web --default-branch dev --enable-squash-merge --squash-merge-commit-message pr-title --enable-merge-commit --enable-rebase-merge=false --delete-branch-on-merge
```

`--squash-merge-commit-message pr-title` makes each squash commit equal to the pull request title, which the `pr-title` check validates and semantic-release parses.

- [ ] **Step 6: Verify**

```bash
gh repo view Aphra-lab/aphra-web --json visibility,defaultBranchRef,squashMergeAllowed,mergeCommitAllowed,rebaseMergeAllowed,deleteBranchOnMerge
gh api repos/Aphra-lab/aphra-web -q '.squash_merge_commit_title + " " + .squash_merge_commit_message'
git ls-remote --heads origin
```

Expected: `"visibility":"PUBLIC"`, `"defaultBranchRef":{"name":"dev"}`, squash and merge commit `true`, rebase `false`, delete branch on merge `true`; `PR_TITLE BLANK`; heads `refs/heads/dev` and `refs/heads/main`.

---

## Phase 2: DNS move (spec 5.2, Phase A)

### Task 2: Prepare the three Cloudflare zones

**Files:** none (Cloudflare state).

**Interfaces:**

- Produces: zones `aphralab.com`, `aphralab.fr`, `aphralab.online` in account `507e2472cb49976c013eb085e2d4a004`, each with two assigned nameservers (used in Task 3). Records, redirects and settings exactly as spec 5.1, except that `aphralab.com` keeps the Hostinger mail records until Task 14.

All code below runs through `mcp__cloudflare__execute` with `account_id` = `507e2472cb49976c013eb085e2d4a004`. If a call fails with an authorization error, the owner re-authenticates the `cloudflare` server in `/mcp` and grants Zone, DNS, Zone Settings, Single Redirect and Workers permissions for the Aphra account. API-created zones get no automatic DNS scan, so no Hostinger parking record is imported.

- [ ] **Step 1: Create the zones**

```js
async () => {
  const out = {};
  for (const name of ['aphralab.com', 'aphralab.fr', 'aphralab.online']) {
    const r = await cloudflare.request({
      method: 'POST',
      path: '/zones',
      body: { name, account: { id: accountId }, type: 'full' },
    });
    out[name] = {
      id: r.result.id,
      status: r.result.status,
      name_servers: r.result.name_servers,
    };
  }
  return out;
};
```

Expected: three zones with `status: "pending"` and two `*.ns.cloudflare.com` nameservers each. Task 3 Step 1 reads the nameservers again, so nothing has to be copied.

- [ ] **Step 2: Confirm the zones start empty**

```js
async () => {
  const zones = (
    await cloudflare.request({
      method: 'GET',
      path: '/zones',
      query: { 'account.id': accountId },
    })
  ).result;
  const out = {};
  for (const z of zones) {
    const recs = (
      await cloudflare.request({
        method: 'GET',
        path: `/zones/${z.id}/dns_records`,
        query: { per_page: 100 },
      })
    ).result;
    out[z.name] = recs.map((r) => `${r.type} ${r.name} ${r.content}`);
  }
  return out;
};
```

Expected: an empty list for each zone. If a list is not empty, stop and report it: the next steps assume empty zones.

- [ ] **Step 3: Create the `aphralab.com` records (Hostinger mail kept)**

```js
async () => {
  const zone = (
    await cloudflare.request({
      method: 'GET',
      path: '/zones',
      query: { name: 'aphralab.com' },
    })
  ).result[0];
  const records = [
    {
      type: 'MX',
      name: 'aphralab.com',
      content: 'mx1.hostinger.com',
      priority: 5,
    },
    {
      type: 'MX',
      name: 'aphralab.com',
      content: 'mx2.hostinger.com',
      priority: 10,
    },
    {
      type: 'TXT',
      name: 'aphralab.com',
      content: '"v=spf1 include:_spf.mail.hostinger.com ~all"',
    },
    { type: 'TXT', name: '_dmarc.aphralab.com', content: '"v=DMARC1; p=none"' },
    {
      type: 'CNAME',
      name: 'hostingermail-a._domainkey.aphralab.com',
      content: 'hostingermail-a.dkim.mail.hostinger.com',
      proxied: false,
    },
    {
      type: 'CNAME',
      name: 'hostingermail-b._domainkey.aphralab.com',
      content: 'hostingermail-b.dkim.mail.hostinger.com',
      proxied: false,
    },
    {
      type: 'CNAME',
      name: 'hostingermail-c._domainkey.aphralab.com',
      content: 'hostingermail-c.dkim.mail.hostinger.com',
      proxied: false,
    },
    {
      type: 'CNAME',
      name: 'autodiscover.aphralab.com',
      content: 'autodiscover.mail.hostinger.com',
      proxied: false,
    },
    {
      type: 'CNAME',
      name: 'autoconfig.aphralab.com',
      content: 'autoconfig.mail.hostinger.com',
      proxied: false,
    },
    {
      type: 'A',
      name: 'www.aphralab.com',
      content: '192.0.2.0',
      proxied: true,
    },
  ];
  const created = [];
  for (const rec of records) {
    const r = await cloudflare.request({
      method: 'POST',
      path: `/zones/${zone.id}/dns_records`,
      body: { ttl: 1, ...rec },
    });
    created.push(
      `${r.result.type} ${r.result.name} ${r.result.content} proxied=${r.result.proxied}`,
    );
  }
  return created;
};
```

Expected: 10 records. The apex gets no web record here: the production deploy (Task 12) creates it as a Worker custom domain. Between zone activation and Task 12, `aphralab.com` does not answer HTTP; acceptable because the site has no traffic yet.

- [ ] **Step 4: Create the `aphralab.fr` and `aphralab.online` records**

```js
async () => {
  const out = {};
  for (const name of ['aphralab.fr', 'aphralab.online']) {
    const zone = (
      await cloudflare.request({
        method: 'GET',
        path: '/zones',
        query: { name },
      })
    ).result[0];
    const records = [
      { type: 'A', name, content: '192.0.2.0', proxied: true },
      { type: 'A', name: `www.${name}`, content: '192.0.2.0', proxied: true },
      { type: 'MX', name, content: '.', priority: 0 },
      { type: 'TXT', name, content: '"v=spf1 -all"' },
      { type: 'TXT', name: `_dmarc.${name}`, content: '"v=DMARC1; p=reject"' },
    ];
    out[name] = [];
    for (const rec of records) {
      const r = await cloudflare.request({
        method: 'POST',
        path: `/zones/${zone.id}/dns_records`,
        body: { ttl: 1, ...rec },
      });
      out[name].push(`${r.result.type} ${r.result.name} ${r.result.content}`);
    }
  }
  return out;
};
```

Expected: 5 records per zone. Cloudflare does not document whether a null MX (content `.`) is accepted. If the API refuses it, create the four other records, delete the three MX assertion lines of the `refuses mail` test in Task 7 Step 4, and report it in the Task 7-8 pull request.

- [ ] **Step 5: Always Use HTTPS and redirect rules**

```js
async () => {
  const zones = (
    await cloudflare.request({
      method: 'GET',
      path: '/zones',
      query: { 'account.id': accountId },
    })
  ).result;
  const id = Object.fromEntries(zones.map((z) => [z.name, z.id]));
  const redirect = (description, expression) => ({
    description,
    expression,
    action: 'redirect',
    enabled: true,
    action_parameters: {
      from_value: {
        status_code: 301,
        preserve_query_string: true,
        target_url: {
          expression: 'concat("https://aphralab.com", http.request.uri.path)',
        },
      },
    },
  });
  const rules = {
    'aphralab.com': [
      redirect('www to apex', '(http.host eq "www.aphralab.com")'),
    ],
    'aphralab.fr': [
      redirect(
        'aphralab.fr to aphralab.com',
        '(http.host in {"aphralab.fr" "www.aphralab.fr"})',
      ),
    ],
    'aphralab.online': [
      redirect(
        'aphralab.online to aphralab.com',
        '(http.host in {"aphralab.online" "www.aphralab.online"})',
      ),
    ],
  };
  const out = {};
  for (const name of Object.keys(rules)) {
    const https = await cloudflare.request({
      method: 'PATCH',
      path: `/zones/${id[name]}/settings/always_use_https`,
      body: { value: 'on' },
    });
    const rs = await cloudflare.request({
      method: 'PUT',
      path: `/zones/${id[name]}/rulesets/phases/http_request_dynamic_redirect/entrypoint`,
      body: { rules: rules[name] },
    });
    out[name] = {
      always_use_https: https.result.value,
      redirects: rs.result.rules.map((r) => r.expression),
    };
  }
  return out;
};
```

Expected: `always_use_https: "on"` and one redirect rule per zone. The PUT replaces the whole rule list of the phase and creates the entry point ruleset when it is missing.

- [ ] **Step 6: Verify the zone contents**

Run the Step 2 code again. Expected:

- `aphralab.com`: the 10 records from Step 3.
- `aphralab.fr` and `aphralab.online`: the 5 records from Step 4.

### Task 3: Switch the nameservers and confirm activation

**Files:** none (registrar and Cloudflare state).

**Interfaces:**

- Consumes: the nameservers from Task 2 Step 1.
- Produces: three active zones; public DNS answered by Cloudflare; mail still delivered by Hostinger.

- [ ] **Step 1: Read the assigned nameservers**

```js
async () => {
  const zones = (
    await cloudflare.request({
      method: 'GET',
      path: '/zones',
      query: { 'account.id': accountId },
    })
  ).result;
  return zones.map((z) => ({
    name: z.name,
    status: z.status,
    name_servers: z.name_servers,
  }));
};
```

- [ ] **Step 2: Switch the nameservers at Hostinger**

For each domain, call `mcp__hostinger__domains_updateDomainNameserversV1` with `domain`, `ns1` and `ns2` set to that zone's two nameservers.

Expected: success for the three domains. If the API answers 403 or 404 (as the domain details and DNS endpoints did on 2026-09-23), the owner changes them in hPanel: **Domains → aphralab.com → DNS / Nameservers → Change nameservers → custom nameservers**, pastes both values, saves, and repeats for `aphralab.fr` and `aphralab.online`.

- [ ] **Step 3 (owner): Turn on auto-renew**

hPanel → **Domains** → each domain → **Auto-renewal: on**. The billing API returns no subscription for this account, so this step is manual.

- [ ] **Step 4: Check the delegation**

```bash
for d in aphralab.com aphralab.fr aphralab.online; do
  curl -s -H 'accept: application/dns-json' "https://cloudflare-dns.com/dns-query?name=$d&type=NS" | jq -r --arg d "$d" '"\($d): " + ([.Answer[]?.data] | join(" "))'
done
```

Run with `allowed_domains: ["cloudflare-dns.com"]`. Expected: the two Cloudflare nameservers per domain. Resolvers that cached the old delegation can keep it for up to 48 hours; both nameserver sets answer the same mail records.

- [ ] **Step 5: Ask Cloudflare to check and wait for `active`**

```js
async () => {
  const zones = (
    await cloudflare.request({
      method: 'GET',
      path: '/zones',
      query: { 'account.id': accountId },
    })
  ).result;
  const out = {};
  for (const z of zones) {
    if (z.status !== 'active') {
      try {
        await cloudflare.request({
          method: 'PUT',
          path: `/zones/${z.id}/activation_check`,
        });
      } catch (e) {
        out[`${z.name}_check`] = String(e.message || e);
      }
    }
    out[z.name] = z.status;
  }
  return out;
};
```

Repeat every 15 minutes until the three zones show `active`. On the Free plan Cloudflare accepts one activation check per zone per hour; the code catches the refusal and still reports the status. Expected: `active` for all three (usually within an hour, at most 24 hours).

- [ ] **Step 6: Check the public records through Cloudflare**

```bash
q() { curl -s -H 'accept: application/dns-json' "https://cloudflare-dns.com/dns-query?name=$1&type=$2" | jq -r --arg n "$1" --arg t "$2" '"\($n) \($t): " + ([.Answer[]?.data] | join(" | "))'; }
q aphralab.com MX; q aphralab.com TXT; q _dmarc.aphralab.com TXT
for s in a b c; do q "hostingermail-$s._domainkey.aphralab.com" CNAME; done
q autodiscover.aphralab.com CNAME; q autoconfig.aphralab.com CNAME
for d in aphralab.fr aphralab.online; do q $d MX; q $d TXT; q "_dmarc.$d" TXT; done
```

Expected:

```
aphralab.com MX: 5 mx1.hostinger.com. | 10 mx2.hostinger.com.
aphralab.com TXT: "v=spf1 include:_spf.mail.hostinger.com ~all"
_dmarc.aphralab.com TXT: "v=DMARC1; p=none"
hostingermail-a._domainkey.aphralab.com CNAME: hostingermail-a.dkim.mail.hostinger.com.
hostingermail-b._domainkey.aphralab.com CNAME: hostingermail-b.dkim.mail.hostinger.com.
hostingermail-c._domainkey.aphralab.com CNAME: hostingermail-c.dkim.mail.hostinger.com.
autodiscover.aphralab.com CNAME: autodiscover.mail.hostinger.com.
autoconfig.aphralab.com CNAME: autoconfig.mail.hostinger.com.
aphralab.fr MX: 0 .
aphralab.fr TXT: "v=spf1 -all"
_dmarc.aphralab.fr TXT: "v=DMARC1; p=reject"
(same three lines for aphralab.online)
```

- [ ] **Step 7 (owner): Test mail**

From an outside address, send a mail to `contact@aphralab.com`; reply from the Hostinger webmail. Expected: both mails arrive.

---

## Phase 3: Code

### Task 4: Scaffold with tskickstart

**Branch:** `chore/scaffold-tskickstart` · **PR title:** `chore: scaffold frontend with tskickstart 1.10.0`

**Files:**

- Create: the generator output (`.claude/`, `.github/workflows/ci.yml`, `.husky/`, `.editorconfig`, `.gitignore`, `.mcp.json`, `.nvmrc`, `.prettierignore`, `.secretlintrc.json`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `commitlint.config.js`, `eslint.config.js`, `index.html`, `package.json`, `package-lock.json`, `playwright.config.ts`, `prettier.config.js`, `src/`, `tests/`, `tsconfig*.json`, `vite.config.ts`, `vitest.config.ts`)
- Modify: `.nvmrc`, `package.json`, `commitlint.config.js`, `.gitignore`, `.github/workflows/ci.yml`, `README.md`

**Interfaces:**

- Produces: scripts `format`, `format:check`, `lint`, `typecheck`, `secretlint`, `test`, `test:coverage`, `test:e2e`, `build`, `dev`, `preview`, `check`; working Husky hooks; Node 24.

- [ ] **Step 1: Create the branch**

```bash
cd ~/src/aphra-web && git switch dev && git switch -c chore/scaffold-tskickstart
```

- [ ] **Step 2: Run the generator (outside the sandbox)**

```bash
cd ~/src/aphra-web
PROJECT_TYPE=frontend LINTER=eslint LINT_OPTIONS=commitlint,secretlint VITEST_PRESET=coverage \
PLAYWRIGHT=1 SETUP_PRECOMMIT=husky SETUP_CICD=1 INCLUDE_AGENT_CREW=1 AUTHOR_NAME="Jerome Portier" \
npm create @jeportie/tskickstart@1.10.0 </dev/null
```

Expected: the run ends with `✅ Done!`; `package-lock.json` and `node_modules/` exist; the file list matches the Files block.

- [ ] **Step 3: Commit the untouched output**

```bash
git add -A
git commit -m "chore: scaffold frontend with tskickstart 1.10.0"
```

Expected: the commit succeeds (the generator writes `"prepare": "husky"` after its install step, so no hook runs yet). If a hook does run and `commitlint` fails on `commitlint-plugin-cspell`, save its output to `$TMPDIR/tsk-commitlint.txt` and commit with `git commit --no-verify -m "chore: scaffold frontend with tskickstart 1.10.0"`: this commit only records the generator output.

- [ ] **Step 4: Reproduce the generator gaps (evidence for Task 16)**

```bash
cd ~/src/aphra-web
{ printf 'chore: probe\n' | npx --no -- commitlint; echo "exit=$?"; } > "$TMPDIR/tsk-commitlint.txt" 2>&1
{ npm run secretlint; echo "exit=$?"; } > "$TMPDIR/tsk-secretlint.txt" 2>&1
grep -n '"check"\|"license"\|"private"\|"main"' package.json > "$TMPDIR/tsk-package.txt"
cat .nvmrc > "$TMPDIR/tsk-nvmrc.txt"
{ grep -n 'vite.svg' index.html; ls public; } > "$TMPDIR/tsk-favicon.txt" 2>&1
grep -n 'mise' README.md > "$TMPDIR/tsk-readme.txt"; ls .mise.toml >> "$TMPDIR/tsk-readme.txt" 2>&1
tail -n 5 "$TMPDIR"/tsk-*.txt
```

Expected: `tsk-commitlint.txt` shows a plugin load error for `commitlint-plugin-cspell` and `exit=1`; `tsk-package.txt` shows the `check` script with `npm run format`, `"license": "ISC"`, `"main": "index.js"` and no `private`; `tsk-nvmrc.txt` is `22`; `tsk-favicon.txt` shows the `/vite.svg` link and `ls: public: No such file or directory`; `tsk-readme.txt` shows the `.mise.toml` mention and `ls: .mise.toml: No such file or directory`. Keep these files for Task 16. A gap that does not reproduce is dropped from Task 16.

- [ ] **Step 5: Activate the Git hooks (outside the sandbox)**

```bash
npx husky && git config core.hooksPath
```

Expected: `.husky/_`.

- [ ] **Step 6: Node 24**

Replace the content of `.nvmrc` with:

```
24
```

In `.github/workflows/ci.yml`, replace:

```yaml
node-version: 22
```

with:

```yaml
node-version-file: .nvmrc
```

In `README.md`, replace the two prerequisite lines:

```md
- [Node.js](https://nodejs.org/) v22+ (see `.mise.toml` for pinned version)
- [mise](https://mise.jdx.dev/) (recommended for tool version management)
```

with:

```md
- [Node.js](https://nodejs.org/) 24 (see `.nvmrc`)
```

- [ ] **Step 7: Package metadata and scripts**

In `package.json`:

- set `"description": "Aphra website"`;
- delete `"main": "index.js"`;
- set `"license": "UNLICENSED"` and add `"private": true` (brand content, not open source; npm never publishes it);
- add `"engines": { "node": ">=24" }`;
- in `scripts`, add `"format:check": "prettier . --check"` and change `"secretlint": "secretlint **/*"` to `"secretlint": "secretlint \"**/*\""` (secretlint expands the quoted glob itself).

- [ ] **Step 8: commitlint without cspell**

Replace `commitlint.config.js` with:

```js
const Configuration = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 250],
    'scope-case': [2, 'always', ['lower-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
  },
  helpUrl:
    'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
};

export default Configuration;
```

Run: `printf 'chore: probe\n' | npx --no -- commitlint; echo "exit=$?"` → Expected: `exit=0`. Run: `printf 'Probe\n' | npx --no -- commitlint; echo "exit=$?"` → Expected: errors `type-empty` and `subject-empty`, `exit=1`.

- [ ] **Step 9: Ignore local Cloudflare state**

Append to `.gitignore`:

```
.wrangler
.dev.vars*
playwright-report-smoke/
```

- [ ] **Step 10: Run the gates**

```bash
npm run format && npm run format:check && npm run lint && npm run typecheck && npm run secretlint && npm run test:coverage && npm run build
npx playwright install chromium && npm run test:e2e -- --project=chromium
```

Run outside the sandbox (browser download, local server). Expected: every command exits 0; E2E `3 passed`.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: pin node 24 and fix generated config"
```

Expected: the pre-commit hook (lint-staged, typecheck) and the commit-msg hook (commitlint) pass.

- [ ] **Step 12: Push and open the pull request (outside the sandbox)**

Write `$TMPDIR/pr-scaffold.md`:

```md
## Summary

- Frontend scaffold from `@jeportie/create-tskickstart@1.10.0`: React, Vite, Tailwind CSS 4, React Router, TanStack Query, Vitest, Playwright, Husky, commitlint, secretlint, agent crew.
- Node.js 24 in `.nvmrc`, CI and README.
- `package.json`: `private: true`, license `UNLICENSED`, `engines.node >=24`, `format:check` script, quoted secretlint glob.
- `commitlint.config.js` no longer loads `commitlint-plugin-cspell`. The generator installs that plugin only with cspell, so every commit failed without it.

## Verification

- `format:check`, `lint`, `typecheck`, `secretlint`, `test:coverage`, `build`: pass.
- `test:e2e` (Chromium): 3 passed.
```

```bash
git push -u origin chore/scaffold-tskickstart
gh pr create --base dev --head chore/scaffold-tskickstart --title "chore: scaffold frontend with tskickstart 1.10.0" --body-file "$TMPDIR/pr-scaffold.md"
```

- [ ] **Step 13: Stop.** The owner reviews and squash-merges. Then update `dev` locally (see "Order and dependencies").

### Task 5: Worker and Cloudflare Vite plugin

**Branch:** `feat/cloudflare-worker` · **PR title:** `feat: serve the site from a cloudflare worker`

**Files:**

- Create: `worker/index.ts`, `wrangler.jsonc`, `tsconfig.worker.json`, `tests/unit/worker.unit.test.ts`, `tests/unit/wrangler-config.unit.test.ts`, `tests/e2e/api.spec.ts`
- Modify: `package.json` (devDependencies), `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `vitest.config.ts`

**Interfaces:**

- Produces:
  - `worker/index.ts`: `export interface Env { ENVIRONMENT: string; COMMIT_SHA: string }` and a default export `{ fetch(request: Request, env: Env): Response }`.
  - `GET /api/health` → 200 `{ "status": "ok", "environment": env.ENVIRONMENT, "commit": env.COMMIT_SHA }`, `content-type: application/json; charset=utf-8`.
  - Any other method on `/api/health` → 405 `{ "error": "method_not_allowed" }` with `allow: GET, HEAD`. Any other `/api` path → 404 `{ "error": "not_found" }`.
  - `wrangler.jsonc`: `name` `aphra-web`, top-level `vars.ENVIRONMENT` `production`, `env.staging.vars.ENVIRONMENT` `staging`, `vars.COMMIT_SHA` `local` in both (replaced at deploy time).
  - `npm run build` writes `dist/client/`, `dist/aphra_web/` (the Worker and its `wrangler.json`) and `.wrangler/deploy/config.json`. `npx wrangler deploy` then uses the build output with no config flag. The environment is chosen at build time with `CLOUDFLARE_ENV`; `wrangler deploy` never gets `--env`.

- [ ] **Step 1: Branch and dependencies (install outside the sandbox)**

```bash
cd ~/src/aphra-web && git switch dev && git switch -c feat/cloudflare-worker
npm install -D @cloudflare/vite-plugin wrangler@^4.135.0 jsonc-parser
```

Expected: the three packages appear in `devDependencies`.

- [ ] **Step 2: Write the failing Worker test**

Create `tests/unit/worker.unit.test.ts`:

```ts
// @vitest-environment node
import worker from '../../worker/index';

const env = { ENVIRONMENT: 'test', COMMIT_SHA: 'abc123' };
const call = (path: string, init?: RequestInit) =>
  worker.fetch(new Request(`https://aphralab.com${path}`, init), env);

describe('worker', () => {
  it('reports health with the environment and the commit', async () => {
    const response = call('/api/health');

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      status: 'ok',
      environment: 'test',
      commit: 'abc123',
    });
  });

  it('accepts HEAD on the health check', () => {
    expect(call('/api/health', { method: 'HEAD' }).status).toBe(200);
  });

  it('rejects other methods on the health check', async () => {
    const response = call('/api/health', { method: 'POST' });

    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('GET, HEAD');
    expect(await response.json()).toEqual({ error: 'method_not_allowed' });
  });

  it.each(['/api', '/api/', '/api/nope'])(
    'answers %s with a JSON 404',
    async (path) => {
      const response = call(path);

      expect(response.status).toBe(404);
      expect(response.headers.get('content-type')).toBe(
        'application/json; charset=utf-8',
      );
      expect(await response.json()).toEqual({ error: 'not_found' });
    },
  );
});
```

- [ ] **Step 3: Run it to see it fail**

Run: `npx vitest --run tests/unit/worker.unit.test.ts` Expected: FAIL, `Failed to resolve import "../../worker/index"`.

- [ ] **Step 4: Implement the Worker**

Create `worker/index.ts`:

```ts
export interface Env {
  ENVIRONMENT: string;
  COMMIT_SHA: string;
}

const json = (
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });

export default {
  fetch(request: Request, env: Env): Response {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/health') {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return json({ error: 'method_not_allowed' }, 405, {
          allow: 'GET, HEAD',
        });
      }
      return json({
        status: 'ok',
        environment: env.ENVIRONMENT,
        commit: env.COMMIT_SHA,
      });
    }

    return json({ error: 'not_found' }, 404);
  },
};
```

- [ ] **Step 5: Run it to see it pass**

Run: `npx vitest --run tests/unit/worker.unit.test.ts` Expected: PASS, 6 tests.

- [ ] **Step 6: Write the failing config test**

Create `tests/unit/wrangler-config.unit.test.ts`:

```ts
// @vitest-environment node
import { readFileSync } from 'node:fs';

import { parse } from 'jsonc-parser';

interface Route {
  pattern: string;
  custom_domain?: boolean;
}
interface WorkerConfig {
  name: string;
  main: string;
  workers_dev?: boolean;
  routes?: Route[];
  vars?: Record<string, string>;
  assets?: { not_found_handling?: string; run_worker_first?: string[] };
  env?: Record<string, Omit<WorkerConfig, 'env'>>;
}

const config = parse(readFileSync('wrangler.jsonc', 'utf8')) as WorkerConfig;

describe('wrangler.jsonc', () => {
  it('serves production on the apex domain only', () => {
    expect(config.name).toBe('aphra-web');
    expect(config.workers_dev).toBe(false);
    expect(config.routes).toEqual([
      { pattern: 'aphralab.com', custom_domain: true },
    ]);
    expect(config.vars).toEqual({
      ENVIRONMENT: 'production',
      COMMIT_SHA: 'local',
    });
  });

  it('runs the Worker first for the API and falls back to the app', () => {
    expect(config.main).toBe('./worker/index.ts');
    expect(config.assets).toEqual({
      not_found_handling: 'single-page-application',
      run_worker_first: ['/api', '/api/*'],
    });
  });

  it('keeps staging off the production domain', () => {
    const staging = config.env?.staging;

    expect(staging?.workers_dev).toBe(true);
    expect(staging?.routes).toEqual([]);
    expect(staging?.vars).toEqual({
      ENVIRONMENT: 'staging',
      COMMIT_SHA: 'local',
    });
  });
});
```

Run: `npx vitest --run tests/unit/wrangler-config.unit.test.ts` Expected: FAIL, `ENOENT: no such file or directory, open 'wrangler.jsonc'`.

- [ ] **Step 7: Write `wrangler.jsonc`**

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "aphra-web",
  "main": "./worker/index.ts",
  "compatibility_date": "2026-09-23",
  "assets": {
    "not_found_handling": "single-page-application",
    "run_worker_first": ["/api", "/api/*"],
  },
  "workers_dev": false,
  "routes": [{ "pattern": "aphralab.com", "custom_domain": true }],
  "vars": { "ENVIRONMENT": "production", "COMMIT_SHA": "local" },
  "env": {
    "staging": {
      "workers_dev": true,
      "routes": [],
      "vars": { "ENVIRONMENT": "staging", "COMMIT_SHA": "local" },
    },
  },
}
```

The `run_worker_first` array form needs Wrangler 4.20.0 or later and `@cloudflare/vite-plugin` 1.7.0 or later. `vars` is not inherited, so each environment sets both values. `routes` is inherited, so staging overrides it with an empty list; Step 12 checks the resolved result.

Run: `npx vitest --run tests/unit/wrangler-config.unit.test.ts` Expected: PASS, 3 tests.

- [ ] **Step 8: Write the failing E2E test**

Create `tests/e2e/api.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test.describe('API', () => {
  test('answers the health check from the Worker', async ({ request }) => {
    const response = await request.get('/api/health');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe(
      'application/json; charset=utf-8',
    );
    expect(await response.json()).toEqual({
      status: 'ok',
      environment: 'production',
      commit: 'local',
    });
  });

  test('answers unknown API paths with JSON, not the page', async ({
    request,
  }) => {
    for (const path of ['/api', '/api/nope']) {
      const response = await request.get(path);

      expect(response.status()).toBe(404);
      expect(response.headers()['content-type']).toBe(
        'application/json; charset=utf-8',
      );
    }
  });
});
```

The local preview uses the top-level (production) config, so `environment` is `production` and `commit` is `local`.

Run: `npm run test:e2e -- --project=chromium tests/e2e/api.spec.ts` (outside the sandbox) Expected: FAIL: without the plugin, `vite preview` answers `/api/health` with the HTML page (`text/html`).

- [ ] **Step 9: Wire the plugin and the Worker TypeScript project**

Replace `vite.config.ts` with:

```ts
import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
});
```

Create `tsconfig.worker.json`:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.worker.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2022", "WebWorker"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "types": [],
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["worker"]
}
```

The Worker uses only standard `Request`, `Response` and `URL`, so the `WebWorker` lib is enough and no generated file is needed. The Cloudflare templates use `wrangler types` (`worker-configuration.d.ts`); switch to it with the first binding (D1, KV).

In `tsconfig.json`, add the reference:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.test.json" },
    { "path": "./tsconfig.worker.json" }
  ]
}
```

In `eslint.config.js`, add this block right after the "TypeScript parser options for source files" block:

```js
  // Worker sources
  {
    files: ['worker/**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.serviceworker,
      },
    },
  },
```

and change the `files` line of the "General rules for TypeScript files" block to:

```js
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}', 'worker/**/*.ts'],
```

In `vitest.config.ts`, change the coverage `include` to:

```ts
      include: ['src/**/*', 'worker/**/*'],
```

- [ ] **Step 10: Run the E2E test to see it pass**

Run: `npm run test:e2e -- --project=chromium tests/e2e/api.spec.ts` Expected: PASS, 2 tests.

- [ ] **Step 11: Run the gates**

```bash
npm run format && npm run format:check && npm run lint && npm run typecheck && npm run secretlint && npm run test:coverage && npm run build && npm run test:e2e
```

Expected: every command exits 0; E2E passes in Chromium, Firefox and WebKit; `dist/client/` and `dist/aphra_web/wrangler.json` exist.

- [ ] **Step 12: Check the resolved deploy configs**

```bash
jq '{name, workers_dev, routes, vars}' dist/aphra_web/wrangler.json
CLOUDFLARE_ENV=staging npm run build >/dev/null && jq '{name, workers_dev, routes, vars}' dist/aphra_web/wrangler.json
npx wrangler deploy --dry-run --var COMMIT_SHA:abc123 2>&1 | grep -E 'COMMIT_SHA|ENVIRONMENT'
npm run build >/dev/null
```

Expected:

- production build: `"name": "aphra-web"`, `"workers_dev": false`, the `aphralab.com` custom domain route, `ENVIRONMENT` `production`;
- staging build: `"name": "aphra-web-staging"`, `"workers_dev": true`, `routes` empty or absent, `ENVIRONMENT` `staging`;
- dry run (on the staging build): `COMMIT_SHA` listed with `"abc123"`, so the deploy-time `--var` applies to the plugin output.

If the staging build still carries the custom domain, or the dry run does not show `abc123`, stop and report: the CI deploy jobs depend on both. The last command restores the production build.

- [ ] **Step 13: Commit, push and open the pull request**

```bash
git add -A
git commit -m "feat: serve the site from a cloudflare worker"
git push -u origin feat/cloudflare-worker
```

Write `$TMPDIR/pr-worker.md`:

```md
## Summary

- One Cloudflare Worker serves the Vite build as static assets with the single-page-application fallback and runs first for `/api` and `/api/*`.
- `GET /api/health` returns `{ status, environment, commit }`. Other methods get 405, other `/api` paths get a JSON 404.
- `wrangler.jsonc`: production `aphra-web` on `aphralab.com`; `env.staging` (`aphra-web-staging`) on `workers.dev` only, with `routes` overridden to an empty list.

## Verification

- Vitest: Worker handler and `wrangler.jsonc` structure.
- Playwright: `/api/health` and JSON 404 through `vite preview`, which runs the Worker.
- `format:check`, `lint`, `typecheck`, `secretlint`, `build`: pass.
```

```bash
gh pr create --base dev --head feat/cloudflare-worker --title "feat: serve the site from a cloudflare worker" --body-file "$TMPDIR/pr-worker.md"
```

- [ ] **Step 14: Stop.** The owner reviews and squash-merges.

### Task 6: Hello page and brand files

**Branch:** `feat/hello-page` · **PR title:** `feat: add the aphra hello page`

**Files:**

- Create: `src/pages/Home.tsx`, `public/aphra-hello.jpg`, `brand/mock-hello-2026-09-23.jpg`, `docs/guides/brand.md`, `tests/unit/Home.unit.test.tsx`, `tests/e2e/home.spec.ts`
- Modify: `src/App.tsx`, `index.html`, `tests/unit/App.unit.test.tsx`, `tests/integration/App.int.test.tsx`, `README.md`
- Delete: `src/Welcome.tsx`, `src/assets/react.svg`, `src/assets/tailwind.svg`, `src/assets/vite.svg`, `tests/e2e/welcome.spec.ts`

**Interfaces:**

- Consumes: the Worker from Task 5 (the E2E suite still runs `/api` tests).
- Produces: `src/pages/Home.tsx` default export `Home`; the image at `/aphra-hello.jpg`; `index.html` with `lang="fr"`, title `Aphra`, `og:image` `https://aphralab.com/aphra-hello.jpg`.

- [ ] **Step 1: Branch and image files**

```bash
cd ~/src/aphra-web && git switch dev && git switch -c feat/hello-page
mkdir -p public brand src/pages docs/guides
cp "$HOME/Downloads/WhatsApp Image 2026-09-23 at 19.11.36.jpeg" public/aphra-hello.jpg
cp "$HOME/Downloads/WhatsApp Image 2026-09-23 at 19.11.36.jpeg" brand/mock-hello-2026-09-23.jpg
sips -g pixelWidth -g pixelHeight public/aphra-hello.jpg | tail -2
```

Expected: `pixelWidth: 1004`, `pixelHeight: 650`.

- [ ] **Step 2: Write the failing page tests**

Create `tests/unit/Home.unit.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import Home from '../../src/pages/Home';

const ALT =
  "Aphra. Bienvenue, voici le site internet d'Aphra. Marque de boisson de dégustation fabriquée à l'aide d'une technique de clarification artisanale. Notre numéro de téléphone : 06 24 51 14 04. Notre mail est : contact@aphralab.com";
const WARNING =
  "L'abus d'alcool est dangereux pour la santé, à consommer avec modération.";

describe('Home', () => {
  it('shows the mock image with its full text as alternative text', () => {
    render(<Home />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/aphra-hello.jpg');
    expect(image).toHaveAttribute('alt', ALT);
    expect(image).toHaveAttribute('width', '1004');
    expect(image).toHaveAttribute('height', '650');
  });

  it('shows the health warning', () => {
    render(<Home />);

    expect(screen.getByText(WARNING)).toBeInTheDocument();
  });
});
```

Replace `tests/unit/App.unit.test.tsx` with:

```tsx
import { render, screen } from '@testing-library/react';

import App from '../../src/App';

describe('App routes', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('renders the home page on /', () => {
    render(<App />);

    expect(screen.getByRole('img')).toHaveAttribute('src', '/aphra-hello.jpg');
  });

  it('sends unknown paths to /', () => {
    window.history.pushState({}, '', '/contact');
    render(<App />);

    expect(window.location.pathname).toBe('/');
    expect(screen.getByRole('img')).toHaveAttribute('src', '/aphra-hello.jpg');
  });
});
```

Replace `tests/integration/App.int.test.tsx` with:

```tsx
import { render, screen } from '@testing-library/react';

import App from '../../src/App';

describe('App integration', () => {
  it('renders the full hello page through the router', () => {
    render(<App />);

    expect(
      screen.getByRole('img', { name: /contact@aphralab\.com/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/abus d'alcool est dangereux pour la santé/),
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
  });
});
```

The test renders `App`, not `src/main.tsx`: `main.tsx` mounts into `#root` as soon as it is imported and throws when `#root` is missing.

Run: `npx vitest --run tests/unit tests/integration` Expected: FAIL, `Failed to resolve import "../../src/pages/Home"`.

- [ ] **Step 3: Implement the page and the routes**

Create `src/pages/Home.tsx`:

```tsx
const IMAGE_TEXT =
  "Aphra. Bienvenue, voici le site internet d'Aphra. Marque de boisson de dégustation fabriquée à l'aide d'une technique de clarification artisanale. Notre numéro de téléphone : 06 24 51 14 04. Notre mail est : contact@aphralab.com";
const HEALTH_WARNING =
  "L'abus d'alcool est dangereux pour la santé, à consommer avec modération.";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#fcfcf2] p-4">
      <img
        src="/aphra-hello.jpg"
        width={1004}
        height={650}
        alt={IMAGE_TEXT}
        className="h-auto w-full max-w-[1004px]"
      />
      <p className="text-center font-mono text-sm text-neutral-800">
        {HEALTH_WARNING}
      </p>
    </main>
  );
}
```

Replace `src/App.tsx` with:

```tsx
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';

import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

Delete the demo files:

```bash
git rm -q src/Welcome.tsx src/assets/react.svg src/assets/tailwind.svg src/assets/vite.svg tests/e2e/welcome.spec.ts
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `npx vitest --run tests/unit tests/integration` Expected: PASS (Home 2, App routes 2, App integration 1, Worker 6, wrangler config 3).

- [ ] **Step 5: Document metadata**

Replace `index.html` with:

```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Aphra</title>
    <meta
      name="description"
      content="Aphra, marque de boisson de dégustation fabriquée à l'aide d'une technique de clarification artisanale."
    />
    <meta name="theme-color" content="#fcfcf2" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://aphralab.com/" />
    <meta property="og:title" content="Aphra" />
    <meta
      property="og:description"
      content="Marque de boisson de dégustation fabriquée à l'aide d'une technique de clarification artisanale."
    />
    <meta property="og:image" content="https://aphralab.com/aphra-hello.jpg" />
    <meta property="og:image:width" content="1004" />
    <meta property="og:image:height" content="650" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Write the E2E tests**

Create `tests/e2e/home.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

const WARNING =
  "L'abus d'alcool est dangereux pour la santé, à consommer avec modération.";

test.describe('Home page', () => {
  test('shows the mock image and the health warning in French', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('Aphra');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    const image = page.getByRole('img', { name: /contact@aphralab\.com/ });
    await expect(image).toBeVisible();
    await expect
      .poll(() =>
        image.evaluate((img: HTMLImageElement) => [
          img.complete,
          img.naturalWidth,
          img.naturalHeight,
        ]),
      )
      .toEqual([true, 1004, 650]);
    await expect(page.getByText(WARNING)).toBeVisible();
  });

  test('sends unknown paths to the home page', async ({ page }) => {
    const response = await page.goto('/contact');

    expect(response?.status()).toBe(200);
    await expect.poll(() => new URL(page.url()).pathname).toBe('/');
    await expect(page.getByText(WARNING)).toBeVisible();
  });

  test('fits a phone screen without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    await expect(
      page.getByRole('img', { name: /contact@aphralab\.com/ }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      ),
    ).toBeLessThanOrEqual(0);
  });

  test('declares the link preview metadata', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://aphralab.com/aphra-hello.jpg',
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'Aphra',
    );
  });
});
```

Run: `npm run test:e2e` (outside the sandbox) Expected: PASS in the three browsers (home 4, API 2).

- [ ] **Step 7: Brand guide and README intro**

Create `docs/guides/brand.md`:

```md
# Aphra brand guide

## Identity

- Name: Aphra. Domain: aphralab.com. Mail: contact@aphralab.com. Phone: 06 24 51 14 04.
- Product: tasting drinks made with an artisanal clarification technique. The drinks contain alcohol.
- Language: French for all public content.

## Mandatory health warning

Every page shows this sentence, fully legible:

> L'abus d'alcool est dangereux pour la santé, à consommer avec modération.

Legal basis: loi Évin, Code de la santé publique, article L3323-4. The same article limits product copy to objective information: alcohol content, origin, name, composition, producer, production method, sale terms, way of drinking, smell and taste.

## Visual reference

- Current reference: `brand/mock-hello-2026-09-23.jpg` (1004x650).
- Background `#FCFCF2`, near-black ink. Title lettering: rough inked serif. Body text: typewriter-style monospace. Illustration: engraved moon face.
- Missing source files: logo (SVG), moon illustration (SVG or high-resolution PNG), font files and names, colour palette.
```

In `README.md`, replace the first five lines (the `# aphra-web` title, the tskickstart quote and the "This is a modern React single-page application..." paragraph) with:

```md
# Aphra web

Website of Aphra, a French brand of tasting drinks made with an artisanal clarification technique.

- Production: https://aphralab.com (branch `main`)
- Staging: https://aphra-web-staging.aphralab.workers.dev (branch `dev`)
- Design and decisions: [kickstart spec](docs/superpowers/specs/2026-09-23-aphra-web-kickstart-design.md)
- Brand rules: [brand guide](docs/guides/brand.md)
- Rollback: `npx wrangler rollback` (production) or `npx wrangler rollback --env staging`

Scaffolded with [tskickstart](https://github.com/jeportie/tskickstart) 1.10.0. The sections below are its generated manual.
```

- [ ] **Step 8: Gates, commit, pull request**

```bash
npm run format && npm run format:check && npm run lint && npm run typecheck && npm run secretlint && npm run test:coverage && npm run build && npm run test:e2e
git add -A
git commit -m "feat: add the aphra hello page"
git push -u origin feat/hello-page
```

Write `$TMPDIR/pr-hello.md`:

```md
## Summary

- Hello page: the brand mock image as-is (`public/aphra-hello.jpg`, 1004x650) with its full text as alternative text, and the loi Évin health warning under it.
- `index.html`: `lang="fr"`, title, description, link preview metadata. The broken `/vite.svg` favicon link is gone.
- Unknown paths redirect to `/` inside the app.
- `brand/` and `docs/guides/brand.md` hold the brand reference for Claude Design. The tskickstart demo files are removed.

## Verification

- Vitest: page content and routes.
- Playwright (Chromium, Firefox, WebKit): image fully loaded at 1004x650, warning visible, unknown path, 375 px screen without horizontal scroll, link preview metadata.
```

```bash
gh pr create --base dev --head feat/hello-page --title "feat: add the aphra hello page" --body-file "$TMPDIR/pr-hello.md"
```

- [ ] **Step 9: Stop.** The owner reviews and squash-merges.

### Task 7: Smoke tests

**Branch:** `support/ci-pipeline` (shared with Task 8) · **PR title:** `ci: add the delivery pipeline and smoke tests`

**Files:**

- Create: `playwright.smoke.config.ts`, `tests/smoke/site.spec.ts`, `tests/smoke/services.spec.ts`, `tests/smoke/support/dns.ts`, `tests/smoke/support/mail.ts`
- Modify: `package.json` (script `test:smoke`), `vitest.config.ts` (exclude), `tsconfig.test.json` (Node types)

**Interfaces:**

- Consumes: deployed URLs; environment variables `SMOKE_BASE_URL` (required), `EXPECTED_ENVIRONMENT` (`production` or `staging`), `EXPECTED_COMMIT` (optional), `MAIL_PROVIDER` (`hostinger` or `google`, default `google`).
- Produces: `npm run test:smoke` with tags `@site` and `@services` (used by Task 8 workflows).

- [ ] **Step 1: Branch, config and wiring**

```bash
cd ~/src/aphra-web && git switch dev && git switch -c support/ci-pipeline
mkdir -p tests/smoke/support
```

Create `playwright.smoke.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.SMOKE_BASE_URL;
if (!baseURL)
  throw new Error(
    'SMOKE_BASE_URL is required, for example https://aphralab.com',
  );

export default defineConfig({
  testDir: './tests/smoke',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report-smoke' }],
      ]
    : 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
```

In `package.json` `scripts`, add:

```json
"test:smoke": "playwright test --config playwright.smoke.config.ts"
```

In `vitest.config.ts`, change `exclude` to:

```ts
    exclude: ['node_modules/**', 'tests/e2e/**', 'tests/smoke/**'],
```

In `tsconfig.test.json`, change `types` to:

```json
    "types": ["vitest/globals", "node"]
```

- [ ] **Step 2: DNS helpers**

Create `tests/smoke/support/dns.ts`:

```ts
import { Resolver } from 'node:dns/promises';

const resolver = new Resolver();
resolver.setServers(['1.1.1.1', '8.8.8.8']);

export const txt = async (name: string) =>
  (await resolver.resolveTxt(name)).map((chunks) => chunks.join(''));
export const mx = (name: string) => resolver.resolveMx(name);
export const ns = (name: string) => resolver.resolveNs(name);
export const cname = (name: string) => resolver.resolveCname(name);
```

Create `tests/smoke/support/mail.ts`:

```ts
export type MailProvider = 'hostinger' | 'google';

interface MailExpectation {
  mx: string[];
  spfInclude: string;
  dkim:
    | { name: string; kind: 'cname'; target: string }
    | { name: string; kind: 'txt'; prefix: string };
}

export const MAIL: Record<MailProvider, MailExpectation> = {
  hostinger: {
    mx: ['mx1.hostinger.com', 'mx2.hostinger.com'],
    spfInclude: 'include:_spf.mail.hostinger.com',
    dkim: {
      name: 'hostingermail-a._domainkey.aphralab.com',
      kind: 'cname',
      target: 'hostingermail-a.dkim.mail.hostinger.com',
    },
  },
  google: {
    mx: ['smtp.google.com'],
    spfInclude: 'include:_spf.google.com',
    dkim: {
      name: 'google._domainkey.aphralab.com',
      kind: 'txt',
      prefix: 'v=DKIM1;',
    },
  },
};

export const mailProvider = (process.env.MAIL_PROVIDER ??
  'google') as MailProvider;
```

- [ ] **Step 3: `@site` tests**

Create `tests/smoke/site.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

const expectedEnvironment = process.env.EXPECTED_ENVIRONMENT;
const expectedCommit = process.env.EXPECTED_COMMIT;
const TARGET = 'https://aphralab.com/visite?source=test';

test.describe('site', { tag: '@site' }, () => {
  test('health check reports the deployed build', async ({ request }) => {
    const response = await request.get('/api/health');

    expect(response.status()).toBe(200);
    const body = (await response.json()) as {
      status: string;
      environment: string;
      commit: string;
    };
    expect(body.status).toBe('ok');
    if (expectedEnvironment) expect(body.environment).toBe(expectedEnvironment);
    if (expectedCommit) expect(body.commit).toBe(expectedCommit);
  });

  test('home page is served by Cloudflare over HTTPS', async ({ request }) => {
    const response = await request.get('/');

    expect(response.status()).toBe(200);
    expect(response.url()).toMatch(/^https:\/\//);
    expect(response.headers().server).toBe('cloudflare');
    expect(response.headers()['cf-ray']).toBeTruthy();
    expect(await response.text()).toContain('<title>Aphra</title>');
  });

  test('link preview image is served', async ({ request }) => {
    const html = await (await request.get('/')).text();
    const ogImage = /<meta property="og:image" content="([^"]+)"/.exec(
      html,
    )?.[1];
    expect(ogImage).toBe('https://aphralab.com/aphra-hello.jpg');

    const imageUrl =
      expectedEnvironment === 'production' && ogImage
        ? ogImage
        : '/aphra-hello.jpg';
    const image = await request.get(imageUrl);
    expect(image.status()).toBe(200);
    expect(image.headers()['content-type']).toBe('image/jpeg');
  });
});

test.describe('redirects', { tag: '@site' }, () => {
  test.skip(
    expectedEnvironment !== 'production',
    'domain redirects exist in production only',
  );

  const sources = [
    'http://aphralab.com/visite?source=test',
    'https://www.aphralab.com/visite?source=test',
    'http://www.aphralab.com/visite?source=test',
    'https://aphralab.fr/visite?source=test',
    'https://www.aphralab.fr/visite?source=test',
    'https://aphralab.online/visite?source=test',
    'https://www.aphralab.online/visite?source=test',
  ];

  for (const source of sources) {
    test(`${source} lands on the apex with the same path and query`, async ({
      request,
    }) => {
      const first = await request.get(source, { maxRedirects: 0 });
      expect(first.status()).toBe(301);

      const final = await request.get(source);
      expect(final.url()).toBe(TARGET);
    });
  }
});
```

`/visite` does not exist in the app: the Worker assets fallback serves the page, then React Router moves the browser to `/`. A plain HTTP request does not run JavaScript, so its final URL stays `https://aphralab.com/visite?source=test`.

- [ ] **Step 4: `@services` tests**

Create `tests/smoke/services.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

import { cname, mx, ns, txt } from './support/dns';
import { MAIL, mailProvider } from './support/mail';

const DOMAINS = ['aphralab.com', 'aphralab.fr', 'aphralab.online'];

test.describe('registrar', { tag: '@services' }, () => {
  for (const domain of DOMAINS) {
    test(`${domain} delegates to Cloudflare`, async () => {
      const servers = await ns(domain);

      expect(servers.length).toBeGreaterThanOrEqual(2);
      for (const server of servers)
        expect(server).toMatch(/\.ns\.cloudflare\.com$/);
    });

    test(`${domain} stays registered for more than 30 days`, async ({
      request,
    }) => {
      const response = await request.get(`https://rdap.org/domain/${domain}`);
      expect(response.status()).toBe(200);

      const data = (await response.json()) as {
        events?: { eventAction: string; eventDate: string }[];
      };
      const expiry = data.events?.find(
        (event) => event.eventAction === 'expiration',
      )?.eventDate;
      expect(expiry, `no expiration event for ${domain}`).toBeTruthy();
      expect(
        (Date.parse(expiry ?? '') - Date.now()) / 86_400_000,
      ).toBeGreaterThan(30);
    });
  }
});

test.describe(
  `mail for aphralab.com (${mailProvider})`,
  { tag: '@services' },
  () => {
    const expected = MAIL[mailProvider];

    test('MX records point to the provider', async () => {
      const hosts = (await mx('aphralab.com'))
        .map((record) => record.exchange)
        .sort();

      expect(hosts).toEqual([...expected.mx].sort());
    });

    test('SPF includes the provider', async () => {
      const spf = (await txt('aphralab.com')).filter((record) =>
        record.startsWith('v=spf1'),
      );

      expect(spf).toHaveLength(1);
      expect(spf[0]).toContain(expected.spfInclude);
    });

    test('DKIM key is published', async () => {
      const { dkim } = expected;
      if (dkim.kind === 'cname') {
        expect(await cname(dkim.name)).toEqual([dkim.target]);
      } else {
        expect(
          (await txt(dkim.name)).some((record) =>
            record.startsWith(dkim.prefix),
          ),
        ).toBe(true);
      }
    });

    test('DMARC policy exists', async () => {
      expect(
        (await txt('_dmarc.aphralab.com')).some((record) =>
          record.startsWith('v=DMARC1'),
        ),
      ).toBe(true);
    });
  },
);

test.describe('domains without mail', { tag: '@services' }, () => {
  for (const domain of ['aphralab.fr', 'aphralab.online']) {
    test(`${domain} refuses mail`, async () => {
      const records = await mx(domain);
      expect(records).toHaveLength(1);
      expect(records[0]?.priority).toBe(0);
      expect(['', '.']).toContain(records[0]?.exchange);

      expect(await txt(domain)).toContain('v=spf1 -all');
      expect(await txt(`_dmarc.${domain}`)).toContain('v=DMARC1; p=reject');
    });
  }
});
```

`rdap.org` answers 302 to the registry server (Verisign for `.com`, AFNIC for `.fr`, Radix for `.online`) and the request follows it. All three registries publish an `expiration` event (2027-09-16 on 2026-09-23). `rdap.org` allows 10 requests per 10 seconds; the suite makes 3.

- [ ] **Step 5: Run the smoke tests before any deploy (expected red on the Cloudflare check)**

Start the local production build as a background process (Bash tool with `run_in_background: true`, outside the sandbox):

```bash
cd ~/src/aphra-web && npm run build && npm run preview -- --host 127.0.0.1 --port 4173
```

Then, in a second call:

```bash
cd ~/src/aphra-web && SMOKE_BASE_URL=http://127.0.0.1:4173 npm run test:smoke -- --grep @site
```

`EXPECTED_ENVIRONMENT` is left unset, so the health test checks only `status` and the `redirects` block is skipped. Expected: `1 failed` (`home page is served by Cloudflare over HTTPS`: `http://` URL, no `server: cloudflare` header), `2 passed`, `7 skipped`. This shows the test detects a response that did not come through Cloudflare. Then stop the background preview process.

- [ ] **Step 6: Run the `@services` tests against the live DNS**

Requires Task 3 done (zones active).

```bash
SMOKE_BASE_URL=https://aphralab.com MAIL_PROVIDER=hostinger npm run test:smoke -- --grep @services
MAIL_PROVIDER=google SMOKE_BASE_URL=https://aphralab.com npm run test:smoke -- --grep "@services" --grep-invert "registrar|without mail"
```

Run outside the sandbox (raw DNS on port 53). Expected: the first run passes; the second run fails on the three Google checks (the records still point to Hostinger). This shows the mail checks follow `MAIL_PROVIDER`.

- [ ] **Step 7: Gates and commit**

```bash
npm run format && npm run format:check && npm run lint && npm run typecheck && npm run test:coverage
git add -A
git commit -m "test: add smoke tests for the site and its services"
```

### Task 8: CI/CD workflows and release config

**Branch:** `support/ci-pipeline` (continues Task 7)

**Files:**

- Modify: `.github/workflows/ci.yml` (replaced)
- Create: `.github/workflows/pr-title.yml`, `.github/workflows/smoke.yml`, `.github/rulesets/protect-dev-and-main.json`, `release.config.mjs`
- Modify: `package.json` (devDependencies for semantic-release)

**Interfaces:**

- Consumes: `npm run build`, `npm run test:e2e`, `npm run test:smoke` (Tasks 4 to 7); secrets and variables from Task 9: `CLOUDFLARE_API_TOKEN` (environment secret), `CLOUDFLARE_ACCOUNT_ID`, `MAIL_PROVIDER` (repository variables).
- Produces: required check names `checks`, `e2e`, `pr-title` (used by Task 11); environments `staging` and `production` (used by Task 9).

- [ ] **Step 1: Release dependencies (outside the sandbox)**

```bash
npm install -D semantic-release@^25 conventional-changelog-conventionalcommits@^9
npm ls conventional-changelog-conventionalcommits
```

`conventional-changelog-conventionalcommits` stays on 9: version 10 produces empty release notes with `@semantic-release/release-notes-generator` 14. Expected from `npm ls`: a top-level 9.x, and a nested 10.x under `@commitlint/config-conventional`.

- [ ] **Step 2: `release.config.mjs`**

```js
export default {
  branches: ['main'],
  plugins: [
    ['@semantic-release/commit-analyzer', { preset: 'conventionalcommits' }],
    [
      '@semantic-release/release-notes-generator',
      { preset: 'conventionalcommits' },
    ],
    '@semantic-release/github',
  ],
};
```

- [ ] **Step 3: Replace `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  pull_request:
    branches: [dev, main]
  push:
    branches: [dev, main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}

permissions:
  contents: read

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run format:check
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run secretlint
      - run: npm run test:coverage
      - run: npm run build

  e2e:
    needs: checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v7
        if: failure()
        with:
          name: playwright-report
          path: playwright-report
          retention-days: 7

  deploy-staging:
    if: github.event_name == 'push' && github.ref == 'refs/heads/dev'
    needs: e2e
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://aphra-web-staging.aphralab.workers.dev
    concurrency:
      group: deploy-staging
      cancel-in-progress: false
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          CLOUDFLARE_ENV: staging
      - uses: cloudflare/wrangler-action@v4
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy --var COMMIT_SHA:${{ github.sha }}
      - run: npx playwright install --with-deps chromium
      - run: npm run test:smoke -- --grep @site
        env:
          SMOKE_BASE_URL: https://aphra-web-staging.aphralab.workers.dev
          EXPECTED_ENVIRONMENT: staging
          EXPECTED_COMMIT: ${{ github.sha }}

  deploy-production:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: e2e
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://aphralab.com
    concurrency:
      group: deploy-production
      cancel-in-progress: false
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/wrangler-action@v4
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy --var COMMIT_SHA:${{ github.sha }}
      - run: npx playwright install --with-deps chromium
      - run: npm run test:smoke -- --grep @site
        env:
          SMOKE_BASE_URL: https://aphralab.com
          EXPECTED_ENVIRONMENT: production
          EXPECTED_COMMIT: ${{ github.sha }}

  release:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: deploy-production
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v7
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v7
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Task 5 Step 12 checked that `--var` applies to the plugin output. The `environment` input of `wrangler-action` stays unset: it would add `--env`, and the environment is already fixed by the build.

- [ ] **Step 4: Create `.github/workflows/pr-title.yml`**

```yaml
name: PR title

on:
  pull_request:
    branches: [dev, main]
    types: [opened, edited, synchronize, reopened]

permissions:
  contents: read

jobs:
  pr-title:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - name: Check the pull request title
        env:
          PR_TITLE: ${{ github.event.pull_request.title }}
        run: printf '%s\n' "$PR_TITLE" | npx --no -- commitlint
```

A separate workflow, because the default `pull_request` types do not include `edited`: a corrected title re-runs only this check. The title goes through `env`, never straight into the script, to block script injection.

- [ ] **Step 5: Create `.github/workflows/smoke.yml`**

```yaml
name: Smoke

on:
  schedule:
    - cron: '0 6 * * *'
  workflow_dispatch:

permissions:
  contents: read

jobs:
  smoke:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:smoke
        env:
          SMOKE_BASE_URL: https://aphralab.com
          EXPECTED_ENVIRONMENT: production
          MAIL_PROVIDER: ${{ vars.MAIL_PROVIDER }}
      - uses: actions/upload-artifact@v7
        if: failure()
        with:
          name: playwright-report-smoke
          path: playwright-report-smoke
          retention-days: 14
```

Scheduled workflows run on the default branch (`dev`); they test production.

- [ ] **Step 6: Create `.github/rulesets/protect-dev-and-main.json`**

```json
{
  "name": "protect-dev-and-main",
  "target": "branch",
  "enforcement": "active",
  "bypass_actors": [],
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/dev", "refs/heads/main"],
      "exclude": []
    }
  },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false,
        "allowed_merge_methods": ["merge", "squash"]
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "do_not_enforce_on_create": false,
        "required_status_checks": [
          { "context": "checks", "integration_id": 15368 },
          { "context": "e2e", "integration_id": 15368 },
          { "context": "pr-title", "integration_id": 15368 }
        ]
      }
    }
  ]
}
```

The check contexts are the job ids; `15368` is the GitHub Actions app. There is no `required_linear_history` rule: it would block the `dev` to `main` merge commit. `strict_required_status_checks_policy` is `false`: a merge commit on `main` never reaches `dev`, so strict mode would mark every release pull request out of date. Task 11 applies this file.

- [ ] **Step 7: Check the release config locally**

```bash
GITHUB_TOKEN="$(gh auth token)" npx --no -- semantic-release --dry-run --no-ci 2>&1 | tail -5
```

Expected: a message that the run was triggered on `support/ci-pipeline` while releases only happen on `main`, and no error about the config or the plugins.

- [ ] **Step 8: Gates, commit, pull request**

```bash
npm run format && npm run format:check && npm run lint && npm run typecheck
git add -A
git commit -m "ci: deploy staging and production from github actions"
git push -u origin support/ci-pipeline
```

Write `$TMPDIR/pr-ci.md`:

```md
## Summary

- `ci.yml`: `checks` (format check, lint, typecheck, secretlint, Vitest with coverage, build) and `e2e` (Playwright, three browsers).
- `pr-title.yml`: commitlint on the pull request title, also when the title is edited.
- `.github/rulesets/protect-dev-and-main.json`: branch rules for `dev` and `main`, applied after the merge.
- Push to `dev`: deploy `aphra-web-staging`, then `@site` smoke tests on the staging URL.
- Push to `main`: deploy `aphra-web`, `@site` smoke tests on `https://aphralab.com`, then semantic-release (GitHub release only).
- `smoke.yml`: full smoke suite on production every day at 06:00 UTC and on demand.
- Smoke tests: `@site` (health commit, Cloudflare headers, link preview image, redirects with path and query) and `@services` (Cloudflare delegation, domain expiry, mail records per `MAIL_PROVIDER`, no-mail domains).

## Verification

- `@site` against a local preview fails on the Cloudflare check, as expected without Cloudflare.
- `@services` against the live DNS passes with `MAIL_PROVIDER=hostinger`.
- `semantic-release --dry-run`: config loads; no release outside `main`.
- The deploy jobs run after the merge: they need the Task 9 secrets.
```

```bash
gh pr create --base dev --head support/ci-pipeline --title "ci: add the delivery pipeline and smoke tests" --body-file "$TMPDIR/pr-ci.md"
gh pr checks --watch
```

Expected: `checks`, `e2e` and `pr-title` pass on the pull request.

- [ ] **Step 9: Stop.** Do not merge yet: Task 9 comes first. Then the owner squash-merges.

---

## Phase 4: Delivery

### Task 9: `workers.dev` subdomain, environments, variables and the token

**Files:** none (Cloudflare and GitHub state).

**Interfaces:**

- Produces: `aphralab.workers.dev`; GitHub environments `staging` (branch `dev`) and `production` (branch `main`) each holding `CLOUDFLARE_API_TOKEN`; repository variables `CLOUDFLARE_ACCOUNT_ID` and `MAIL_PROVIDER=hostinger`.

- [ ] **Step 1: Create the `workers.dev` subdomain**

Through `mcp__cloudflare__execute`:

```js
async () => {
  const r = await cloudflare.request({
    method: 'PUT',
    path: `/accounts/${accountId}/workers/subdomain`,
    body: { subdomain: 'aphralab' },
  });
  return r.result;
};
```

Expected: `{ "subdomain": "aphralab" }`. The API has no availability check: a taken name comes back as a 4xx error. If the name is taken, use `aphra-lab` and replace `aphralab.workers.dev` with `aphra-lab.workers.dev` in `.github/workflows/ci.yml`, `README.md` and the spec in a `chore/` pull request.

- [ ] **Step 2: GitHub environments with branch rules**

```bash
for pair in staging:dev production:main; do
  env="${pair%%:*}"; branch="${pair##*:}"
  gh api -X PUT "repos/Aphra-lab/aphra-web/environments/$env" \
    -F 'deployment_branch_policy[protected_branches]=false' \
    -F 'deployment_branch_policy[custom_branch_policies]=true' >/dev/null
  gh api -X POST "repos/Aphra-lab/aphra-web/environments/$env/deployment-branch-policies" -f name="$branch" -f type=branch >/dev/null
done
gh api repos/Aphra-lab/aphra-web/environments -q '.environments[] | .name + " " + (.deployment_branch_policy.custom_branch_policies | tostring)'
for env in staging production; do gh api "repos/Aphra-lab/aphra-web/environments/$env/deployment-branch-policies" -q '.branch_policies[].name'; done
```

Expected: `production true` and `staging true`, then `dev` and `main`. Only `dev` can deploy to staging and only `main` to production.

- [ ] **Step 3: Repository variables**

```bash
gh variable set CLOUDFLARE_ACCOUNT_ID -R Aphra-lab/aphra-web --body 507e2472cb49976c013eb085e2d4a004
gh variable set MAIL_PROVIDER -R Aphra-lab/aphra-web --body hostinger
gh variable list -R Aphra-lab/aphra-web
```

- [ ] **Step 4 (owner): Create the API token and store it**

In the Cloudflare dashboard, as Super Administrator of the Aphra account: **Manage Account → Account API Tokens → Create Token** (direct link: https://dash.cloudflare.com/?to=/:account/api-tokens). Custom token named `github-actions-aphra-web`, with:

- Workers: role **Admin** at the Workers product scope, not "Specified Workers" (custom domains do not support per-Worker roles yet). Admin is needed once, to create `aphra-web` and `aphra-web-staging`;
- Zone: **Workers Routes → Write**, zone `aphralab.com` only.

Then **Continue to summary → Create Token**, and copy the token.

Then, in a local terminal:

```bash
gh secret set CLOUDFLARE_API_TOKEN -R Aphra-lab/aphra-web --env staging
gh secret set CLOUDFLARE_API_TOKEN -R Aphra-lab/aphra-web --env production
```

Each command prompts for the value; paste the token. The token goes into no other place.

- [ ] **Step 5: Verify**

```bash
gh secret list -R Aphra-lab/aphra-web --env staging
gh secret list -R Aphra-lab/aphra-web --env production
```

Expected: `CLOUDFLARE_API_TOKEN` in both lists.

### Task 10: First staging deploy

- [ ] **Step 1 (owner):** squash-merge the Task 7-8 pull request into `dev`.
- [ ] **Step 2: Watch the pipeline**

```bash
sleep 10; gh run watch "$(gh run list -R Aphra-lab/aphra-web --branch dev --event push --limit 1 --json databaseId -q '.[0].databaseId')" -R Aphra-lab/aphra-web --exit-status
```

Expected: `checks`, `e2e`, `deploy-staging` succeed; the smoke step prints its `@site` tests as passed and the `redirects` block as skipped.

- [ ] **Step 3: Check by hand**

```bash
git switch dev && git pull --ff-only
curl -s https://aphra-web-staging.aphralab.workers.dev/api/health; echo; git rev-parse HEAD
curl -sI https://aphra-web-staging.aphralab.workers.dev/ | grep -i -E '^(HTTP|server|cf-ray|content-type)'
```

Expected: `{"status":"ok","environment":"staging","commit":"<sha>"}` with the same sha as `git rev-parse HEAD`; `HTTP/2 200`, `server: cloudflare`, a `cf-ray`, `content-type: text/html`.

### Task 11: Branch rulesets

- [ ] **Step 1: Create the ruleset**

```bash
cd ~/src/aphra-web && git switch dev && git pull --ff-only
gh api --method POST repos/Aphra-lab/aphra-web/rulesets --input .github/rulesets/protect-dev-and-main.json -q '.id'
```

Expected: a ruleset id. Later changes go through a pull request on the file, then `gh api --method PUT repos/Aphra-lab/aphra-web/rulesets/<id> --input .github/rulesets/protect-dev-and-main.json`.

- [ ] **Step 2: Verify**

```bash
gh api repos/Aphra-lab/aphra-web/rules/branches/dev -q '[.[].type] | sort | join(",")'
gh api repos/Aphra-lab/aphra-web/rules/branches/main -q '[.[].type] | sort | join(",")'
```

Expected for both: `deletion,non_fast_forward,pull_request,required_status_checks`.

### Task 12: First production release

Requires: Task 3 done (three zones `active`), Task 10 green.

- [ ] **Step 1: Open the release pull request**

Write `$TMPDIR/pr-release.md`:

```md
## Summary

First production release: tskickstart scaffold, Cloudflare Worker, hello page, pipeline and smoke tests.

## Merge

Merge commit, not squash: semantic-release reads each commit from `dev`.
```

```bash
gh pr create -R Aphra-lab/aphra-web --base main --head dev --title "chore: release milestone 1" --body-file "$TMPDIR/pr-release.md"
```

- [ ] **Step 2 (owner):** merge with **Create a merge commit**.
- [ ] **Step 3: Watch the pipeline**

```bash
sleep 10; gh run watch "$(gh run list -R Aphra-lab/aphra-web --branch main --event push --limit 1 --json databaseId -q '.[0].databaseId')" -R Aphra-lab/aphra-web --exit-status
```

Expected: `checks`, `e2e`, `deploy-production` (creates `aphra-web` and the `aphralab.com` custom domain), smoke `@site` including the 7 redirect tests, then `release`.

- [ ] **Step 4: Verify the release and the site**

```bash
gh release view -R Aphra-lab/aphra-web --json tagName,name -q '.tagName'
curl -s https://aphralab.com/api/health; echo
curl -sI https://www.aphralab.com/visite?x=1 | grep -i -E '^(HTTP|location)'
```

Expected: `v1.0.0`; `{"status":"ok","environment":"production","commit":"<main sha>"}`; `HTTP/2 301` and `location: https://aphralab.com/visite?x=1`.

- [ ] **Step 5: Run the full smoke suite once**

```bash
gh workflow run smoke.yml -R Aphra-lab/aphra-web --ref dev
sleep 10; gh run watch "$(gh run list -R Aphra-lab/aphra-web --workflow smoke.yml --limit 1 --json databaseId -q '.[0].databaseId')" -R Aphra-lab/aphra-web --exit-status
```

Expected: pass (`MAIL_PROVIDER=hostinger`).

- [ ] **Step 6: Lower the token permission (owner, optional)**

In the dashboard, edit the token: **Workers Admin** → **Workers Editor**. Then re-run the last production deploy job:

```bash
run="$(gh run list -R Aphra-lab/aphra-web --branch main --event push --limit 1 --json databaseId -q '.[0].databaseId')"
job="$(gh run view "$run" -R Aphra-lab/aphra-web --json jobs -q '.jobs[] | select(.name=="deploy-production") | .databaseId')"
gh run rerun "$run" -R Aphra-lab/aphra-web --job "$job"
sleep 10; gh run watch "$run" -R Aphra-lab/aphra-web --exit-status
```

Expected: the job passes. If it fails on permissions, restore **Workers Admin** and record the error in the final report.

---

## Phase 5: Mail (spec 5.2, Phase B)

### Task 13: Google Workspace sign-up and domain verification

- [ ] **Step 1 (owner):** at workspace.google.com, subscribe to **Business Starter** with the domain `aphralab.com`. Google shows a TXT value that starts with `google-site-verification=`. Paste it into the conversation (it is a public DNS value).
- [ ] **Step 2: Add the verification record**

```js
async () => {
  const zone = (
    await cloudflare.request({
      method: 'GET',
      path: '/zones',
      query: { name: 'aphralab.com' },
    })
  ).result[0];
  const r = await cloudflare.request({
    method: 'POST',
    path: `/zones/${zone.id}/dns_records`,
    body: {
      type: 'TXT',
      name: 'aphralab.com',
      content: '"google-site-verification=<value from Step 1>"',
      ttl: 1,
    },
  });
  return `${r.result.type} ${r.result.name} ${r.result.content}`;
};
```

The `<value from Step 1>` part is the exact string the owner pasted.

- [ ] **Step 3 (owner):** click **Verify** in the Google setup. Expected: domain verified.
- [ ] **Step 4 (owner):** create `contact@aphralab.com` in Workspace (as the user, or as an alias of the user). Mail is not switched yet.

### Task 14: Mail cutover and Hostinger refund

- [ ] **Step 1: Add the Google MX, then remove the Hostinger mail records**

```js
async () => {
  const zone = (
    await cloudflare.request({
      method: 'GET',
      path: '/zones',
      query: { name: 'aphralab.com' },
    })
  ).result[0];
  const base = `/zones/${zone.id}/dns_records`;
  const list = (
    await cloudflare.request({
      method: 'GET',
      path: base,
      query: { per_page: 100 },
    })
  ).result;
  const log = [];
  await cloudflare.request({
    method: 'POST',
    path: base,
    body: {
      type: 'MX',
      name: 'aphralab.com',
      content: 'smtp.google.com',
      priority: 1,
      ttl: 1,
    },
  });
  log.push('added MX 1 smtp.google.com');
  const spf = list.find(
    (r) =>
      r.type === 'TXT' &&
      r.name === 'aphralab.com' &&
      r.content.includes('v=spf1'),
  );
  await cloudflare.request({
    method: 'PATCH',
    path: `${base}/${spf.id}`,
    body: { content: '"v=spf1 include:_spf.google.com ~all"' },
  });
  log.push('SPF now includes _spf.google.com');
  const hostinger = list.filter(
    (r) =>
      (r.type === 'MX' && r.content.endsWith('hostinger.com')) ||
      (r.type === 'CNAME' &&
        (r.name.includes('._domainkey.') ||
          r.name.startsWith('autodiscover.') ||
          r.name.startsWith('autoconfig.'))),
  );
  for (const r of hostinger) {
    await cloudflare.request({ method: 'DELETE', path: `${base}/${r.id}` });
    log.push(`deleted ${r.type} ${r.name} ${r.content}`);
  }
  return log;
};
```

Expected: 1 addition, 1 SPF update, 7 deletions (2 MX, 3 DKIM, autodiscover, autoconfig). The values follow Google's documentation: MX `smtp.google.com` priority 1, SPF `v=spf1 include:_spf.google.com ~all`. Then the owner clicks **Activate Gmail** in the Google Admin console; Google allows up to 72 hours.

- [ ] **Step 2 (owner): Generate the DKIM key**

Google Admin console → **Apps → Google Workspace → Gmail → Authenticate email** → domain `aphralab.com` → **Generate new record** (2048 bits, prefix `google`). Paste the TXT value (starts with `v=DKIM1;`) into the conversation. Google gives the DKIM key only 24 to 72 hours after Gmail is turned on. Until then, this step waits; the rest of the switch stays in place.

- [ ] **Step 3: Publish the DKIM key, then the owner starts authentication**

```js
async () => {
  const zone = (
    await cloudflare.request({
      method: 'GET',
      path: '/zones',
      query: { name: 'aphralab.com' },
    })
  ).result[0];
  const r = await cloudflare.request({
    method: 'POST',
    path: `/zones/${zone.id}/dns_records`,
    body: {
      type: 'TXT',
      name: 'google._domainkey.aphralab.com',
      content: '"<value from Step 2>"',
      ttl: 1,
    },
  });
  return `${r.result.type} ${r.result.name}`;
};
```

The `<value from Step 2>` part is the exact string the owner pasted. Then the owner clicks **Start authentication** in the same Admin console page.

- [ ] **Step 4: Check the public records**

```bash
q() { curl -s -H 'accept: application/dns-json' "https://cloudflare-dns.com/dns-query?name=$1&type=$2" | jq -r --arg n "$1" --arg t "$2" '"\($n) \($t): " + ([.Answer[]?.data] | join(" | "))'; }
q aphralab.com MX; q aphralab.com TXT; q google._domainkey.aphralab.com TXT; q _dmarc.aphralab.com TXT
```

Expected: `1 smtp.google.com.`; one SPF with `include:_spf.google.com`; a DKIM TXT starting with `v=DKIM1;`; DMARC `v=DMARC1; p=none`.

- [ ] **Step 5 (owner): Test mail and last check of the old mailbox**

From an outside address, send to `contact@aphralab.com` and reply from Gmail; both arrive. Open the Hostinger webmail one last time and keep any mail that arrived during the switch.

- [ ] **Step 6: Switch the smoke tests to Google and run them**

```bash
gh variable set MAIL_PROVIDER -R Aphra-lab/aphra-web --body google
gh workflow run smoke.yml -R Aphra-lab/aphra-web --ref dev
sleep 10; gh run watch "$(gh run list -R Aphra-lab/aphra-web --workflow smoke.yml --limit 1 --json databaseId -q '.[0].databaseId')" -R Aphra-lab/aphra-web --exit-status
```

Expected: pass.

- [ ] **Step 7 (owner): Refund the Hostinger mail plan**

hPanel → **Billing** → refund page → the Hostinger Email payment → **Refund**. This must happen within 30 days of the purchase. The refund cancels the mailbox at once, which is why it comes last.

---

## Phase 6: Design and upstream

### Task 15: Claude Design (owner)

- [ ] **Step 1:** sign in to claude.ai with the personal account (paid plan). Open Claude Design → design systems → create a design system named "Aphra": link `github.com/Aphra-lab/aphra-web` and upload `brand/mock-hello-2026-09-23.jpg` and `docs/guides/brand.md`.
- [ ] **Step 2:** review the extracted colours and typography, then **Publish**.
- [ ] **Step 3:** in Claude Code inside `~/src/aphra-web`, run `/design-login` and sign in with the personal account, so later `/design-sync` runs use it.
- [ ] **Step 4:** report the design system name in the final report. The first real page design follows the loop in spec section 9.

### Task 16: tskickstart issues

Use the `upstream-fix` skill. For each gap that reproduced in Task 4 Step 4, search first, then file one issue. Issue text follows the global writing constraints.

- [ ] **Step 1: Search for duplicates**

```bash
gh issue list -R jeportie/tskickstart --state all --limit 100 --json number,title -q '.[] | "\(.number) \(.title)"'
```

Expected: no issue already covers an item below; skip any item that is covered.

- [ ] **Step 2: File the issues**

For each item, write the body to `$TMPDIR/issue-<n>.md` and run:

```bash
gh issue create -R jeportie/tskickstart --title "<title>" --body-file "$TMPDIR/issue-<n>.md"
```

| # | Title | Body (Evidence = the matching `$TMPDIR/tsk-*.txt` content) |
| --- | --- | --- |
| 1 | `feat(frontend): add a cloudflare workers deploy target` | The frontend type has no deploy target. A working reference exists in Aphra-lab/aphra-web: `@cloudflare/vite-plugin`, `wrangler.jsonc` with `env.staging`, and a GitHub Actions deploy job. Expected: an option that generates this setup. |
| 2 | `feat(cicd): build, run playwright and deploy in the frontend ci` | The generated `ci.yml` runs `npm run check` on pull requests only. It does not build, does not run Playwright and does not deploy. Evidence: the generated `ci.yml`. Expected: build and Playwright jobs, and push triggers on the release branches. |
| 3 | `fix(commitlint): do not load the cspell plugin when cspell is not selected` | With `LINT_OPTIONS=commitlint,secretlint`, `commitlint.config.js` loads `commitlint-plugin-cspell`, but `install.js` installs it only when cspell is selected. Evidence: `tsk-commitlint.txt`. Expected: the plugin and the `cspell/*` rules only with cspell. |
| 4 | `fix(scripts): check formatting without writing in the check script` | `check` runs `npm run format` (`prettier . --write`), so CI never fails on formatting. Evidence: `tsk-package.txt`. Expected: a `format:check` script (`prettier . --check`) used by `check`. |
| 5 | `chore(node): default to node 24` | `.nvmrc` is `22` and the workflow pins Node 22. Node 24 is the current LTS. Evidence: `tsk-nvmrc.txt`. |
| 6 | `fix(frontend): remove the favicon link to a missing file` | `index.html` links `/vite.svg`, but no `public/` folder is generated, so the favicon request returns the app page. Evidence: `tsk-favicon.txt`. |
| 7 | `fix(package): set private and a license for generated apps` | `npm init -y` leaves `"license": "ISC"`, `"main": "index.js"` and no `"private": true` for an app. Evidence: `tsk-package.txt`. |
| 8 | `fix(readme): do not reference .mise.toml when hk is not selected` | The README prerequisites point to `.mise.toml`, but the file exists only with hk. Evidence: `tsk-readme.txt`. |
| 9 | `fix(secretlint): quote the glob in the secretlint script` | Filed only if `tsk-secretlint.txt` shows an error or scanned files outside the project; otherwise dropped. Expected: `secretlint "**/*"` so secretlint expands the glob. |

Each body has three short sections: "Observed" (the facts above), "Evidence" (the command and its output from the evidence file), "Expected".

- [ ] **Step 3:** list the created issue URLs in the final report.

### Task 17: Final verification against the spec

- [ ] **Step 1: Criteria 1 to 5**

```bash
for u in https://aphralab.com/ http://aphralab.com/ https://www.aphralab.com/ https://aphralab.fr/ https://aphralab.online/; do
  printf '%-28s ' "$u"; curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "$u"
done
gh run list -R Aphra-lab/aphra-web --limit 10
gh release list -R Aphra-lab/aphra-web --limit 3
```

Expected: `200` for the first URL, `301 https://aphralab.com/` for the others; green runs for the pull requests, `dev`, `main` and the smoke workflow; release `v1.0.0`.

- [ ] **Step 2: Criteria 6 to 8.** Owner confirms: mail through Google works, the Hostinger refund is done, the design system exists. Issue URLs from Task 16 are listed.
- [ ] **Step 3: Final report** to the owner: URLs, release tag, issue links, anything skipped with its reason.
