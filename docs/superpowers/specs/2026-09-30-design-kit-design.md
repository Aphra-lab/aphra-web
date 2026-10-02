# Aphra design kit: design

- Date: 2026-09-30
- Status: approved. Implementation plan: `docs/superpowers/plans/2026-09-30-design-kit.md`. Sections 4.1, 4.2, 6.1, 7.2, 8, 11, 12 and 15 were amended during planning.
- Reference: [LedgerHQ/lumen](https://github.com/LedgerHQ/lumen), the Ledger design system (tokens, React components, Storybook, AI rules).

## 1. Context

Aphra is a French brand of tasting drinks made with an artisanal clarification technique. The drinks contain alcohol. The site `aphralab.com` shows one hello page today (see the kickstart spec).

The brand guide (`docs/guides/brand.md`) lists these as missing: logo, moon illustration, font files, colour palette. The brand files now exist. Source: a `SITE/` folder from the designer, 101 files, 62 MB.

| Folder | Content |
| --- | --- |
| `COULEURS/` | `COULEURS.pdf`: the brandbook colour page, marked "Confidentiel" |
| `FONT/DM_MONO/` | DM Mono, 6 styles, `.ttf`, SIL Open Font License |
| `FONT/MAGNOLIA/` | Magnolia Cora Script and Smooth Script, `.otf`, licensed from MyFonts |
| `LOGOTYPE/` | "Aphra" wordmark with and without the moon, in black, ink and white (`.ai`, `.svg`, `.pdf`, `.png`, `.jpg`). `ANIM/`: logo animation, `.mp4` 27 MB and `.ai`. `LOGO_TAMPON.psd`: ink-stamp effect template |
| `LOGOMARK/` | 6 moon faces in black and ink (`.ai`, `.svg`, `.pdf`, `.png`). One stamp texture (`.png`) |
| `ICONO/` | 5 illustrations (concombre, mangue, pomme, poivron, tomate), PNG 3508×4961 |
| `WIREFRAMES/` | 3 screens, JPG 1920×1085: closed envelope with age gate, open envelope with card, letter page |

The site will be built from a kit, like Ledger sites are built from Lumen. The kit has four users:

1. `aphra-web`. It is the only user that imports code.
2. Claude Design. It reads the kit to build new on-brand screens.
3. Designers and print. They need files and a page to browse.
4. Future Aphra sites. None exists yet.

## 2. Scope

### 2.1 Sub-projects

The work is split into four sub-projects. Each one has its own spec and its own pull requests.

| # | Sub-project | State |
| --- | --- | --- |
| 1 | Design kit: `packages/design` and its Storybook at `design.aphralab.com` | This spec |
| 2 | Magnolia webfont delivery: font in Cloudflare R2, served only to `aphralab.com`, page-view analytics | Blocked: the MyFonts web files are needed |
| 3 | Bottle counter data: company ERP → Worker API → `BottleCounter` | Blocked: the ERP is not named yet |
| 4 | Website construction: real pages built from the kit | After sub-project 1 |

### 2.2 Kit scope (sub-project 1)

1. An npm workspace package `@aphralab/design` in `packages/design`.
2. Tokens: colours, recipe colours, type, layout, motion.
3. Web-ready assets: logos, logomarks, stamp texture, recipe illustrations.
4. The editable sources, kept in the repository and not exported.
5. React components: every element of the three wireframes (section 7).
6. Storybook, deployed to `design.aphralab.com`, with a preview from `dev`.
7. AI rules for the kit and an updated brand guide.

Out of scope: see section 15.

## 3. Decisions

| Topic | Decision | Reason |
| --- | --- | --- |
| Location | Workspace package inside `aphra-web`, not a new repository | Only one user imports code. A separate repository adds a publish pipeline and a version bump for each token change. |
| Repository shape | `aphra-web` becomes an npm workspaces root | This changes the kickstart decision "workspaces only when the API outgrows one Worker". The kit needs its own public API boundary now, so a later move costs no change in the site. |
| Later move | `git subtree split` → `Aphra-lab/aphra-design` → `npm publish` | Triggered by the second code user. The site then bumps a version and changes no import. |
| Build | None. `exports` point to the TypeScript source | The site's Vite compiles the kit. A library build comes with the npm move. |
| Visibility | Public, like the rest of `aphra-web` | Owner decision. Colours and logos become public with the live site anyway. |
| Magnolia files | Never in any git repository, public or private | The MyFonts licences forbid it (section 8). Making a repository private later does not undo an earlier public push. |
| Tailwind default palette | Removed (`--color-*: initial`) | Only brand colours exist as utilities. Same intent as Lumen's AI rules. |
| Dark mode | None | Paper and black are surfaces for given screens, not themes. |
| Kit URL | `design.aphralab.com`, its own Worker | Separate from the brand site. Same pattern as Lumen's hosted Storybook. |
| Envelope artwork | Vector layers drawn in the kit | The files have no layered envelope. Vector is light and easy to animate. A layered mockup can replace it later without API change. |
| Logo colour | `currentColor`, default `ink` | The "ENCRE" SVG files use `#162419`, which is not in the brandbook. Owner rule: every colour comes from `COULEURS.pdf`. |

## 4. Architecture

### 4.1 Layout

```
aphra-web/
├─ package.json            "workspaces": ["packages/*"]
├─ src/                    the site; imports '@aphralab/design'
└─ packages/design/
   ├─ package.json         "private": true, name, exports, peerDependencies
   ├─ AGENTS.md            AI rules for the kit
   ├─ README.md            usage and the later move to npm
   ├─ src/
   │  ├─ index.ts          public components and hooks
   │  ├─ tokens/           tokens.css, palette.ts, recipes.ts
   │  └─ components/       one folder per component, with its story
   ├─ assets/              web-ready SVG and WebP files
   ├─ sources/             editable sources, not exported
   ├─ scripts/             assets script (trim and resize), version script
   ├─ src/generated/       asset sizes written by the assets script
   ├─ tests/               unit tests
   ├─ .storybook/
   └─ wrangler.jsonc       the aphra-design Worker (static files only)
```

### 4.2 Public API

The `exports` map is the public API. Any path outside it is private.

| Import | Content |
| --- | --- |
| `@aphralab/design` | React components, `useAgeConsent`, `leaveSite`, `HEALTH_WARNING`, `RECIPES` |
| `@aphralab/design/tokens.css` | Tailwind v4 `@theme static` block. Every token is also a CSS variable on `:root` in the compiled CSS |
| `@aphralab/design/assets/*` | SVG and WebP files |

- React is a peer dependency. The site keeps a single React copy.
- The site's stylesheet imports Tailwind with `source(none)`, then `tokens.css`, then adds `@source` lines for the site's `src` and for `packages/design/src`, so Tailwind sees the kit's classes.
- npm workspaces link the package. npm has no `workspace:` protocol. The exact version range is checked at implementation time.

## 5. Tokens

### 5.1 Colours

All colours come from `COULEURS.pdf`. Values are taken from the PDF text. The paper value is sampled from the PDF background.

| Token    | HEX       | CMJN        | RVB         | Role                  |
| -------- | --------- | ----------- | ----------- | --------------------- |
| `paper`  | `#FDFCF2` | not given   | 253 252 242 | Main background       |
| `ink`    | `#374036` | 68 49 63 61 | 55 64 54    | Text, rules, logos    |
| `black`  | `#000000` | 91 79 62 97 | 0 0 0       | Age-gate background   |
| `green`  | `#29896F` | 80 24 63 7  | 41 137 111  | Recipe: gin concombre |
| `yellow` | `#F59E14` | 0 44 94 0   | 246 159 20  | Recipe: rhum mangue   |
| `brown`  | `#A35B1A` | 27 65 98 21 | 164 92 26   | Recipe: café calva    |
| `red`    | `#DD2414` | 4 95 100 1  | 221 37 20   | Recipe: vodka tomate  |

The CMJN value for `paper` is not in the PDF. The designer can supply it for print.

### 5.2 Recipes

`RECIPES` links each recipe to its colour and its illustration.

| Id              | Name          | Colour   | Illustration         |
| --------------- | ------------- | -------- | -------------------- |
| `gin-concombre` | Gin concombre | `green`  | `concombre`          |
| `rhum-mangue`   | Rhum mangue   | `yellow` | `mangue`             |
| `cafe-calva`    | Café calva    | `brown`  | `pomme` (to confirm) |
| `vodka-tomate`  | Vodka tomate  | `red`    | `tomate`             |

The `poivron` illustration is linked to no recipe. It stays in the assets.

### 5.3 Contrast rules

Contrast is measured with the WCAG 2 formula.

| Text colour | On `paper` | On `black` | Rule |
| --- | --- | --- | --- |
| `ink` | 10.5 | 1.9 | Body text on paper. Never on black |
| `black` | 20.4 | — | Body text on paper |
| `red` | 4.7 | 4.3 | Text on paper. Large text only on black |
| `brown` | 5.0 | 4.1 | Text on paper. Large text only on black |
| `green` | 4.2 | 4.9 | Large text only on paper (24 px, or 18.7 px bold). Text on black |
| `yellow` | 2.1 | 9.8 | Never text on paper. Fill and decoration only. Text on black |
| `paper` | — | 20.4 | Text on black |

Threshold: 4.5 for normal text, 3.0 for large text (WCAG 2 AA).

A unit test checks each text pairing used in the components against this table.

### 5.4 Type

| Token | Value | Use |
| --- | --- | --- |
| `font-mono` | DM Mono, then `ui-monospace` | Body text and UI |
| `font-script` | "Magnolia Cora Script", then a cursive fallback | Live script text |
| `text-body` | 17 px, line height 1.05 | Letter text (typewriter look) |
| `text-caption` | 12 px, capitals, wide tracking | Tagline, age-gate text |
| `text-nav` | 16 px | MENU, counter |

- The "Aphra" wordmark is an SVG, not text.
- Sizes are measured on the 1920 px wireframe. No mobile wireframe exists. Below 768 px, body text is 15 px until a mobile design exists.
- `font-script` shows the fallback on every domain except `aphralab.com`, and on `aphralab.com` until sub-project 2 ships.

### 5.5 Layout and motion

- Letter column: 738 px wide, with 1 px `ink` rules on the left and right, full height. Text measure: about 40 characters. Below 768 px the column fills the screen with a 16 px gutter.
- No corner radius. No shadow.
- Motion tokens: durations and easings for `EnvelopeReveal`. With `prefers-reduced-motion`, every animation becomes a fade of 200 ms or less.

### 5.6 Source of truth

- `tokens.css` is written by hand.
- `palette.ts` holds the same colours with CMJN and RVB, for the Storybook colour page.
- A unit test fails when the two files disagree.

## 6. Assets

### 6.1 Web-ready files (`assets/`)

| File | From | Treatment |
| --- | --- | --- |
| `logo-wordmark.svg`, `logo-wordmark-moon.svg` | `LOGOTYPE/BASIC/ENCRE/*` | SVGO cleanup. Fill becomes `currentColor`. The black, ink and white files collapse into one file per shape |
| `logomark-1.svg` … `logomark-6.svg` | `LOGOMARK/BASIC/*/ENCRE` | Same as above |
| `logomark-stamp.webp` | `LOGOMARK/TAMPON/LOGOMARK_TAMPON_1.png` | WebP |
| `illustration-<name>-{480,960,full}.webp` | `ICONO/ILLUS_*.png` | Transparent margin trimmed. WebP at 480 px, 960 px and full width. Full is the trimmed width, 1920 px at most; trimmed fruits are narrower than 1920 px |
| `signature.svg` | Designer (section 13) | Outlined "Aphra" in Magnolia. Allowed by the desktop licence, section 2 |

- `npm run assets -w @aphralab/design` makes the WebP files with `sharp` and writes their sizes to `src/generated/asset-sizes.ts`. The output is committed. The site build does not process images.
- The components draw logos with a CSS mask, the technique Lumen uses. The colour follows `currentColor`.

### 6.2 Fonts

- DM Mono comes from the `@fontsource/dm-mono` package. It is OFL and already in `.woff2`. No webfont file is committed. The DM Mono `.ttf` files in `sources/` are the designer's originals, under the SIL Open Font License.
- Magnolia: only the `font-script` token and the fallback (section 8).

### 6.3 Sources (`sources/`)

- Copied from `SITE/`: `.ai`, `.psd`, `.pdf`, the original PNG and SVG files, the animation, the wireframes.
- Excluded: `FONT/MAGNOLIA/` and the MyFonts licence files.
- Not part of `exports`. Stored in plain git. About 60 MB. Git LFS is not needed at this size.
- The logo animation (`APHRA_LOGO_ANIM.mp4`, 27 MB) stays in `sources/` only. A web version and a place on the site are deferred.

## 7. Components

Every component has a story, and unit tests in `packages/design/tests/`.

### 7.1 Primitives

| Component | Props | Behaviour |
| --- | --- | --- |
| `Logo` | `variant: 'wordmark' \| 'wordmark-moon'` | CSS mask, `currentColor`. `role="img"`, `aria-label="Aphra"`. Aspect ratio from the SVG view box |
| `Logomark` | `face: 1–6 \| 'stamp'` | Same as `Logo`. `stamp` uses the WebP texture |
| `Signature` | `team?: boolean` | `signature.svg`, then "Aphra team." in mono. `aria-label="Aphra"` |
| `Text` | `variant: 'body' \| 'caption' \| 'nav'`, `as` | Applies the type tokens. `as` picks the HTML element |
| `CircledLink` | `asChild`, `shape: 1 \| 2 \| 3` | A hand-drawn ellipse (SVG, `aria-hidden`) around a link. `asChild` (Radix Slot, as in Lumen) wraps React Router's `Link`. On `:focus-visible` the ellipse gets thicker and a focus outline shows |
| `Illustration` | `name`, `alt` (required), `sizes` | `<img>` with `srcset` from the three WebP widths. Lazy loading by default |
| `BottleCounter` | `value?: number` | Shows 6 digits with zero padding (`000450`). Screen readers get "450 bouteilles vendues" (French number format). No value: shows `——————` with `aria-busy`. Values over 999 999 show in full |

### 7.2 Compliance

| Component | Behaviour |
| --- | --- |
| `HealthWarning` | Renders `HEALTH_WARNING`: "L'abus d'alcool est dangereux pour la santé, à consommer avec modération." The text cannot be changed by props. At least 12 px, sentence case. `tone: 'paper' \| 'black'` picks a colour pairing from section 5.3 |
| `AgeGate` | Shows the closed envelope with the declaration and OUI / NON. Details below |
| `EnvelopeReveal` | Plays after OUI: the flap opens and the card with the wordmark rises (wireframe 2). Details below |

`AgeGate`:

- Text, verbatim from wireframe 1: "Je déclare sur l'honneur avoir l'âge légal afin de consulter le site aphralab.com selon les lois en vigueur dans mon pays."
- Accessible dialog: `role="dialog"`, `aria-modal="true"`, focus on OUI. The site content is not rendered before consent, so the keyboard cannot reach it.
- It includes `HealthWarning` (`tone="black"`), because the brand guide requires the warning on every page.
- OUI calls `useAgeConsent().accept()`. It stores the date under `aphra.age-consent` in `localStorage`, inside `try/catch`. When storage is blocked (private mode), the gate shows again at the next visit. The consent does not expire in v1.
- NON calls `leaveSite(exitUrl)`. When the visitor came from another origin and history has an earlier entry, it runs `history.back()`. Otherwise it runs `location.replace(exitUrl)`. Default `exitUrl`: `about:blank`. `window.close()` is not used: browsers only allow it for windows opened by a script.

`EnvelopeReveal`:

- Uses the same internal `Envelope` artwork as `AgeGate`. `Envelope` is not exported.
- The artwork is vector layers: body, closed flap, open flap, card, string, eyelets. The paper grain is an SVG noise filter, so no texture file is needed.
- `onDone` fires at the end. A click, Enter or Escape skips to the end. `onDone` also fires after 2.5 s when no animation end arrives, for example in a background tab.
- The health warning stays visible during the reveal.
- With `prefers-reduced-motion`, it becomes a fade.

### 7.3 Layout

| Component | Behaviour |
| --- | --- |
| `Header` | Left: a MENU button with `aria-expanded` and `onMenuToggle`. Centre: `Logo variant="wordmark"` and the tagline "BOISSON DU XVIIe / REPENSÉE POUR LE XXIe" (`Text variant="caption"`). Right: `BottleCounter`. No menu panel in v1: none is designed |
| `LetterPage` | Paper background. The ruled column (section 5.5). Slots: `header`, `children` (the letter), `signOff` ("Sobrement," then `Signature`), `address`. It always renders `HealthWarning` at the bottom. No prop removes it |

## 8. Magnolia licence rules

The licences read are the Monotype "Font Software for Desktop" EULA (v250903) and "Font Software for Web Content" EULA (v260616), from the MyFonts order.

| Clause | Text (short) | Rule for this project |
| --- | --- | --- |
| Desktop and Web §4 | no "give, lend, or further distribute the Font Software" | No Magnolia file in any git repository |
| Desktop §4 | no install "on any server or in any digital asset management system" | The desktop file never leaves licensed workstations. It is not uploaded to Claude Design |
| Desktop §9 | "Licensed Desktop Users must be your employees" | Outside designers and print shops do not receive the file |
| Desktop and Web §4, §9 | no Derivative Works. A conversion to another binary format is one | No self-made `.woff2`. Only the web files supplied by MyFonts are served |
| Desktop §2 | static images are allowed if they are not glyphs addressed by software | `signature.svg` is allowed |
| Web §2 | install on a Server "solely to generate content on a Website", up to the licensed Page Views | Sub-project 2: the file sits in R2, read only by the `aphralab.com` Worker |
| Web §9 Website | "one web site domain name" | `design.aphralab.com` and `*.workers.dev` show the fallback. A written MyFonts answer can extend this to the subdomain |
| Web §9 Website | must "reasonably restrict access" from other origins | Sub-project 2: the font route checks the origin |
| Web §9 Page View | "recorded by a commonly accepted or recognized performance tracking system" | Sub-project 2: page-view analytics on `aphralab.com` |
| Web §3 | no use "for authoring purposes" | Claude Design gets the fallback, never the file |
| Web §7 | the licence may have a Term | If the Term ends, the site stops serving the font |

A unit test, run in CI, fails when git tracks any file whose name matches `magnolia` with a font extension. `.gitignore` excludes the same pattern.

## 9. Storybook and documentation

- Storybook 10 with the React and Vite builder. The versions are checked in the Context7 docs at implementation time.
- One story per component and per state. Examples: `AgeGate` before OUI, after OUI, storage blocked, reduced motion.
- Documentation pages:
  - Introduction: install and import.
  - Colours: HEX, CMJN and RVB from `palette.ts`, recipe colours, contrast rules.
  - Typography: the scale, and why Magnolia shows a fallback on this domain.
  - Logos and assets: preview and download of every file in `assets/`. The sources are linked on GitHub, not bundled.
  - Rules: health warning, age gate, Magnolia licence.
- The accessibility add-on runs on every story.

## 10. Claude Design and AI rules

- `packages/design/AGENTS.md` fills the role of Lumen's `ai-rules/RULES.md`. It covers:
  - imports from `@aphralab/design` only
  - tokens only, since no Tailwind default colour exists
  - the contrast table
  - `HealthWarning` on every page
  - no Magnolia file anywhere.
- `docs/guides/brand.md`:
  - Remove the "missing source files" line.
  - Add the palette, recipes, fonts, logo rules and the licence summary.
- After the kit merges, the owner runs `/design-sync` to push the kit into the Claude Design design system.

## 11. CI/CD

Changes to `.github/workflows/ci.yml`:

- `checks`: format, lint, type check, tests and build cover both workspaces. It also runs the Storybook build and the Magnolia guard (section 8).
- New job `deploy-design-staging`: on push to `dev`. It builds Storybook and deploys the `aphra-design` Worker (environment `staging`, `workers.dev`).
- New job `deploy-design-production`: on push to `main`. It deploys to the custom domain `design.aphralab.com`.
- Both jobs use the existing `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. They run `wrangler deploy --config packages/design/wrangler.jsonc` from the repository root, so the pinned root Wrangler is used. With `workingDirectory`, `wrangler-action` would not find the hoisted binary.
- The daily smoke run (`smoke.yml`) runs every smoke spec against `aphralab.com`. The design smoke tests use `DESIGN_BASE_URL` and skip without it. The daily run sets it to `https://design.aphralab.com`.
- The Storybook build writes `version.json` with the commit SHA. A smoke test after each deploy checks that the page loads and that `version.json` matches the commit.
- The package stays `"private": true`. It cannot be published by mistake.

## 12. Tests

Test-driven, per `CLAUDE.md`: each behaviour starts with a failing test.

| Area | Tests |
| --- | --- |
| Tokens | `palette.ts` and `tokens.css` agree. Every text pairing used in the components meets section 5.3. No Tailwind default colour exists |
| Components | Roles, names and keyboard use for each component |
| `AgeGate` | No site content before consent. OUI stores consent. Blocked storage does not throw. NON goes back in history or replaces the location. The health warning is present |
| `EnvelopeReveal` | `onDone` fires once. Skip by click, Enter and Escape. Fallback after 2.5 s. Reduced motion takes the fade path |
| `HealthWarning` | Exact text. `LetterPage` and `AgeGate` always render it |
| `BottleCounter` | Padding, placeholder, large values, the French accessible label |
| Exports | Only the paths in section 4.2 resolve from the site |
| Site integration | A site test renders a kit component. An E2E test checks that a kit class gets its style in the built site (it guards the `@source` setup) |
| Deploy | Smoke tests on the Storybook URLs (section 11) |

## 13. Owner and designer inputs

| # | Input | Needed for | From |
| --- | --- | --- | --- |
| 1 | `signature.svg`: "Aphra" in Magnolia, outlined | `Signature` | Designer (Illustrator: create outlines) |
| 2 | Confirm café calva uses the `pomme` illustration | `RECIPES` | Owner |
| 3 | CMJN value for `paper` | Colour page | Designer |
| 4 | Mobile wireframes | Mobile type and layout | Designer |
| 5 | Layered envelope file (the mockup behind wireframes 1 and 2) and its licence | Optional upgrade of the vector envelope | Designer |
| 6 | Logo animation for the web (under 1 MB, plus a poster) and where it plays | Deferred | Designer |
| 7 | MyFonts web files (`.woff2`) and the licensed page-view count | Sub-project 2 | Owner, MyFonts account |
| 8 | Written MyFonts answer: is `design.aphralab.com` covered? | Magnolia on the kit URL | Owner, MyFonts support |
| 9 | ERP name and its API | Sub-project 3 | Owner |
| 10 | Legal check of a public "bottles sold" counter against article L3323-4 | Sub-project 3 | Owner, legal adviser |
| 11 | Run `/design-sync` | Claude Design | Owner |

## 14. Risks

| Risk | Mitigation |
| --- | --- |
| A Magnolia file gets committed | CI guard and `.gitignore` (section 8) |
| The `@source` setup misses kit classes, so styles are missing in production | E2E test in section 12 |
| Two React copies through the workspace | React as a peer dependency. A test checks for a single copy |
| Storybook 10 and Vite 8 do not work together | Check the Context7 docs and the release notes before the Storybook task |
| `EnvelopeReveal` takes longer than planned | It is the last component in the plan. The static `AgeGate` works without it |
| The sources make clones slower | 60 MB is acceptable. Move to Git LFS if the sources change often |
| The bottle counter breaks advertising law | Input 10 before sub-project 3 goes live |

## 15. Deferred

- Sub-projects 2, 3 and 4 (section 2.1).
- Menu panel: no design yet.
- Web version of the logo animation.
- Mobile layouts beyond the defaults in section 5.
- Visual regression tests.
- Consent expiry.
- A plain CSS build of the tokens for sites without Tailwind.
- The move to its own repository and to npm (trigger: a second code user).

## 16. Success criteria

1. The site imports `@aphralab/design` and `@aphralab/design/tokens.css`. `npm run check` passes at the root.
2. Every component in section 7 has a story and passing tests.
3. `design.aphralab.com` serves the Storybook from `main`. The `workers.dev` preview serves it from `dev`. Both smoke tests pass.
4. Only brand colours exist as Tailwind utilities.
5. No Magnolia file is in git history. The CI guard passes.
6. `packages/design/AGENTS.md` exists. `docs/guides/brand.md` has the palette, recipes, fonts and licence rules.
