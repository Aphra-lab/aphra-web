# Aphra design kit implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `@aphralab/design`, an npm workspace package inside `aphra-web`. It holds the Aphra tokens, web-ready assets and the React components of the three wireframes. Its Storybook is deployed to `design.aphralab.com`.

**Architecture:** `aphra-web` becomes an npm workspaces root. `packages/design` exports TypeScript source through its `exports` map. The site's Vite compiles it, so the kit has no build step. Tokens are a Tailwind v4 `@theme static` block. Components use only brand tokens. Storybook builds to static files, served by a second assets-only Cloudflare Worker.

**Tech Stack:** Node 24, npm workspaces, React 19.3, TypeScript 5.9, Vite 8.3, Tailwind CSS 4.3, Vitest 5 with happy-dom and Testing Library, Playwright, Storybook 10.6, sharp 0.35, SVGO 4.1, `@fontsource/dm-mono` 5.3, `@radix-ui/react-slot` 1.3, Wrangler 4.

**Spec:** `docs/superpowers/specs/2026-09-30-design-kit-design.md`

## Global Constraints

- Package name `@aphralab/design`, path `packages/design`, `"private": true`, `"type": "module"`.
- Public API = `exports` keys `.`, `./tokens.css`, `./assets/*`. Nothing else.
- React and React DOM are peer dependencies of the kit, never dependencies.
- Colours, verbatim from `COULEURS.pdf`: `paper` `#fdfcf2`, `ink` `#374036`, `black` `#000000`, `green` `#29896f`, `yellow` `#f59e14`, `brown` `#a35b1a`, `red` `#dd2414`. No other colour utility exists (`--color-*: initial`).
- Recipes: `gin-concombre` green, `rhum-mangue` yellow, `cafe-calva` brown, `vodka-tomate` red.
- Health warning, verbatim: `L'abus d'alcool est dangereux pour la santé, à consommer avec modération.`
- Age declaration, verbatim: `Je déclare sur l'honneur avoir l'âge légal afin de consulter le site aphralab.com selon les lois en vigueur dans mon pays.`
- Public copy is in French (`MENU`, `OUI`, `NON`, screen-reader text).
- No Magnolia font file in git, ever. No self-converted font file. `font-script` is a name and a fallback only.
- Kit source must type-check under the site's `tsconfig.app.json` (`lib: ES2020`). Do not use ES2021+ APIs in `packages/design/src` (no `replaceAll`, no `Array.prototype.at`).
- Test files: `packages/design/tests/unit/<Name>.unit.test.ts(x)`. The root `vitest` runs them. Component tests import from `@aphralab/design`, which proves the public API.
- Commits: Conventional Commits, scope `design` for the kit and `site` for the site. **No `Co-Authored-By` and no AI attribution line.**
- Branches from `dev`, one PR per group (see "Pull requests"). Agents open PRs and stop. A human approves and merges. Never run `gh pr merge`.
- Context7 was checked on 2026-09-30 for every library API in this plan. If a call fails, check Context7 again before changing it (`CLAUDE.md` mandate).
- Code comments: one line at most, and only where the code cannot say it.

## Review Focus

1. **Background tab or disabled animations:** `animationend` never fires, so the visitor stays on the envelope. Expected: the site appears after 2.5 s anyway. Test: Task 16, "ends by itself when no animation end arrives".
2. **Storage blocked** (Safari private mode, blocked site data): `localStorage` throws on read or write. Expected: the gate shows, OUI works for this visit, nothing crashes. Tests: Task 12 (`useAgeConsent`) and Task 15, "still works when storage is blocked".
3. **Bad ERP value for the counter:** negative, `NaN`, `Infinity`, decimals, or more than 6 digits. Expected: a placeholder for unusable values, whole numbers only, never cut digits. Tests: Task 10.
4. **NON with no usable history:** a direct visit (no referrer), a same-site referrer, or a malformed referrer. Expected: the location is replaced with `exitUrl`, and `history.back()` never keeps the visitor on the site. Tests: Task 12 (`leaveSite`).
5. **The daily smoke run:** `smoke.yml` runs every smoke spec against `aphralab.com` with no tag filter. Expected: the design smoke tests run against the kit URL only, and skip when `DESIGN_BASE_URL` is unset. Tests: Task 5.

---

## File structure

```
aphra-web/
├─ package.json                         MODIFY  workspaces + @aphralab/design dependency
├─ tsconfig.json                        MODIFY  reference packages/design
├─ eslint.config.js                     MODIFY  lint the package files
├─ vitest.config.ts                     MODIFY  coverage of the package source
├─ .gitignore / .prettierignore         MODIFY  Magnolia patterns, Storybook output, sources
├─ .secretlintrc.json                   MODIFY  skip the binary sources
├─ index.html                           MODIFY  theme colour = paper
├─ src/index.css                        MODIFY  import the tokens, @source the kit
├─ src/main.tsx                         MODIFY  error fallback uses the red token
├─ src/pages/Home.tsx                   MODIFY  bg-paper + <HealthWarning />
├─ tests/unit/workflows.unit.test.ts    MODIFY  CI and smoke workflow checks
├─ tests/unit/design-imports.unit.test.ts CREATE the site imports the public API only
├─ tests/e2e/home.spec.ts               MODIFY  kit styles reach the built site
├─ tests/smoke/design.spec.ts           CREATE  Storybook smoke tests
├─ .github/workflows/ci.yml             MODIFY  Storybook build + two deploy jobs
├─ .github/workflows/smoke.yml          MODIFY  DESIGN_BASE_URL
├─ docs/guides/brand.md                 MODIFY  palette, recipes, fonts, licence
└─ packages/design/
   ├─ package.json, tsconfig.json, README.md, AGENTS.md, wrangler.jsonc
   ├─ .storybook/main.ts, preview.ts, storybook.css
   ├─ scripts/build-assets.mjs          sources → assets + generated sizes
   ├─ scripts/write-version.mjs         storybook-static/version.json
   ├─ sources/                          copy of ~/Downloads/SITE without FONT/MAGNOLIA
   ├─ assets/                           generated SVG and WebP, plus signature.svg placeholder
   ├─ src/index.ts                      public exports
   ├─ src/utils/cn.ts                   class name join
   ├─ src/tokens/                       tokens.css, palette.ts, contrast.ts, recipes.ts
   ├─ src/generated/asset-sizes.ts      written by build-assets.mjs
   ├─ src/consent/                      useAgeConsent.ts, leaveSite.ts
   ├─ src/docs/                         MDX pages + ColourTable.tsx, AssetGrid.tsx
   ├─ src/components/<Name>/            <Name>.tsx + <Name>.stories.tsx
   │    Text, MaskImage (internal), Logo, Logomark, Signature, Illustration,
   │    CircledLink, BottleCounter, HealthWarning, Header, LetterPage,
   │    Envelope (internal), AgeGate, EnvelopeReveal
   └─ tests/unit/                       one test file per unit
```

## Pull requests

| PR | Branch | Tasks | After merge |
| --- | --- | --- | --- |
| 0 | `feat/design-kit-spec` | spec + this plan | — |
| 1 | `feat/design-kit-foundation` | 1–3 | — |
| 2 | `feat/design-kit-storybook` | 4–5 | Preview live on `aphra-design-staging.aphralab.workers.dev` |
| 3 | `feat/design-kit-primitives` | 6–11 | Preview updated |
| 4 | `feat/design-kit-layout` | 12–16 | Preview updated |
| 5 | `feat/site-uses-design-kit` | 17–18 | Site uses the kit. `design.aphralab.com` goes live at the next `dev → main` release |

Each PR starts from an up-to-date `dev`. Before opening a PR, run `npm run check`, `npm run build`, `npm run build-storybook --workspace @aphralab/design` and `npm run test:e2e`. The PR title is a Conventional Commit, because squash merge uses it as the commit message.

---

### Task 1: Workspace package scaffold

**Files:**

- Create: `packages/design/package.json`, `packages/design/tsconfig.json`, `packages/design/src/index.ts`
- Create: `packages/design/tests/unit/package.unit.test.ts`, `packages/design/tests/unit/magnolia-guard.unit.test.ts`
- Modify: `package.json`, `tsconfig.json`, `eslint.config.js`, `vitest.config.ts`, `.gitignore`, `.prettierignore`, `.secretlintrc.json`

**Interfaces:**

- Consumes: nothing.
- Produces: the workspace link `node_modules/@aphralab/design → packages/design`; the `exports` map; lint, type-check and test coverage for `packages/*`.

- [ ] **Step 1: Write the failing tests**

`packages/design/tests/unit/package.unit.test.ts`:

```ts
// @vitest-environment node
import { readFileSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';

interface PackageJson {
  name: string;
  private: boolean;
  type: string;
  exports: Record<string, string>;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

const pkg = JSON.parse(
  readFileSync('packages/design/package.json', 'utf8'),
) as PackageJson;

describe('@aphralab/design package', () => {
  it('stays private until the move to npm', () => {
    expect(pkg.name).toBe('@aphralab/design');
    expect(pkg.private).toBe(true);
    expect(pkg.type).toBe('module');
  });

  it('exposes only the public API paths', () => {
    expect(Object.keys(pkg.exports).sort()).toEqual([
      '.',
      './assets/*',
      './tokens.css',
    ]);
  });

  it('takes React from the site, so only one copy exists', () => {
    expect(pkg.dependencies?.react).toBeUndefined();
    expect(pkg.peerDependencies?.react).toBeDefined();
    const fromKit = createRequire(
      `${process.cwd()}/packages/design/package.json`,
    ).resolve('react');
    const fromSite = createRequire(`${process.cwd()}/package.json`).resolve(
      'react',
    );
    expect(fromKit).toBe(fromSite);
  });

  it('is linked into the site as a workspace', () => {
    expect(realpathSync('node_modules/@aphralab/design')).toBe(
      realpathSync('packages/design'),
    );
  });
});
```

`packages/design/tests/unit/magnolia-guard.unit.test.ts`:

```ts
// @vitest-environment node
import { execFileSync } from 'node:child_process';

const MAGNOLIA_FONT = /magnolia[^/]*\.(otf|ttf|woff2?|eot)$/i;

describe('Magnolia licence guard', () => {
  it('git tracks no Magnolia font file', () => {
    const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
      .split('\n')
      .filter((file) => MAGNOLIA_FONT.test(file));

    expect(tracked).toEqual([]);
  });

  it('.gitignore blocks Magnolia font files in any folder', () => {
    const ignored = execFileSync(
      'git',
      [
        'check-ignore',
        '--no-index',
        'packages/design/sources/FONT/MAGNOLIA/MagnoliaCoraScript-Regular.otf',
        'public/fonts/magnolia-cora-script.woff2',
      ],
      { encoding: 'utf8' },
    );

    expect(ignored.trim().split('\n')).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run packages/design/tests/unit` Expected: FAIL. `ENOENT ... packages/design/package.json`, and `git check-ignore` exits with status 1.

- [ ] **Step 3: Create the package**

`packages/design/package.json`:

```json
{
  "name": "@aphralab/design",
  "version": "0.0.0",
  "private": true,
  "description": "Aphra design kit: tokens, assets and React components",
  "license": "UNLICENSED",
  "type": "module",
  "sideEffects": ["**/*.css"],
  "exports": {
    ".": "./src/index.ts",
    "./tokens.css": "./src/tokens/tokens.css",
    "./assets/*": "./assets/*"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

`packages/design/src/index.ts`:

```ts
export {};
```

`packages/design/tsconfig.json`:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "../../node_modules/.tmp/tsconfig.design.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "types": ["vite/client", "vitest/globals", "node"],
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "tests", ".storybook"]
}
```

- [ ] **Step 4: Wire the workspace into the root**

In `package.json`, add after `"type": "module",`:

```json
  "workspaces": ["packages/*"],
```

and add to `"dependencies"`:

```json
    "@aphralab/design": "*",
```

In `tsconfig.json`, add to `references`:

```json
{ "path": "./packages/design" }
```

In `eslint.config.js`:

- In the global ignores, add `'packages/*/storybook-static/**'` and `'packages/*/sources/**'`.
- In the "TypeScript parser options for source files" block, the "React plugins" block, and the "General rules for TypeScript files" block, add these globs to `files`: `'packages/*/src/**/*.{ts,tsx}'`, `'packages/*/tests/**/*.{ts,tsx}'`, `'packages/*/.storybook/**/*.ts'`.
- In the "Test files" block, add `'packages/*/tests/**/*.{ts,tsx}'`.
- In the "Config files" block, change `files` to `['*.config.{js,mjs,cjs,ts}', 'vite.config.ts', 'vitest.config.ts', 'packages/*/scripts/**/*.mjs']` and add `languageOptions: { globals: { ...globals.node } }` next to the spread.
- Before the Prettier block, add a block for stories. Stories export `meta` and story objects, which `react-refresh` would flag:

```js
  {
    files: ['packages/*/src/**/*.stories.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
```

In `vitest.config.ts`, change `coverage.include` and add `coverage.exclude`:

```ts
      include: ['src/**/*', 'worker/**/*', 'packages/design/src/**/*'],
      exclude: [
        '**/*.stories.tsx',
        'packages/design/src/docs/**',
        'packages/design/src/generated/**',
      ],
```

Append to `.gitignore`:

```
# Magnolia Cora font files: forbidden in git by the MyFonts licences (design kit spec, section 8)
*[Mm][Aa][Gg][Nn][Oo][Ll][Ii][Aa]*.otf
*[Mm][Aa][Gg][Nn][Oo][Ll][Ii][Aa]*.ttf
*[Mm][Aa][Gg][Nn][Oo][Ll][Ii][Aa]*.woff
*[Mm][Aa][Gg][Nn][Oo][Ll][Ii][Aa]*.woff2
packages/design/storybook-static
```

Append to `.prettierignore`:

```
packages/design/sources
packages/design/storybook-static
```

In `.secretlintrc.json`, change `ignorePatterns` to `["**/.env", "packages/design/sources/**"]`.

- [ ] **Step 5: Link the workspace**

Run: `npm install` Expected: `node_modules/@aphralab/design` is a symlink to `../../packages/design` (`ls -l node_modules/@aphralab`).

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run packages/design/tests/unit` Expected: PASS, 6 tests.

- [ ] **Step 7: Run the full gate**

Run: `npm run check` Expected: format, lint, typecheck, secretlint and all tests pass.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json tsconfig.json eslint.config.js vitest.config.ts .gitignore .prettierignore .secretlintrc.json packages/design
git commit -m "feat(design): scaffold the design kit workspace package"
```

---

### Task 2: Tokens

**Files:**

- Create: `packages/design/src/tokens/tokens.css`, `palette.ts`, `contrast.ts`, `recipes.ts`
- Modify: `packages/design/src/index.ts`, `packages/design/package.json`
- Test: `packages/design/tests/unit/tokens.unit.test.ts`

**Interfaces:**

- Consumes: Task 1 package.
- Produces:
  - `type ColorToken = 'paper' | 'ink' | 'black' | 'green' | 'yellow' | 'brown' | 'red'`
  - `PALETTE: readonly PaletteColor[]` with `{ token, hex, cmjn: string | null, rvb }`
  - `contrastRatio(a: string, b: string): number`
  - `type IllustrationName = 'concombre' | 'mangue' | 'pomme' | 'poivron' | 'tomate'`
  - `RECIPES` (readonly tuple of `{ id, name, color: ColorToken, illustration: IllustrationName }`), exported from `@aphralab/design`
  - Tailwind utilities: `bg-/text-/border-/fill-/stroke-{paper,ink,black,green,yellow,brown,red}`, `font-mono`, `font-script`, `text-body`, `text-caption`, `text-nav`, `text-legal`, `max-w-letter`, `max-w-measure`, `animate-flap-open`, `animate-card-rise`, `animate-fade-in`

- [ ] **Step 1: Write the failing test**

`packages/design/tests/unit/tokens.unit.test.ts`:

```ts
// @vitest-environment node
import { readFileSync } from 'node:fs';

import { contrastRatio } from '../../src/tokens/contrast';
import { PALETTE, type ColorToken } from '../../src/tokens/palette';
import { RECIPES } from '../../src/tokens/recipes';

const css = readFileSync('packages/design/src/tokens/tokens.css', 'utf8');

function hex(token: ColorToken) {
  const colour = PALETTE.find((entry) => entry.token === token);
  if (!colour) throw new Error(`No palette colour ${token}`);
  return colour.hex;
}

describe('colour tokens', () => {
  it('tokens.css defines exactly the brandbook colours', () => {
    const cssColours = Object.fromEntries(
      [...css.matchAll(/--color-([a-z]+):\s*(#[0-9a-f]{6});/gi)].map(
        ([, name, value]) => [name, value?.toLowerCase()],
      ),
    );

    expect(cssColours).toEqual(
      Object.fromEntries(PALETTE.map((colour) => [colour.token, colour.hex])),
    );
  });

  it('removes the Tailwind default palette', () => {
    expect(css).toMatch(/--color-\*:\s*initial;/);
  });

  it('emits every token as a CSS variable', () => {
    expect(css).toMatch(/@theme static\s*{/);
  });

  it('references no font file, so no Magnolia file can ship', () => {
    expect(css).toContain('--font-script:');
    expect(css).toContain("'Magnolia Cora Script'");
    expect(css).not.toMatch(/url\(/);
  });
});

describe('contrast rules (spec section 5.3)', () => {
  it.each<[ColorToken, ColorToken, number]>([
    ['ink', 'paper', 10.46],
    ['black', 'paper', 20.38],
    ['red', 'paper', 4.7],
    ['brown', 'paper', 5.01],
    ['green', 'paper', 4.16],
    ['yellow', 'paper', 2.08],
    ['paper', 'black', 20.38],
    ['yellow', 'black', 9.78],
  ])('%s on %s is about %f', (text, background, ratio) => {
    expect(contrastRatio(hex(text), hex(background))).toBeCloseTo(ratio, 1);
  });

  it.each<[ColorToken, ColorToken]>([
    ['ink', 'paper'],
    ['paper', 'black'],
  ])(
    '%s on %s, used for body text by the components, passes AA',
    (text, background) => {
      expect(contrastRatio(hex(text), hex(background))).toBeGreaterThanOrEqual(
        4.5,
      );
    },
  );

  it('yellow on paper fails even the large-text threshold', () => {
    expect(contrastRatio(hex('yellow'), hex('paper'))).toBeLessThan(3);
  });
});

describe('recipes', () => {
  it('links each recipe to its brandbook colour and illustration', () => {
    expect(
      RECIPES.map(({ id, color, illustration }) => [id, color, illustration]),
    ).toEqual([
      ['gin-concombre', 'green', 'concombre'],
      ['rhum-mangue', 'yellow', 'mangue'],
      ['cafe-calva', 'brown', 'pomme'],
      ['vodka-tomate', 'red', 'tomate'],
    ]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run packages/design/tests/unit/tokens.unit.test.ts` Expected: FAIL. `Failed to resolve import "../../src/tokens/contrast"`.

- [ ] **Step 3: Add DM Mono**

Run: `npm install @fontsource/dm-mono@^5.3.0 --workspace @aphralab/design` Expected: `packages/design/package.json` gets `"dependencies": { "@fontsource/dm-mono": "^5.3.0" }`.

- [ ] **Step 4: Write the tokens**

`packages/design/src/tokens/palette.ts`:

```ts
export type ColorToken =
  'paper' | 'ink' | 'black' | 'green' | 'yellow' | 'brown' | 'red';

export interface PaletteColor {
  token: ColorToken;
  hex: string;
  cmjn: string | null;
  rvb: string;
}

export const PALETTE: readonly PaletteColor[] = [
  { token: 'paper', hex: '#fdfcf2', cmjn: null, rvb: '253 252 242' },
  { token: 'ink', hex: '#374036', cmjn: '68 49 63 61', rvb: '55 64 54' },
  { token: 'black', hex: '#000000', cmjn: '91 79 62 97', rvb: '0 0 0' },
  { token: 'green', hex: '#29896f', cmjn: '80 24 63 7', rvb: '41 137 111' },
  { token: 'yellow', hex: '#f59e14', cmjn: '0 44 94 0', rvb: '246 159 20' },
  { token: 'brown', hex: '#a35b1a', cmjn: '27 65 98 21', rvb: '164 92 26' },
  { token: 'red', hex: '#dd2414', cmjn: '4 95 100 1', rvb: '221 37 20' },
];
```

The RVB values are copied from the PDF as printed. Two of them differ from their HEX by 1 unit. HEX is the screen value.

`packages/design/src/tokens/contrast.ts`:

```ts
function channel(value: number) {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((start) =>
    channel(parseInt(hex.slice(start, start + 2), 16)),
  );
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

export function contrastRatio(a: string, b: string) {
  const [light = 0, dark = 0] = [luminance(a), luminance(b)].sort(
    (x, y) => y - x,
  );
  return (light + 0.05) / (dark + 0.05);
}
```

`packages/design/src/tokens/recipes.ts`:

```ts
import type { ColorToken } from './palette';

export type IllustrationName =
  'concombre' | 'mangue' | 'pomme' | 'poivron' | 'tomate';

export interface Recipe {
  id: string;
  name: string;
  color: ColorToken;
  illustration: IllustrationName;
}

export const RECIPES = [
  {
    id: 'gin-concombre',
    name: 'Gin concombre',
    color: 'green',
    illustration: 'concombre',
  },
  {
    id: 'rhum-mangue',
    name: 'Rhum mangue',
    color: 'yellow',
    illustration: 'mangue',
  },
  {
    id: 'cafe-calva',
    name: 'Café calva',
    color: 'brown',
    illustration: 'pomme',
  },
  {
    id: 'vodka-tomate',
    name: 'Vodka tomate',
    color: 'red',
    illustration: 'tomate',
  },
] as const satisfies readonly Recipe[];
```

`packages/design/src/tokens/tokens.css`:

```css
@import '@fontsource/dm-mono/400.css';
@import '@fontsource/dm-mono/400-italic.css';
@import '@fontsource/dm-mono/500.css';

@theme static {
  --color-*: initial;
  --color-paper: #fdfcf2;
  --color-ink: #374036;
  --color-black: #000000;
  --color-green: #29896f;
  --color-yellow: #f59e14;
  --color-brown: #a35b1a;
  --color-red: #dd2414;

  --font-mono:
    'DM Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --font-script:
    'Magnolia Cora Script', 'Snell Roundhand', 'Segoe Script', cursive;

  --text-body: 1.0625rem;
  --text-body--line-height: 1.05;
  --text-caption: 0.75rem;
  --text-caption--line-height: 1.1;
  --text-caption--letter-spacing: 0.04em;
  --text-nav: 1rem;
  --text-nav--line-height: 1.2;
  --text-legal: 0.75rem;
  --text-legal--line-height: 1.4;

  --container-letter: 46.125rem;
  --container-measure: 40ch;

  --ease-paper: cubic-bezier(0.65, 0, 0.35, 1);
  --animate-flap-open: flap-open 700ms var(--ease-paper) both;
  --animate-card-rise: card-rise 700ms var(--ease-paper) 600ms both;
  --animate-fade-in: fade-in 200ms ease-out both;

  @keyframes flap-open {
    to {
      transform: rotateX(180deg);
    }
  }
  @keyframes card-rise {
    to {
      transform: translateY(-75%);
    }
  }
  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }
}

@media (width < 48rem) {
  :root {
    --text-body: 0.9375rem;
  }
}
```

Replace `packages/design/src/index.ts`:

```ts
export { RECIPES } from './tokens/recipes';
export type { IllustrationName, Recipe } from './tokens/recipes';
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run packages/design/tests/unit/tokens.unit.test.ts` Expected: PASS, 16 tests.

- [ ] **Step 6: Run the full gate and commit**

Run: `npm run check` Expected: PASS.

```bash
git add package-lock.json packages/design
git commit -m "feat(design): add brand colour, type and motion tokens"
```

---

### Task 3: Sources and web-ready assets

**Files:**

- Create: `packages/design/sources/**` (copied), `packages/design/scripts/build-assets.mjs`
- Create (generated, committed): `packages/design/assets/*.svg`, `packages/design/assets/*.webp`, `packages/design/src/generated/asset-sizes.ts`
- Create: `packages/design/assets/signature.svg` (placeholder until owner input 1)
- Modify: `packages/design/package.json`
- Test: `packages/design/tests/unit/assets.unit.test.ts`

**Interfaces:**

- Consumes: `RECIPES`, `IllustrationName` (Task 2).
- Produces:
  - files `logo-wordmark.svg`, `logo-wordmark-moon.svg`, `logomark-1.svg` … `logomark-6.svg`, `logomark-stamp.webp`, `signature.svg`, and `illustration-<name>-{480,960,full}.webp`
  - `ILLUSTRATION_SIZES: Record<IllustrationName, { width: number; height: number }>` (size of the `full` file)
  - `STAMP_SIZE: { width: number; height: number }`
  - script `npm run assets --workspace @aphralab/design`

- [ ] **Step 1: Copy the sources without the Magnolia files**

Run:

```bash
rsync -a --exclude 'FONT/MAGNOLIA' --exclude '.DS_Store' ~/Downloads/SITE/ packages/design/sources/
find packages/design/sources -iname '*magnolia*'
du -sh packages/design/sources
```

Expected: `find` prints nothing. Size is about 62 MB.

- [ ] **Step 2: Write the failing test**

`packages/design/tests/unit/assets.unit.test.ts`:

```ts
// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs';

import { RECIPES } from '@aphralab/design';

import {
  ILLUSTRATION_SIZES,
  STAMP_SIZE,
} from '../../src/generated/asset-sizes';

const ASSETS = 'packages/design/assets';
const LOGOS = [
  'logo-wordmark',
  'logo-wordmark-moon',
  'logomark-1',
  'logomark-2',
  'logomark-3',
  'logomark-4',
  'logomark-5',
  'logomark-6',
];
const ILLUSTRATIONS = ['concombre', 'mangue', 'pomme', 'poivron', 'tomate'];

describe('logo assets', () => {
  it.each(LOGOS)('%s.svg draws with currentColor only', (name) => {
    const svg = readFileSync(`${ASSETS}/${name}.svg`, 'utf8');

    expect(svg).toContain('currentColor');
    expect(svg).not.toMatch(/#[0-9a-f]{3}(?:[0-9a-f]{3})?\b/i);
    expect(svg).toMatch(/viewBox="[\d. ]+"/);
  });

  it('has the stamp texture as WebP with its size', () => {
    expect(existsSync(`${ASSETS}/logomark-stamp.webp`)).toBe(true);
    expect(STAMP_SIZE.width).toBeGreaterThan(0);
    expect(STAMP_SIZE.height).toBeGreaterThan(0);
  });

  it('has a signature drawing', () => {
    expect(readFileSync(`${ASSETS}/signature.svg`, 'utf8')).toMatch(
      /viewBox="[\d. ]+"/,
    );
  });
});

describe('illustration assets', () => {
  it.each(ILLUSTRATIONS)('%s has three trimmed WebP files', (name) => {
    for (const variant of ['480', '960', 'full']) {
      expect(existsSync(`${ASSETS}/illustration-${name}-${variant}.webp`)).toBe(
        true,
      );
    }
    const size = ILLUSTRATION_SIZES[name as keyof typeof ILLUSTRATION_SIZES];
    expect(size.width).toBeGreaterThan(960);
    expect(size.width).toBeLessThanOrEqual(1920);
  });

  it('covers every recipe', () => {
    for (const recipe of RECIPES) {
      expect(Object.keys(ILLUSTRATION_SIZES)).toContain(recipe.illustration);
    }
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run packages/design/tests/unit/assets.unit.test.ts` Expected: FAIL. `Failed to resolve import "../../src/generated/asset-sizes"`.

- [ ] **Step 4: Add the image tools and the script**

Run: `npm install --save-dev sharp@^0.35.5 svgo@^4.1.0 --workspace @aphralab/design`

In `packages/design/package.json`, add:

```json
  "scripts": {
    "assets": "node scripts/build-assets.mjs && prettier --write src/generated"
  },
```

`packages/design/scripts/build-assets.mjs`:

```js
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';
import { optimize } from 'svgo';

const path = (relative) =>
  fileURLToPath(new URL(`../${relative}`, import.meta.url));

const SVG_SOURCES = {
  'logo-wordmark': 'LOGOTYPE/BASIC/ENCRE/SANS_LOGOMARK/LOGO_APHRA_ENCORE.svg',
  'logo-wordmark-moon':
    'LOGOTYPE/BASIC/ENCRE/AVEC_LOGOMARK/LOGO_APHRA_ENCRE.svg',
  ...Object.fromEntries(
    [1, 2, 3, 4, 5, 6].map((n) => [
      `logomark-${n}`,
      `LOGOMARK/BASIC/${n}/ENCRE/LOGOMARK_${n}_ENCRE.svg`,
    ]),
  ),
};
const ILLUSTRATIONS = ['concombre', 'mangue', 'pomme', 'poivron', 'tomate'];
const SOURCE_INK = /#162419/gi;
const MAX_WIDTH = 1920;

async function buildSvg(name, source) {
  const raw = await readFile(path(`sources/${source}`), 'utf8');
  const { data } = optimize(raw.replace(SOURCE_INK, 'currentColor'), {
    path: source,
    multipass: true,
  });
  await writeFile(path(`assets/${name}.svg`), `${data}\n`);
}

async function trimmed(source) {
  const file = path(`sources/${source}`);
  const original = await sharp(file).metadata();
  const { data, info } = await sharp(file)
    .trim()
    .toBuffer({ resolveWithObject: true });
  if (info.width === original.width && info.height === original.height) {
    throw new Error(`${source}: trim removed nothing`);
  }
  return data;
}

async function buildIllustration(name) {
  const image = await trimmed(`ICONO/ILLUS_${name.toUpperCase()}.png`);
  for (const width of [480, 960]) {
    await sharp(image)
      .resize({ width })
      .webp({ quality: 82 })
      .toFile(path(`assets/illustration-${name}-${width}.webp`));
  }
  const full = await sharp(image)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path(`assets/illustration-${name}-full.webp`));
  return `  ${name}: { width: ${full.width}, height: ${full.height} },`;
}

async function buildStamp() {
  const image = await trimmed('LOGOMARK/TAMPON/LOGOMARK_TAMPON_1.png');
  const info = await sharp(image)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(path('assets/logomark-stamp.webp'));
  return `export const STAMP_SIZE = { width: ${info.width}, height: ${info.height} } as const;`;
}

await mkdir(path('assets'), { recursive: true });
await mkdir(path('src/generated'), { recursive: true });
await Promise.all(
  Object.entries(SVG_SOURCES).map(([name, source]) => buildSvg(name, source)),
);
const illustrations = [];
for (const name of ILLUSTRATIONS)
  illustrations.push(await buildIllustration(name));
const stamp = await buildStamp();
await writeFile(
  path('src/generated/asset-sizes.ts'),
  [
    '// Generated by scripts/build-assets.mjs. Run `npm run assets` to update.',
    'export const ILLUSTRATION_SIZES = {',
    ...illustrations,
    '} as const;',
    '',
    stamp,
    '',
  ].join('\n'),
);
```

`packages/design/assets/signature.svg`: a placeholder. The designer's outlined Magnolia signature replaces it (owner input 1).

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 90"><text x="8" y="66" font-family="'Snell Roundhand', 'Segoe Script', cursive" font-size="64" font-style="italic" fill="currentColor">Aphra</text></svg>
```

- [ ] **Step 5: Generate the assets**

Run: `npm run assets --workspace @aphralab/design` Expected: exits 0. `ls packages/design/assets` lists 8 SVGs, `signature.svg`, `logomark-stamp.webp` and 15 illustration WebP files. `src/generated/asset-sizes.ts` has 5 illustration entries, each wider than 960.

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run packages/design/tests/unit/assets.unit.test.ts` Expected: PASS.

- [ ] **Step 7: Look at the result**

Open three files in a browser to check them by eye: `packages/design/assets/logo-wordmark-moon.svg`, `illustration-tomate-960.webp`, `logomark-stamp.webp`. The logo shows in black (`currentColor` in an `<img>`). The fruit has no large empty margin.

- [ ] **Step 8: Run the full gate and commit**

Run: `npm run check` Expected: PASS. The Magnolia guard test still passes.

```bash
git add package-lock.json packages/design
git commit -m "feat(design): add the brand sources and web-ready assets"
```

Open PR 1 (`feat/design-kit-foundation`, title `feat(design): add the design kit foundation`). Stop until it is merged.

---

### Task 4: Storybook and foundation pages

**Files:**

- Create: `packages/design/.storybook/main.ts`, `preview.ts`, `storybook.css`
- Create: `packages/design/src/utils/cn.ts`
- Create: `packages/design/src/docs/ColourTable.tsx`, `AssetGrid.tsx`, `Introduction.mdx`, `Colours.mdx`, `Typography.mdx`, `Assets.mdx`
- Modify: `packages/design/package.json`
- Test: `packages/design/tests/unit/docs.unit.test.tsx`

**Interfaces:**

- Consumes: `PALETTE`, `contrastRatio`, `RECIPES` (Task 2); asset files (Task 3).
- Produces:
  - `cn(...parts: (string | false | null | undefined)[]): string`
  - scripts `storybook` and `build-storybook`
  - story title `Foundations/Colours`, which the Task 5 smoke test relies on

- [ ] **Step 1: Write the failing test**

`packages/design/tests/unit/docs.unit.test.tsx`:

```tsx
import { readdirSync } from 'node:fs';

import { render, screen, within } from '@testing-library/react';

import { AssetGrid } from '../../src/docs/AssetGrid';
import { ColourTable, RecipeTable } from '../../src/docs/ColourTable';
import { cn } from '../../src/utils/cn';

describe('cn', () => {
  it('joins the truthy class names', () => {
    expect(cn('a', false, undefined, 'b', null)).toBe('a b');
  });
});

describe('ColourTable', () => {
  it('lists the seven brandbook colours with their print values', () => {
    render(<ColourTable />);

    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(rows).toHaveLength(8);
    expect(screen.getByText('#374036')).toBeInTheDocument();
    expect(screen.getByText('68 49 63 61')).toBeInTheDocument();
  });
});

describe('RecipeTable', () => {
  it('lists the four recipes with their colour', () => {
    render(<RecipeTable />);

    expect(screen.getByText('Rhum mangue')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(
      5,
    );
  });
});

describe('AssetGrid', () => {
  it('offers a download link for every file in assets/', () => {
    render(<AssetGrid />);

    const files = readdirSync('packages/design/assets').filter((file) =>
      /\.(svg|webp)$/.test(file),
    );
    for (const file of files) {
      expect(screen.getByRole('link', { name: file })).toHaveAttribute(
        'download',
        file,
      );
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run packages/design/tests/unit/docs.unit.test.tsx` Expected: FAIL. `Failed to resolve import "../../src/docs/AssetGrid"`.

- [ ] **Step 3: Install Storybook**

Run: `npm install --save-dev storybook@^10.6.1 @storybook/react-vite@^10.6.1 @storybook/addon-docs@^10.6.1 @storybook/addon-a11y@^10.6.1 --workspace @aphralab/design`

In `packages/design/package.json` `scripts`, add:

```json
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build --quiet -o storybook-static"
```

- [ ] **Step 4: Configure Storybook**

`packages/design/.storybook/main.ts`:

```ts
import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, { plugins: [tailwindcss()] }),
};

export default config;
```

The react-vite framework adds `@vitejs/plugin-react` itself. Do not add it again, or the React plugin runs twice. Storybook runs with `packages/design` as its working directory, which has no `vite.config.ts`, so the site's Cloudflare plugin is not loaded.

`packages/design/.storybook/preview.ts`:

```ts
import type { Preview } from '@storybook/react-vite';

import './storybook.css';

const preview: Preview = {
  parameters: { layout: 'centered' },
};

export default preview;
```

`packages/design/.storybook/storybook.css`:

```css
@import 'tailwindcss';
@import '../src/tokens/tokens.css';
@source '../src';

body {
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-mono);
}
```

- [ ] **Step 5: Write the helpers and pages**

`packages/design/src/utils/cn.ts`:

```ts
export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}
```

`packages/design/src/docs/ColourTable.tsx`:

```tsx
import { contrastRatio } from '../tokens/contrast';
import { PALETTE, type ColorToken } from '../tokens/palette';
import { RECIPES } from '../tokens/recipes';

function hexOf(token: ColorToken) {
  return PALETTE.find((colour) => colour.token === token)?.hex ?? '#000000';
}

function Swatch({ hex }: { hex: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-10 border border-ink"
      style={{ backgroundColor: hex }}
    />
  );
}

export function ColourTable() {
  return (
    <table>
      <thead>
        <tr>
          <th>Swatch</th>
          <th>Token</th>
          <th>HEX</th>
          <th>CMJN</th>
          <th>RVB</th>
          <th>On paper</th>
          <th>On black</th>
        </tr>
      </thead>
      <tbody>
        {PALETTE.map((colour) => (
          <tr key={colour.token}>
            <td>
              <Swatch hex={colour.hex} />
            </td>
            <td>
              <code>{colour.token}</code>
            </td>
            <td>{colour.hex}</td>
            <td>{colour.cmjn ?? '—'}</td>
            <td>{colour.rvb}</td>
            <td>{contrastRatio(colour.hex, hexOf('paper')).toFixed(1)}</td>
            <td>{contrastRatio(colour.hex, hexOf('black')).toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function RecipeTable() {
  return (
    <table>
      <thead>
        <tr>
          <th>Recipe</th>
          <th>Colour</th>
          <th>Illustration</th>
        </tr>
      </thead>
      <tbody>
        {RECIPES.map((recipe) => (
          <tr key={recipe.id}>
            <td>{recipe.name}</td>
            <td>
              <Swatch hex={hexOf(recipe.color)} /> <code>{recipe.color}</code>
            </td>
            <td>
              <code>{recipe.illustration}</code>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

`packages/design/src/docs/AssetGrid.tsx`:

```tsx
const FILES = import.meta.glob<string>('../../assets/*.{svg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const ASSET_FILES = Object.entries(FILES)
  .map(([path, url]) => ({ name: path.split('/').pop() ?? path, url }))
  .sort((a, b) => a.name.localeCompare(b.name));

export function AssetGrid() {
  return (
    <ul className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {ASSET_FILES.map((file) => (
        <li
          key={file.name}
          className="flex flex-col gap-2 border border-ink p-3"
        >
          <img src={file.url} alt="" className="h-32 w-full object-contain" />
          <a
            href={file.url}
            download={file.name}
            className="font-mono text-legal text-ink underline"
          >
            {file.name}
          </a>
        </li>
      ))}
    </ul>
  );
}
```

`packages/design/src/docs/Introduction.mdx`:

````mdx
import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Foundations/Introduction" />

# Aphra design kit

Tokens, assets and React components for Aphra sites. Source: `packages/design` in [Aphra-lab/aphra-web](https://github.com/Aphra-lab/aphra-web). Rules for AI assistants: `packages/design/AGENTS.md`.

## Use it in a site

```css
@import 'tailwindcss';
@import '@aphralab/design/tokens.css';
@source '../packages/design/src';
```

```tsx
import { AgeGate, LetterPage } from '@aphralab/design';
```

Public copy is in French. Every page shows the health warning. `LetterPage` and `AgeGate` already include it.
````

`packages/design/src/docs/Colours.mdx`:

```mdx
import { Meta } from '@storybook/addon-docs/blocks';

import { ColourTable, RecipeTable } from './ColourTable';

<Meta title="Foundations/Colours" />

# Colours

Every colour comes from `COULEURS.pdf`. HEX, CMJN and RVB are copied from the PDF. The paper CMJN is not in the PDF yet. Tailwind default colours do not exist in this kit.

<ColourTable />

## Recipes

<RecipeTable />

## Text contrast

- On paper: `ink` and `black` for body text. `red` and `brown` pass for text. `green` is for large text only (24 px, or 18.7 px bold). `yellow` is never text.
- On black: `paper`, `yellow` and `green`.
```

`packages/design/src/docs/Typography.mdx`:

```mdx
import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Foundations/Typography" />

# Typography

<p className="font-mono text-body">
  text-body — Bienvenue, vous êtes sur le site internet d'Aphra.
</p>
<p className="font-mono text-caption">
  text-caption — BOISSON DU XVIIe REPENSÉE POUR LE XXIe
</p>
<p className="font-mono text-nav">text-nav — MENU 000450</p>
<p className="font-mono text-legal">
  text-legal — L'abus d'alcool est dangereux pour la santé, à consommer avec
  modération.
</p>
<p className="font-script text-4xl">font-script — Sobrement</p>

- `font-mono` is DM Mono (SIL Open Font License).
- `font-script` is Magnolia Cora Script. Its licence covers `aphralab.com` only, so this page shows the fallback.
- The "Aphra" wordmark is a drawing. Use `Logo`, never text.
- Below 768 px, `text-body` is 15 px.
```

`packages/design/src/docs/Assets.mdx`:

```mdx
import { Meta } from '@storybook/addon-docs/blocks';

import { AssetGrid } from './AssetGrid';

<Meta title="Foundations/Assets" />

# Assets

Web-ready files. SVGs draw with `currentColor`. The editable sources (`.ai`, `.psd`, `.pdf`, original PNG) are in [`packages/design/sources`](https://github.com/Aphra-lab/aphra-web/tree/dev/packages/design/sources). The Magnolia font files are never in the repository.

<AssetGrid />
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run packages/design/tests/unit/docs.unit.test.tsx` Expected: PASS, 4 tests.

- [ ] **Step 7: Build Storybook**

Run: `npm run build-storybook --workspace @aphralab/design && node -e "const i=require('./packages/design/storybook-static/index.json'); const t=new Set(Object.values(i.entries).map(e=>e.title)); console.log([...t].sort().join('\n')); if(!t.has('Foundations/Colours')) process.exit(1)"` Expected: exits 0 and prints the four `Foundations/*` titles.

Run: `npm run storybook --workspace @aphralab/design`, and open `http://localhost:6006`. Check that the Colours page shows the swatches in DM Mono on paper, and that the a11y panel lists no violations.

- [ ] **Step 8: Run the full gate and commit**

Run: `npm run check` Expected: PASS.

```bash
git add package-lock.json packages/design
git commit -m "feat(design): add storybook with the foundation pages"
```

---

### Task 5: Deploy the Storybook

**Files:**

- Create: `packages/design/wrangler.jsonc`, `packages/design/scripts/write-version.mjs`, `tests/smoke/design.spec.ts`
- Modify: `packages/design/package.json`, `.github/workflows/ci.yml`, `.github/workflows/smoke.yml`, `tests/unit/workflows.unit.test.ts`
- Test: `packages/design/tests/unit/deploy.unit.test.ts`, `tests/unit/workflows.unit.test.ts`

**Interfaces:**

- Consumes: `build-storybook` script and the `Foundations/Colours` story (Task 4).
- Produces:
  - Worker `aphra-design`: `design.aphralab.com` in production, `aphra-design-staging.aphralab.workers.dev` in staging
  - `storybook-static/version.json` = `{ "commit": "<sha>" }`
  - smoke tag `@design`, and the env vars `DESIGN_BASE_URL` and `EXPECTED_COMMIT`

- [ ] **Step 1: Write the failing tests**

`packages/design/tests/unit/deploy.unit.test.ts`:

```ts
// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';

import { parse } from 'jsonc-parser';

interface WorkerConfig {
  name: string;
  main?: string;
  workers_dev?: boolean;
  routes?: { pattern: string; custom_domain?: boolean }[];
  assets?: { directory?: string };
  env?: Record<string, { workers_dev?: boolean; routes?: unknown[] }>;
}

const config = parse(
  readFileSync('packages/design/wrangler.jsonc', 'utf8'),
) as WorkerConfig;

describe('aphra-design Worker', () => {
  it('serves only the Storybook build, with no script', () => {
    expect(config.name).toBe('aphra-design');
    expect(config.main).toBeUndefined();
    expect(config.assets).toEqual({ directory: './storybook-static' });
  });

  it('serves production on design.aphralab.com only', () => {
    expect(config.workers_dev).toBe(false);
    expect(config.routes).toEqual([
      { pattern: 'design.aphralab.com', custom_domain: true },
    ]);
  });

  it('keeps staging on workers.dev', () => {
    expect(config.env?.staging).toEqual({ workers_dev: true, routes: [] });
  });
});

describe('write-version script', () => {
  it('writes the commit into the Storybook build', () => {
    mkdirSync('packages/design/storybook-static', { recursive: true });
    execFileSync('node', ['packages/design/scripts/write-version.mjs'], {
      env: { ...process.env, COMMIT_SHA: 'abc123' },
    });

    expect(
      JSON.parse(
        readFileSync('packages/design/storybook-static/version.json', 'utf8'),
      ),
    ).toEqual({ commit: 'abc123' });
  });
});
```

Append to `tests/unit/workflows.unit.test.ts`:

```ts
const ci = readFileSync('.github/workflows/ci.yml', 'utf8');

function job(name: string) {
  const start = ci.indexOf(`\n  ${name}:\n`);
  if (start === -1) throw new Error(`job ${name} not found`);
  const rest = ci.slice(start + 1);
  const next = rest.slice(1).search(/\n {2}[a-z][a-z-]*:\n/);
  return next === -1 ? rest : rest.slice(0, next + 1);
}

describe('ci workflow', () => {
  it('builds the Storybook in the checks job', () => {
    expect(job('checks')).toContain(
      'npm run build-storybook --workspace @aphralab/design',
    );
  });

  it.each([
    {
      name: 'deploy-design-staging',
      branch: 'refs/heads/dev',
      command:
        'command: deploy --config packages/design/wrangler.jsonc --env staging',
      url: 'https://aphra-design-staging.aphralab.workers.dev',
    },
    {
      name: 'deploy-design-production',
      branch: 'refs/heads/main',
      command: 'command: deploy --config packages/design/wrangler.jsonc\n',
      url: 'https://design.aphralab.com',
    },
  ])('$name deploys the kit from the root and smoke-tests it', (expected) => {
    const block = job(expected.name);

    expect(block).toContain(`github.ref == '${expected.branch}'`);
    expect(block).toContain(expected.command);
    expect(block).toContain('COMMIT_SHA: ${{ github.sha }}');
    expect(block).toContain('npm run test:smoke -- --grep @design');
    expect(block).toContain(`DESIGN_BASE_URL: ${expected.url}`);
    expect(block).toContain('EXPECTED_COMMIT: ${{ github.sha }}');
  });
});

describe('daily smoke workflow', () => {
  it('also checks the design kit URL', () => {
    expect(readFileSync('.github/workflows/smoke.yml', 'utf8')).toContain(
      'DESIGN_BASE_URL: https://design.aphralab.com',
    );
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run packages/design/tests/unit/deploy.unit.test.ts tests/unit/workflows.unit.test.ts` Expected: FAIL. `ENOENT ... wrangler.jsonc`, and `job deploy-design-staging not found`.

- [ ] **Step 3: Add the Worker config and the version script**

`packages/design/wrangler.jsonc`:

```jsonc
{
  "$schema": "../../node_modules/wrangler/config-schema.json",
  "name": "aphra-design",
  "compatibility_date": "2026-09-30",
  "assets": { "directory": "./storybook-static" },
  "workers_dev": false,
  "routes": [{ "pattern": "design.aphralab.com", "custom_domain": true }],
  "env": {
    "staging": { "workers_dev": true, "routes": [] },
  },
}
```

`packages/design/scripts/write-version.mjs`:

```js
import { writeFileSync } from 'node:fs';

const commit = process.env.COMMIT_SHA ?? 'local';
writeFileSync(
  new URL('../storybook-static/version.json', import.meta.url),
  `${JSON.stringify({ commit })}\n`,
);
```

In `packages/design/package.json`, change `build-storybook`:

```json
    "build-storybook": "storybook build --quiet -o storybook-static && node scripts/write-version.mjs"
```

- [ ] **Step 4: Add the smoke tests**

`tests/smoke/design.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

const designUrl = process.env.DESIGN_BASE_URL;
const expectedCommit = process.env.EXPECTED_COMMIT;

test.describe('design kit', { tag: '@design' }, () => {
  test.skip(!designUrl, 'DESIGN_BASE_URL is not set');

  test('Storybook is served by Cloudflare over HTTPS', async ({ request }) => {
    const response = await request.get(`${designUrl}/`);

    expect(response.status()).toBe(200);
    expect(response.url()).toMatch(/^https:\/\//);
    expect(response.headers().server).toBe('cloudflare');
  });

  test('Storybook lists the foundation pages', async ({ request }) => {
    const response = await request.get(`${designUrl}/index.json`);

    expect(response.status()).toBe(200);
    const index = (await response.json()) as {
      entries: Record<string, { title: string }>;
    };
    const titles = Object.values(index.entries).map((entry) => entry.title);
    expect(titles).toContain('Foundations/Colours');
  });

  test('version.json reports the deployed build', async ({ request }) => {
    const response = await request.get(`${designUrl}/version.json`);

    expect(response.status()).toBe(200);
    const body = (await response.json()) as { commit: string };
    if (expectedCommit) expect(body.commit).toBe(expectedCommit);
    else expect(body.commit).toMatch(/^[0-9a-f]{7,40}$/);
  });
});
```

- [ ] **Step 5: Change the workflows**

In `.github/workflows/ci.yml`, job `checks`, add after `- run: npm run build`:

```yaml
- run: npm run build-storybook --workspace @aphralab/design
```

Add these two jobs after `deploy-production`:

```yaml
deploy-design-staging:
  if: github.event_name == 'push' && github.ref == 'refs/heads/dev'
  needs: checks
  runs-on: ubuntu-latest
  environment:
    name: staging
    url: https://aphra-design-staging.aphralab.workers.dev
  concurrency:
    group: deploy-design-staging
    cancel-in-progress: false
  steps:
    - uses: actions/checkout@v7
    - uses: actions/setup-node@v7
      with:
        node-version-file: .nvmrc
        cache: npm
    - run: npm ci
    - run: npm run build-storybook --workspace @aphralab/design
      env:
        COMMIT_SHA: ${{ github.sha }}
    - uses: cloudflare/wrangler-action@v4
      with:
        apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        accountId: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}
        command: deploy --config packages/design/wrangler.jsonc --env staging
    - run: npx playwright install --with-deps chromium
    - run: npm run test:smoke -- --grep @design
      env:
        SMOKE_BASE_URL: https://aphra-design-staging.aphralab.workers.dev
        DESIGN_BASE_URL: https://aphra-design-staging.aphralab.workers.dev
        EXPECTED_COMMIT: ${{ github.sha }}

deploy-design-production:
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  needs: checks
  runs-on: ubuntu-latest
  environment:
    name: production
    url: https://design.aphralab.com
  concurrency:
    group: deploy-design-production
    cancel-in-progress: false
  steps:
    - uses: actions/checkout@v7
    - uses: actions/setup-node@v7
      with:
        node-version-file: .nvmrc
        cache: npm
    - run: npm ci
    - run: npm run build-storybook --workspace @aphralab/design
      env:
        COMMIT_SHA: ${{ github.sha }}
    - uses: cloudflare/wrangler-action@v4
      with:
        apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        accountId: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}
        command: deploy --config packages/design/wrangler.jsonc
    - run: npx playwright install --with-deps chromium
    - run: npm run test:smoke -- --grep @design
      env:
        SMOKE_BASE_URL: https://design.aphralab.com
        DESIGN_BASE_URL: https://design.aphralab.com
        EXPECTED_COMMIT: ${{ github.sha }}
```

The deploy runs from the repository root with `--config`, so the pinned root `wrangler` is used. `wrangler-action` with `workingDirectory: packages/design` would not find the hoisted binary.

In `.github/workflows/smoke.yml`, step `npm run test:smoke`, add to `env`:

```yaml
DESIGN_BASE_URL: https://design.aphralab.com
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run packages/design/tests/unit/deploy.unit.test.ts tests/unit/workflows.unit.test.ts` Expected: PASS.

Run: `SMOKE_BASE_URL=https://aphralab.com npx playwright test --config playwright.smoke.config.ts --grep @design --list` Expected: lists 3 tests. Without `DESIGN_BASE_URL` they are skipped when run.

- [ ] **Step 7: Deploy dry run**

Run: `npm run build-storybook --workspace @aphralab/design && npx wrangler deploy --config packages/design/wrangler.jsonc --env staging --dry-run` Expected: Wrangler reports the assets upload plan for `aphra-design-staging` and no error.

- [ ] **Step 8: Run the full gate and commit**

Run: `npm run check` Expected: PASS.

```bash
git add packages/design tests .github
git commit -m "ci(design): deploy the storybook to design.aphralab.com"
```

Open PR 2 (`feat/design-kit-storybook`, title `feat(design): publish the design kit storybook`). Stop until it is merged. After the merge, check that the `deploy-design-staging` job is green. `https://aphra-design-staging.aphralab.workers.dev` should show the four foundation pages. If the job fails on a Cloudflare permission, the owner adds `Workers Scripts: Edit` for the account to the API token. The site token already manages the `aphralab.com` zone.

---

### Task 6: `Text`

**Files:**

- Create: `packages/design/src/components/Text/Text.tsx`, `Text.stories.tsx`
- Modify: `packages/design/src/index.ts`
- Test: `packages/design/tests/unit/Text.unit.test.tsx`

**Interfaces:**

- Consumes: `cn` (Task 4), type tokens (Task 2).
- Produces:
  - `type TextVariant = 'body' | 'caption' | 'nav'`
  - `Text<T extends ElementType = 'p'>(props: { as?: T; variant?: TextVariant; className?: string } & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'>)`

- [ ] **Step 1: Write the failing test**

`packages/design/tests/unit/Text.unit.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import { Text } from '@aphralab/design';

describe('Text', () => {
  it('renders a paragraph in the body style by default', () => {
    render(<Text>Bienvenue,</Text>);

    const text = screen.getByText('Bienvenue,');
    expect(text.tagName).toBe('P');
    expect(text).toHaveClass('font-mono', 'text-body');
  });

  it('renders the caption style on the element given by as, keeping the case', () => {
    render(
      <Text as="span" variant="caption">
        BOISSON DU XVIIe
      </Text>,
    );

    const text = screen.getByText('BOISSON DU XVIIe');
    expect(text.tagName).toBe('SPAN');
    expect(text).toHaveClass('text-caption');
    expect(text).not.toHaveClass('uppercase');
  });

  it('keeps extra classes and attributes', () => {
    render(
      <Text variant="nav" id="menu" className="text-center">
        MENU
      </Text>,
    );

    const text = screen.getByText('MENU');
    expect(text).toHaveAttribute('id', 'menu');
    expect(text).toHaveClass('text-nav', 'text-center');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run packages/design/tests/unit/Text.unit.test.tsx` Expected: FAIL. The element type is invalid: `Text` is `undefined`.

- [ ] **Step 3: Write the component**

`packages/design/src/components/Text/Text.tsx`:

```tsx
import type { ComponentPropsWithoutRef, ElementType } from 'react';

import { cn } from '../../utils/cn';

const VARIANTS = {
  body: 'font-mono text-body',
  caption: 'font-mono text-caption',
  nav: 'font-mono text-nav',
} as const;

export type TextVariant = keyof typeof VARIANTS;

export type TextProps<T extends ElementType = 'p'> = {
  as?: T;
  variant?: TextVariant;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'>;

export function Text<T extends ElementType = 'p'>({
  as,
  variant = 'body',
  className,
  ...props
}: TextProps<T>) {
  const Component: ElementType = as ?? 'p';
  return <Component className={cn(VARIANTS[variant], className)} {...props} />;
}
```

`packages/design/src/components/Text/Text.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from './Text';

const meta = {
  title: 'Primitives/Text',
  component: Text,
  args: { children: 'Bienvenue, vous êtes sur le site internet d’Aphra.' },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Body: Story = { args: { variant: 'body' } };
export const Caption: Story = {
  args: {
    variant: 'caption',
    children: 'BOISSON DU XVIIe REPENSÉE POUR LE XXIe',
  },
};
export const Nav: Story = { args: { variant: 'nav', children: 'MENU' } };
```

Add to `packages/design/src/index.ts`:

```ts
export { Text } from './components/Text/Text';
export type { TextProps, TextVariant } from './components/Text/Text';
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run packages/design/tests/unit/Text.unit.test.tsx` Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/design
git commit -m "feat(design): add the text component"
```

---

### Task 7: `Logo`, `Logomark`, `Signature`

**Files:**

- Create: `packages/design/src/components/MaskImage/MaskImage.tsx`
- Create: `packages/design/src/components/Logo/Logo.tsx`, `Logo.stories.tsx`
- Create: `packages/design/src/components/Logomark/Logomark.tsx`, `Logomark.stories.tsx`
- Create: `packages/design/src/components/Signature/Signature.tsx`, `Signature.stories.tsx`
- Modify: `packages/design/src/index.ts`
- Test: `packages/design/tests/unit/Logo.unit.test.tsx`

**Interfaces:**

- Consumes: `cn`, `Text`, the asset files and `STAMP_SIZE` (Task 3).
- Produces:
  - internal `MaskImage({ src, aspectRatio, label?, className? })`: with `label`, `role="img"`; without it, `aria-hidden`
  - `Logo({ variant?: 'wordmark' | 'wordmark-moon', className? })`, plus `LOGO_FILES`
  - `Logomark({ face?: 1|2|3|4|5|6|'stamp', decorative?: boolean, className? })`, plus `LOGOMARK_FILES`
  - `Signature({ team?: boolean, className? })`, plus `SIGNATURE_RATIO`

- [ ] **Step 1: Write the failing test**

`packages/design/tests/unit/Logo.unit.test.tsx`:

```tsx
import { readFileSync } from 'node:fs';

import { render, screen } from '@testing-library/react';

import { Logo, Logomark, Signature } from '@aphralab/design';

import { LOGO_FILES } from '../../src/components/Logo/Logo';
import { LOGOMARK_FILES } from '../../src/components/Logomark/Logomark';
import { SIGNATURE_RATIO } from '../../src/components/Signature/Signature';

function viewBoxRatio(file: string) {
  const match = /viewBox="([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"/.exec(
    readFileSync(`packages/design/assets/${file}`, 'utf8'),
  );
  if (!match) throw new Error(`${file} has no viewBox`);
  return Number(match[3]) / Number(match[4]);
}

describe('Logo', () => {
  it('draws the wordmark in the current colour, named Aphra', () => {
    render(<Logo />);

    const logo = screen.getByRole('img', { name: 'Aphra' });
    expect(logo.style.getPropertyValue('--mask-src')).toContain(
      'logo-wordmark.svg',
    );
    expect(logo).toHaveClass('bg-current', 'h-16');
  });

  it('draws the wordmark with the moon', () => {
    render(<Logo variant="wordmark-moon" className="h-10" />);

    const logo = screen.getByRole('img', { name: 'Aphra' });
    expect(logo.style.getPropertyValue('--mask-src')).toContain(
      'logo-wordmark-moon.svg',
    );
    expect(logo).toHaveClass('h-10');
    expect(logo).not.toHaveClass('h-16');
  });

  it.each([
    ['wordmark', 'logo-wordmark.svg'],
    ['wordmark-moon', 'logo-wordmark-moon.svg'],
  ] as const)('keeps the %s aspect ratio of its SVG', (variant, file) => {
    expect(LOGO_FILES[variant].ratio).toBeCloseTo(viewBoxRatio(file), 3);
  });
});

describe('Logomark', () => {
  it.each([1, 2, 3, 4, 5, 6] as const)('draws moon face %i', (face) => {
    render(<Logomark face={face} />);

    expect(
      screen
        .getByRole('img', { name: 'Aphra' })
        .style.getPropertyValue('--mask-src'),
    ).toContain(`logomark-${face}.svg`);
    expect(LOGOMARK_FILES[face].ratio).toBeCloseTo(
      viewBoxRatio(`logomark-${face}.svg`),
      3,
    );
  });

  it('draws the stamp texture', () => {
    render(<Logomark face="stamp" />);

    expect(
      screen
        .getByRole('img', { name: 'Aphra' })
        .style.getPropertyValue('--mask-src'),
    ).toContain('logomark-stamp.webp');
  });

  it('hides a decorative logomark from assistive technology', () => {
    const { container } = render(<Logomark decorative />);

    expect(screen.queryByRole('img')).toBeNull();
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Signature', () => {
  it('draws the signature and the team line', () => {
    render(<Signature team />);

    expect(screen.getByRole('img', { name: 'Aphra' })).toBeInTheDocument();
    expect(screen.getByText('Aphra team.')).toBeInTheDocument();
  });

  it('keeps the aspect ratio of signature.svg', () => {
    expect(SIGNATURE_RATIO).toBeCloseTo(viewBoxRatio('signature.svg'), 3);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run packages/design/tests/unit/Logo.unit.test.tsx` Expected: FAIL. `Failed to resolve import "../../src/components/Logo/Logo"`.

- [ ] **Step 3: Write the components**

`packages/design/src/components/MaskImage/MaskImage.tsx`:

```tsx
import type { CSSProperties } from 'react';

import { cn } from '../../utils/cn';

export interface MaskImageProps {
  src: string;
  aspectRatio: number;
  label?: string;
  className?: string;
}

export function MaskImage({
  src,
  aspectRatio,
  label,
  className,
}: MaskImageProps) {
  const style = {
    '--mask-src': `url("${src}")`,
    '--mask-ratio': String(aspectRatio),
  } as CSSProperties;
  const accessibility = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true };

  return (
    <span
      {...accessibility}
      style={style}
      className={cn(
        'inline-block bg-current [aspect-ratio:var(--mask-ratio)] [mask-image:var(--mask-src)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]',
        className,
      )}
    />
  );
}
```

`packages/design/src/components/Logo/Logo.tsx`:

```tsx
import wordmark from '../../../assets/logo-wordmark.svg?url';
import wordmarkMoon from '../../../assets/logo-wordmark-moon.svg?url';
import { MaskImage } from '../MaskImage/MaskImage';

export const LOGO_FILES = {
  wordmark: { src: wordmark, ratio: 879.63 / 400.47 },
  'wordmark-moon': { src: wordmarkMoon, ratio: 1015.59 / 494.41 },
} as const;

export type LogoVariant = keyof typeof LOGO_FILES;

export interface LogoProps {
  variant?: LogoVariant;
  className?: string;
}

export function Logo({ variant = 'wordmark', className }: LogoProps) {
  const file = LOGO_FILES[variant];
  return (
    <MaskImage
      src={file.src}
      aspectRatio={file.ratio}
      label="Aphra"
      className={className ?? 'h-16'}
    />
  );
}
```

`packages/design/src/components/Logomark/Logomark.tsx`:

```tsx
import face1 from '../../../assets/logomark-1.svg?url';
import face2 from '../../../assets/logomark-2.svg?url';
import face3 from '../../../assets/logomark-3.svg?url';
import face4 from '../../../assets/logomark-4.svg?url';
import face5 from '../../../assets/logomark-5.svg?url';
import face6 from '../../../assets/logomark-6.svg?url';
import stamp from '../../../assets/logomark-stamp.webp?url';
import { STAMP_SIZE } from '../../generated/asset-sizes';
import { MaskImage } from '../MaskImage/MaskImage';

const FACE_RATIO = 567.37 / 595.28;

export const LOGOMARK_FILES = {
  1: { src: face1, ratio: FACE_RATIO },
  2: { src: face2, ratio: FACE_RATIO },
  3: { src: face3, ratio: FACE_RATIO },
  4: { src: face4, ratio: FACE_RATIO },
  5: { src: face5, ratio: FACE_RATIO },
  6: { src: face6, ratio: FACE_RATIO },
  stamp: { src: stamp, ratio: STAMP_SIZE.width / STAMP_SIZE.height },
} as const;

export type LogomarkFace = keyof typeof LOGOMARK_FILES;

export interface LogomarkProps {
  face?: LogomarkFace;
  decorative?: boolean;
  className?: string;
}

export function Logomark({
  face = 1,
  decorative = false,
  className,
}: LogomarkProps) {
  const file = LOGOMARK_FILES[face];
  return (
    <MaskImage
      src={file.src}
      aspectRatio={file.ratio}
      label={decorative ? undefined : 'Aphra'}
      className={className ?? 'h-16'}
    />
  );
}
```

`packages/design/src/components/Signature/Signature.tsx`:

```tsx
import signature from '../../../assets/signature.svg?url';
import { cn } from '../../utils/cn';
import { MaskImage } from '../MaskImage/MaskImage';
import { Text } from '../Text/Text';

export const SIGNATURE_RATIO = 240 / 90;

export interface SignatureProps {
  team?: boolean;
  className?: string;
}

export function Signature({ team = false, className }: SignatureProps) {
  return (
    <span className={cn('inline-flex flex-col items-start', className)}>
      <MaskImage
        src={signature}
        aspectRatio={SIGNATURE_RATIO}
        label="Aphra"
        className="h-12"
      />
      {team && (
        <Text as="span" className="-mt-3 ml-10">
          Aphra team.
        </Text>
      )}
    </span>
  );
}
```

When the designer delivers the real `signature.svg`, update `SIGNATURE_RATIO` to its `viewBox`. The test fails until the two match.

Stories: `Logo.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Logo } from './Logo';

const meta = {
  title: 'Primitives/Logo',
  component: Logo,
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Wordmark: Story = { args: { variant: 'wordmark' } };
export const WordmarkWithMoon: Story = { args: { variant: 'wordmark-moon' } };
export const OnBlack: Story = {
  args: { variant: 'wordmark-moon', className: 'h-16 text-paper' },
  decorators: [
    (Story) => (
      <div className="bg-black p-8">
        <Story />
      </div>
    ),
  ],
};
```

`Logomark.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Logomark } from './Logomark';

const meta = {
  title: 'Primitives/Logomark',
  component: Logomark,
} satisfies Meta<typeof Logomark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllFaces: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      {([1, 2, 3, 4, 5, 6, 'stamp'] as const).map((face) => (
        <Logomark key={face} face={face} className="h-24" />
      ))}
    </div>
  ),
};
export const RecipeColour: Story = {
  args: { face: 3, className: 'h-24 text-red' },
};
```

`Signature.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Signature } from './Signature';

const meta = {
  title: 'Primitives/Signature',
  component: Signature,
} satisfies Meta<typeof Signature>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithTeam: Story = { args: { team: true } };
```

Add to `packages/design/src/index.ts`:

```ts
export { Logo } from './components/Logo/Logo';
export type { LogoProps, LogoVariant } from './components/Logo/Logo';
export { Logomark } from './components/Logomark/Logomark';
export type {
  LogomarkFace,
  LogomarkProps,
} from './components/Logomark/Logomark';
export { Signature } from './components/Signature/Signature';
export type { SignatureProps } from './components/Signature/Signature';
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run packages/design/tests/unit/Logo.unit.test.tsx` Expected: PASS.

- [ ] **Step 5: Check in Storybook**

Run: `npm run storybook --workspace @aphralab/design`. Open `Primitives/Logo` and `Primitives/Logomark`. The logos draw in ink on paper and in paper on black. The six faces are sharp at `h-24`.

- [ ] **Step 6: Commit**

```bash
git add packages/design
git commit -m "feat(design): add the logo, logomark and signature components"
```

---

### Task 8: `Illustration`

**Files:**

- Create: `packages/design/src/components/Illustration/Illustration.tsx`, `Illustration.stories.tsx`
- Modify: `packages/design/src/index.ts`
- Test: `packages/design/tests/unit/Illustration.unit.test.tsx`

**Interfaces:**

- Consumes: `IllustrationName`, `RECIPES` (Task 2); `ILLUSTRATION_SIZES` and the WebP files (Task 3).
- Produces: `Illustration({ name: IllustrationName; alt: string; sizes?: string; loading?: 'lazy' | 'eager'; className?: string })`.

- [ ] **Step 1: Write the failing test**

`packages/design/tests/unit/Illustration.unit.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import { Illustration, RECIPES } from '@aphralab/design';

import { ILLUSTRATION_SIZES } from '../../src/generated/asset-sizes';

describe('Illustration', () => {
  it('serves three WebP widths with the real size of the largest file', () => {
    render(<Illustration name="tomate" alt="Deux tomates sur leur branche" />);

    const image = screen.getByRole('img', {
      name: 'Deux tomates sur leur branche',
    });
    const { width, height } = ILLUSTRATION_SIZES.tomate;
    const sources = (image.getAttribute('srcset') ?? '').split(', ');
    expect(sources).toHaveLength(3);
    expect(sources[0]).toMatch(/illustration-tomate-480\.webp 480w$/);
    expect(sources[1]).toMatch(/illustration-tomate-960\.webp 960w$/);
    expect(sources[2]).toMatch(
      new RegExp(`illustration-tomate-full\\.webp ${width}w$`),
    );
    expect(image).toHaveAttribute('width', String(width));
    expect(image).toHaveAttribute('height', String(height));
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('accepts an empty alternative text for a decorative picture', () => {
    const { container } = render(<Illustration name="poivron" alt="" />);

    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });

  it.each(RECIPES.map((recipe) => recipe.illustration))(
    'renders the %s illustration',
    (name) => {
      render(<Illustration name={name} alt={name} loading="eager" />);

      expect(screen.getByRole('img', { name })).toHaveAttribute(
        'loading',
        'eager',
      );
    },
  );
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run packages/design/tests/unit/Illustration.unit.test.tsx` Expected: FAIL. `Illustration` is `undefined`.

- [ ] **Step 3: Write the component**

`packages/design/src/components/Illustration/Illustration.tsx`:

```tsx
import { ILLUSTRATION_SIZES } from '../../generated/asset-sizes';
import type { IllustrationName } from '../../tokens/recipes';

const FILES = import.meta.glob<string>('../../../assets/illustration-*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

function fileUrl(name: IllustrationName, variant: '480' | '960' | 'full') {
  const url = FILES[`../../../assets/illustration-${name}-${variant}.webp`];
  if (!url) throw new Error(`Missing illustration file ${name}-${variant}`);
  return url;
}

export interface IllustrationProps {
  name: IllustrationName;
  alt: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  className?: string;
}

export function Illustration({
  name,
  alt,
  sizes = '(width < 48rem) 100vw, 480px',
  loading = 'lazy',
  className,
}: IllustrationProps) {
  const { width, height } = ILLUSTRATION_SIZES[name];
  const srcSet = [
    `${fileUrl(name, '480')} 480w`,
    `${fileUrl(name, '960')} 960w`,
    `${fileUrl(name, 'full')} ${width}w`,
  ].join(', ');

  return (
    <img
      src={fileUrl(name, '960')}
      srcSet={srcSet}
      sizes={sizes}
      width={width}
      height={height}
      alt={alt}
      loading={loading}
      decoding="async"
      className={className}
    />
  );
}
```

`packages/design/src/components/Illustration/Illustration.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { RECIPES } from '../../tokens/recipes';
import { Illustration } from './Illustration';

const meta = {
  title: 'Primitives/Illustration',
  component: Illustration,
  args: {
    name: 'tomate',
    alt: 'Deux tomates sur leur branche',
    className: 'h-96 w-auto',
  },
} satisfies Meta<typeof Illustration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tomate: Story = {};
export const Recipes: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-8">
      {RECIPES.map((recipe) => (
        <figure key={recipe.id} className="flex flex-col items-center gap-2">
          <Illustration
            name={recipe.illustration}
            alt=""
            className="h-64 w-auto"
          />
          <figcaption className="font-mono text-caption">
            {recipe.name}
          </figcaption>
        </figure>
      ))}
    </div>
  ),
};
```

Add to `packages/design/src/index.ts`:

```ts
export { Illustration } from './components/Illustration/Illustration';
export type { IllustrationProps } from './components/Illustration/Illustration';
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run packages/design/tests/unit/Illustration.unit.test.tsx` Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/design
git commit -m "feat(design): add the illustration component"
```

---

### Task 9: `CircledLink`

**Files:**

- Create: `packages/design/src/components/CircledLink/CircledLink.tsx`, `CircledLink.stories.tsx`
- Modify: `packages/design/src/index.ts`, `packages/design/package.json`
- Test: `packages/design/tests/unit/CircledLink.unit.test.tsx`

**Interfaces:**

- Consumes: `cn`.
- Produces: `CircledLink({ asChild?: boolean; shape?: 1 | 2 | 3 } & AnchorHTMLAttributes<HTMLAnchorElement>)`, and `ELLIPSES: Record<1|2|3, string>`.

- [ ] **Step 1: Write the failing test**

`packages/design/tests/unit/CircledLink.unit.test.tsx`:

```tsx
import type { ComponentProps } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CircledLink } from '@aphralab/design';

function RouterLink(props: ComponentProps<'a'>) {
  return <a data-router="true" {...props} />;
}

describe('CircledLink', () => {
  it('renders a link circled by a decorative ellipse', () => {
    render(<CircledLink href="/recettes">recettes</CircledLink>);

    const link = screen.getByRole('link', { name: 'recettes' });
    expect(link).toHaveAttribute('href', '/recettes');
    expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('merges into the child element with asChild', () => {
    render(
      <CircledLink asChild>
        <RouterLink href="/partenaires">partenaires</RouterLink>
      </CircledLink>,
    );

    const link = screen.getByRole('link', { name: 'partenaires' });
    expect(link).toHaveAttribute('data-router', 'true');
    expect(link).toHaveClass('relative');
    expect(link.querySelector('svg')).not.toBeNull();
  });

  it('draws a different ellipse for each shape', () => {
    const { container } = render(
      <>
        <CircledLink href="#a" shape={1}>
          a
        </CircledLink>
        <CircledLink href="#b" shape={2}>
          b
        </CircledLink>
        <CircledLink href="#c" shape={3}>
          c
        </CircledLink>
      </>,
    );

    const paths = [...container.querySelectorAll('path')].map((path) =>
      path.getAttribute('d'),
    );
    expect(new Set(paths).size).toBe(3);
  });

  it('is reachable with the keyboard', async () => {
    render(<CircledLink href="/contact">contacter</CircledLink>);

    await userEvent.tab();

    expect(screen.getByRole('link', { name: 'contacter' })).toHaveFocus();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run packages/design/tests/unit/CircledLink.unit.test.tsx` Expected: FAIL. `CircledLink` is `undefined`.

- [ ] **Step 3: Add Radix Slot and write the component**

Run: `npm install @radix-ui/react-slot@^1.3.3 --workspace @aphralab/design`

`packages/design/src/components/CircledLink/CircledLink.tsx`:

```tsx
import type { AnchorHTMLAttributes } from 'react';

import { Slot, Slottable } from '@radix-ui/react-slot';

import { cn } from '../../utils/cn';

export const ELLIPSES = {
  1: 'M5 21C3 9 36 3 68 4c31 1 58 7 57 18-1 11-34 16-66 15C28 36 7 31 5 21Z',
  2: 'M9 25C2 13 30 5 63 5c33 0 62 5 61 16-1 12-30 16-63 15C31 35 14 33 9 25Zm-4-6c10-6 30-9 52-9',
  3: 'M4 18C8 7 40 4 70 5c29 1 55 8 53 19-2 10-33 14-64 12C30 34 2 29 4 18Zm110-12c6 2 10 5 11 9',
} as const;

export type CircledLinkShape = keyof typeof ELLIPSES;

export interface CircledLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean;
  shape?: CircledLinkShape;
}

export function CircledLink({
  asChild = false,
  shape = 1,
  className,
  children,
  ...props
}: CircledLinkProps) {
  const Component = asChild ? Slot : 'a';

  return (
    <Component
      className={cn(
        'group relative inline-block text-ink outline-none focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink',
        className,
      )}
      {...props}
    >
      <Slottable>{children}</Slottable>
      <svg
        aria-hidden="true"
        viewBox="0 0 130 40"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -top-2 -left-3 h-[calc(100%+1rem)] w-[calc(100%+1.5rem)] overflow-visible"
      >
        <path
          d={ELLIPSES[shape]}
          vectorEffect="non-scaling-stroke"
          className="fill-none stroke-ink stroke-1 group-focus-visible:stroke-2"
        />
      </svg>
    </Component>
  );
}
```

`packages/design/src/components/CircledLink/CircledLink.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { CircledLink } from './CircledLink';

const meta = {
  title: 'Primitives/CircledLink',
  component: CircledLink,
  args: { href: '#', children: 'recettes' },
} satisfies Meta<typeof CircledLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InASentence: Story = {
  render: (args) => (
    <p className="max-w-measure font-mono text-body">
      Ici, vous pouvez découvrir nos différentes <CircledLink {...args} />{' '}
      signatures.
    </p>
  ),
};
export const Shapes: Story = {
  render: () => (
    <p className="flex gap-10 font-mono text-body">
      <CircledLink href="#" shape={1}>
        technique
      </CircledLink>
      <CircledLink href="#" shape={2}>
        partenaires
      </CircledLink>
      <CircledLink href="#" shape={3}>
        contacter
      </CircledLink>
    </p>
  ),
};
```

Add to `packages/design/src/index.ts`:

```ts
export { CircledLink } from './components/CircledLink/CircledLink';
export type {
  CircledLinkProps,
  CircledLinkShape,
} from './components/CircledLink/CircledLink';
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run packages/design/tests/unit/CircledLink.unit.test.tsx` Expected: PASS, 4 tests.

- [ ] **Step 5: Check in Storybook**

In `Primitives/CircledLink`, the ellipse surrounds the word without covering the next line. Tab to the link: the outline and the thicker ellipse show.

- [ ] **Step 6: Commit**

```bash
git add package-lock.json packages/design
git commit -m "feat(design): add the circled link component"
```

---

### Task 10: `BottleCounter`

**Files:**

- Create: `packages/design/src/components/BottleCounter/BottleCounter.tsx`, `BottleCounter.stories.tsx`
- Modify: `packages/design/src/index.ts`
- Test: `packages/design/tests/unit/BottleCounter.unit.test.tsx`

**Interfaces:**

- Consumes: `cn`.
- Produces: `BottleCounter({ value?: number; className?: string })`.

- [ ] **Step 1: Write the failing test**

`packages/design/tests/unit/BottleCounter.unit.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import { BottleCounter } from '@aphralab/design';

const LOADING = 'Nombre de bouteilles vendues en cours de chargement';

describe('BottleCounter', () => {
  it('pads the count to six digits and names it for screen readers', () => {
    render(<BottleCounter value={450} />);

    expect(screen.getByText('000450')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('450 bouteilles vendues')).toHaveClass('sr-only');
  });

  it.each([
    [0, '0 bouteille vendue'],
    [1, '1 bouteille vendue'],
    [2, '2 bouteilles vendues'],
  ])('uses the right French form for %i', (value, label) => {
    render(<BottleCounter value={value} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('formats large counts the French way and never cuts digits', () => {
    render(<BottleCounter value={1234567} />);

    expect(screen.getByText('1234567')).toBeInTheDocument();
    expect(
      screen.getByText('1 234 567 bouteilles vendues'),
    ).toBeInTheDocument();
  });

  it('drops decimals', () => {
    render(<BottleCounter value={450.9} />);

    expect(screen.getByText('000450')).toBeInTheDocument();
  });

  it.each([undefined, -3, Number.NaN, Number.POSITIVE_INFINITY])(
    'shows a placeholder for %s',
    (value) => {
      const { container } = render(<BottleCounter value={value} />);

      expect(screen.getByText('——————')).toHaveAttribute('aria-hidden', 'true');
      expect(screen.getByText(LOADING)).toBeInTheDocument();
      expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
    },
  );
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run packages/design/tests/unit/BottleCounter.unit.test.tsx` Expected: FAIL. `BottleCounter` is `undefined`.

- [ ] **Step 3: Write the component**

`packages/design/src/components/BottleCounter/BottleCounter.tsx`:

```tsx
import { cn } from '../../utils/cn';

const DIGITS = 6;
const PLACEHOLDER = '—'.repeat(DIGITS);
const LOADING = 'Nombre de bouteilles vendues en cours de chargement';
const frenchNumber = new Intl.NumberFormat('fr-FR');

function isCount(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export interface BottleCounterProps {
  value?: number;
  className?: string;
}

export function BottleCounter({ value, className }: BottleCounterProps) {
  const classes = cn('font-mono text-nav tabular-nums text-ink', className);

  if (!isCount(value)) {
    return (
      <p aria-busy="true" className={classes}>
        <span aria-hidden="true">{PLACEHOLDER}</span>
        <span className="sr-only">{LOADING}</span>
      </p>
    );
  }

  const count = Math.trunc(value);
  const noun = count <= 1 ? 'bouteille vendue' : 'bouteilles vendues';
  return (
    <p className={classes}>
      <span aria-hidden="true">{String(count).padStart(DIGITS, '0')}</span>
      <span className="sr-only">{`${frenchNumber.format(count)} ${noun}`}</span>
    </p>
  );
}
```

`packages/design/src/components/BottleCounter/BottleCounter.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { BottleCounter } from './BottleCounter';

const meta = {
  title: 'Primitives/BottleCounter',
  component: BottleCounter,
} satisfies Meta<typeof BottleCounter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sold: Story = { args: { value: 450 } };
export const Loading: Story = { args: { value: undefined } };
export const Large: Story = { args: { value: 1234567 } };
```

Add to `packages/design/src/index.ts`:

```ts
export { BottleCounter } from './components/BottleCounter/BottleCounter';
export type { BottleCounterProps } from './components/BottleCounter/BottleCounter';
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run packages/design/tests/unit/BottleCounter.unit.test.tsx` Expected: PASS, 10 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/design
git commit -m "feat(design): add the bottle counter component"
```

---

### Task 11: `HealthWarning` and the rules page

**Files:**

- Create: `packages/design/src/components/HealthWarning/HealthWarning.tsx`, `HealthWarning.stories.tsx`
- Create: `packages/design/src/docs/Rules.mdx`
- Modify: `packages/design/src/index.ts`
- Test: `packages/design/tests/unit/HealthWarning.unit.test.tsx`

**Interfaces:**

- Consumes: `cn`, `text-legal` token.
- Produces: `HEALTH_WARNING: string`, and `HealthWarning({ tone?: 'paper' | 'black'; className?: string })`. There is no `children` prop.

- [ ] **Step 1: Write the failing test**

`packages/design/tests/unit/HealthWarning.unit.test.tsx`:

```tsx
import { readFileSync } from 'node:fs';

import { render, screen } from '@testing-library/react';

import { HEALTH_WARNING, HealthWarning } from '@aphralab/design';

const WARNING =
  "L'abus d'alcool est dangereux pour la santé, à consommer avec modération.";

describe('HealthWarning', () => {
  it('shows the loi Évin sentence word for word', () => {
    render(<HealthWarning />);

    expect(HEALTH_WARNING).toBe(WARNING);
    expect(screen.getByText(WARNING)).toBeInTheDocument();
  });

  it('uses ink on paper by default and paper on black', () => {
    const { rerender } = render(<HealthWarning />);
    expect(screen.getByText(WARNING)).toHaveClass('text-ink');

    rerender(<HealthWarning tone="black" />);
    expect(screen.getByText(WARNING)).toHaveClass('text-paper');
  });

  it('is at least 12 px and keeps sentence case', () => {
    render(<HealthWarning />);

    expect(screen.getByText(WARNING)).toHaveClass('text-legal');
    expect(screen.getByText(WARNING)).not.toHaveClass('uppercase');
    expect(
      readFileSync('packages/design/src/tokens/tokens.css', 'utf8'),
    ).toMatch(/--text-legal:\s*0\.75rem;/);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run packages/design/tests/unit/HealthWarning.unit.test.tsx` Expected: FAIL. `HealthWarning` is `undefined`.

- [ ] **Step 3: Write the component, the story and the rules page**

`packages/design/src/components/HealthWarning/HealthWarning.tsx`:

```tsx
import { cn } from '../../utils/cn';

export const HEALTH_WARNING =
  "L'abus d'alcool est dangereux pour la santé, à consommer avec modération.";

const TONES = { paper: 'text-ink', black: 'text-paper' } as const;

export interface HealthWarningProps {
  tone?: keyof typeof TONES;
  className?: string;
}

export function HealthWarning({
  tone = 'paper',
  className,
}: HealthWarningProps) {
  return (
    <p className={cn('font-mono text-legal', TONES[tone], className)}>
      {HEALTH_WARNING}
    </p>
  );
}
```

`packages/design/src/components/HealthWarning/HealthWarning.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { HealthWarning } from './HealthWarning';

const meta = {
  title: 'Compliance/HealthWarning',
  component: HealthWarning,
} satisfies Meta<typeof HealthWarning>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnPaper: Story = {};
export const OnBlack: Story = {
  args: { tone: 'black' },
  decorators: [
    (Story) => (
      <div className="bg-black p-8">
        <Story />
      </div>
    ),
  ],
};
```

`packages/design/src/docs/Rules.mdx`:

```mdx
import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Foundations/Rules" />

# Rules

## Health warning

Every page shows `HealthWarning`: "L'abus d'alcool est dangereux pour la santé, à consommer avec modération." Legal basis: loi Évin, Code de la santé publique, article L3323-4. `LetterPage` and `AgeGate` include it. Its text cannot be changed.

## Age gate

The site is wrapped in `AgeGate`. The site content is not rendered before OUI. NON leaves the site.

## Product copy

Advertising for alcohol stays objective: degree, origin, name, composition, producer, production method, sale terms, way of drinking, smell and taste.

## Magnolia Cora Script

The MyFonts desktop and web licences forbid:

- a Magnolia file in any git repository, public or private
- converting the font to another format
- uploading it to a design or authoring tool
- giving it to people outside the company.

Only `aphralab.com` may serve the webfont. Everywhere else, `font-script` shows the fallback.
```

Add to `packages/design/src/index.ts`:

```ts
export {
  HEALTH_WARNING,
  HealthWarning,
} from './components/HealthWarning/HealthWarning';
export type { HealthWarningProps } from './components/HealthWarning/HealthWarning';
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run packages/design/tests/unit/HealthWarning.unit.test.tsx` Expected: PASS, 3 tests.

- [ ] **Step 5: Run the full gate and commit**

Run: `npm run check && npm run build-storybook --workspace @aphralab/design` Expected: PASS.

```bash
git add packages/design
git commit -m "feat(design): add the health warning and the rules page"
```

Open PR 3 (`feat/design-kit-primitives`, title `feat(design): add the design kit primitives`). Stop until it is merged.

---

### Task 12: Consent helpers

**Files:**

- Create: `packages/design/src/consent/useAgeConsent.ts`, `packages/design/src/consent/leaveSite.ts`
- Modify: `packages/design/src/index.ts`
- Test: `packages/design/tests/unit/consent.unit.test.ts`

**Interfaces:**

- Consumes: nothing.
- Produces:
  - `AGE_CONSENT_KEY = 'aphra.age-consent'`
  - `useAgeConsent(): { accepted: boolean; accept: () => void }`
  - `interface LeaveSiteWindow { document: { referrer: string }; history: { length: number; back: () => void }; location: { origin: string; replace: (url: string) => void } }`. Property function types keep typescript-eslint `unbound-method` quiet in the tests
  - `leaveSite(exitUrl?: string, win?: LeaveSiteWindow): void`, default `exitUrl` `'about:blank'`

- [ ] **Step 1: Write the failing test**

`packages/design/tests/unit/consent.unit.test.ts`:

```ts
import { act, renderHook } from '@testing-library/react';

import { AGE_CONSENT_KEY, leaveSite, useAgeConsent } from '@aphralab/design';
import type { LeaveSiteWindow } from '../../src/consent/leaveSite';

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe('useAgeConsent', () => {
  it('starts without consent and remembers OUI', () => {
    const { result } = renderHook(() => useAgeConsent());
    expect(result.current.accepted).toBe(false);

    act(() => result.current.accept());

    expect(result.current.accepted).toBe(true);
    expect(window.localStorage.getItem(AGE_CONSENT_KEY)).toMatch(
      /^\d{4}-\d{2}-\d{2}T/,
    );
  });

  it('starts with consent when it is stored', () => {
    window.localStorage.setItem(AGE_CONSENT_KEY, '2026-09-30T10:00:00.000Z');

    expect(renderHook(() => useAgeConsent()).result.current.accepted).toBe(
      true,
    );
  });

  it('treats a storage read error as no consent', () => {
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });

    expect(renderHook(() => useAgeConsent()).result.current.accepted).toBe(
      false,
    );
  });

  it('accepts for this visit when storage cannot be written', () => {
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    const { result } = renderHook(() => useAgeConsent());

    act(() => result.current.accept());

    expect(result.current.accepted).toBe(true);
  });
});

function fakeWindow(referrer: string, historyLength: number) {
  const win: LeaveSiteWindow = {
    document: { referrer },
    history: { length: historyLength, back: vi.fn() },
    location: { origin: 'https://aphralab.com', replace: vi.fn() },
  };
  return win;
}

describe('leaveSite', () => {
  it('goes back when the visitor came from another site', () => {
    const win = fakeWindow('https://www.google.com/search?q=aphra', 2);

    leaveSite('about:blank', win);

    expect(win.history.back).toHaveBeenCalledOnce();
    expect(win.location.replace).not.toHaveBeenCalled();
  });

  it.each([
    ['no referrer', '', 2],
    ['a same-site referrer', 'https://aphralab.com/', 2],
    ['a malformed referrer', 'not a url', 2],
    ['no earlier history entry', 'https://www.google.com/', 1],
  ])('replaces the location with %s', (_case, referrer, historyLength) => {
    const win = fakeWindow(referrer, historyLength);

    leaveSite('https://example.org/', win);

    expect(win.location.replace).toHaveBeenCalledWith('https://example.org/');
    expect(win.history.back).not.toHaveBeenCalled();
  });

  it('uses about:blank by default', () => {
    const win = fakeWindow('', 1);

    leaveSite(undefined, win);

    expect(win.location.replace).toHaveBeenCalledWith('about:blank');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run packages/design/tests/unit/consent.unit.test.ts` Expected: FAIL. `useAgeConsent` is not a function.

- [ ] **Step 3: Write the helpers**

`packages/design/src/consent/useAgeConsent.ts`:

```ts
import { useCallback, useState } from 'react';

export const AGE_CONSENT_KEY = 'aphra.age-consent';

function readConsent() {
  try {
    return window.localStorage.getItem(AGE_CONSENT_KEY) !== null;
  } catch {
    return false;
  }
}

function writeConsent() {
  try {
    window.localStorage.setItem(AGE_CONSENT_KEY, new Date().toISOString());
  } catch {
    // Storage blocked: consent lasts for this visit only.
  }
}

export function useAgeConsent() {
  const [accepted, setAccepted] = useState(readConsent);
  const accept = useCallback(() => {
    writeConsent();
    setAccepted(true);
  }, []);
  return { accepted, accept };
}
```

`packages/design/src/consent/leaveSite.ts`:

```ts
export interface LeaveSiteWindow {
  document: { referrer: string };
  history: { length: number; back: () => void };
  location: { origin: string; replace: (url: string) => void };
}

function cameFromAnotherSite(win: LeaveSiteWindow) {
  if (!win.document.referrer) return false;
  try {
    return new URL(win.document.referrer).origin !== win.location.origin;
  } catch {
    return false;
  }
}

export function leaveSite(
  exitUrl = 'about:blank',
  win: LeaveSiteWindow = window,
) {
  if (cameFromAnotherSite(win) && win.history.length > 1) {
    win.history.back();
    return;
  }
  win.location.replace(exitUrl);
}
```

Add to `packages/design/src/index.ts`:

```ts
export { AGE_CONSENT_KEY, useAgeConsent } from './consent/useAgeConsent';
export { leaveSite } from './consent/leaveSite';
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run packages/design/tests/unit/consent.unit.test.ts` Expected: PASS, 10 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/design
git commit -m "feat(design): add the age consent and leave-site helpers"
```

---

### Task 13: `Header`

**Files:**

- Create: `packages/design/src/components/Header/Header.tsx`, `Header.stories.tsx`
- Modify: `packages/design/src/index.ts`
- Test: `packages/design/tests/unit/Header.unit.test.tsx`

**Interfaces:**

- Consumes: `Logo` (Task 7), `Text` (Task 6), `BottleCounter` (Task 10), `cn`.
- Produces: `TAGLINE: readonly ['BOISSON DU XVIIe', 'REPENSÉE POUR LE XXIe']`, and `Header({ menuOpen: boolean; onMenuToggle: () => void; bottlesSold?: number; className?: string })`.

- [ ] **Step 1: Write the failing test**

`packages/design/tests/unit/Header.unit.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Header } from '@aphralab/design';

describe('Header', () => {
  it('shows the menu button, the logo, the tagline and the counter', () => {
    render(
      <Header menuOpen={false} onMenuToggle={vi.fn()} bottlesSold={450} />,
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'MENU' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByRole('img', { name: 'Aphra' })).toBeInTheDocument();
    expect(screen.getByText(/BOISSON DU XVIIe/)).toHaveTextContent(
      'BOISSON DU XVIIeREPENSÉE POUR LE XXIe',
    );
    expect(screen.getByText('000450')).toBeInTheDocument();
  });

  it('reports the menu state and toggles it', async () => {
    const onMenuToggle = vi.fn();
    render(<Header menuOpen onMenuToggle={onMenuToggle} />);

    const menu = screen.getByRole('button', { name: 'MENU' });
    expect(menu).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(menu);

    expect(onMenuToggle).toHaveBeenCalledOnce();
  });

  it('shows the counter placeholder until the number arrives', () => {
    render(<Header menuOpen={false} onMenuToggle={vi.fn()} />);

    expect(screen.getByText('——————')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run packages/design/tests/unit/Header.unit.test.tsx` Expected: FAIL. `Header` is `undefined`.

- [ ] **Step 3: Write the component**

`packages/design/src/components/Header/Header.tsx`:

```tsx
import { cn } from '../../utils/cn';
import { BottleCounter } from '../BottleCounter/BottleCounter';
import { Logo } from '../Logo/Logo';
import { Text } from '../Text/Text';

export const TAGLINE = ['BOISSON DU XVIIe', 'REPENSÉE POUR LE XXIe'] as const;

export interface HeaderProps {
  menuOpen: boolean;
  onMenuToggle: () => void;
  bottlesSold?: number;
  className?: string;
}

export function Header({
  menuOpen,
  onMenuToggle,
  bottlesSold,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'grid grid-cols-[1fr_auto_1fr] items-start gap-4 pt-12',
        className,
      )}
    >
      <button
        type="button"
        aria-expanded={menuOpen}
        onClick={onMenuToggle}
        className="justify-self-start pt-6 font-mono text-nav text-ink outline-none focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink md:pt-10"
      >
        MENU
      </button>
      <div className="flex flex-col items-center gap-4">
        <Logo variant="wordmark" className="h-12 md:h-20" />
        <Text variant="caption" className="text-center">
          {TAGLINE[0]}
          <br />
          {TAGLINE[1]}
        </Text>
      </div>
      <BottleCounter
        value={bottlesSold}
        className="justify-self-end pt-6 md:pt-10"
      />
    </header>
  );
}
```

`packages/design/src/components/Header/Header.stories.tsx`:

```tsx
import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Header, type HeaderProps } from './Header';

function HeaderDemo(props: HeaderProps) {
  const [open, setOpen] = useState(props.menuOpen);
  return (
    <div className="mx-auto max-w-letter px-20">
      <Header {...props} menuOpen={open} onMenuToggle={() => setOpen(!open)} />
    </div>
  );
}

const meta = {
  title: 'Layout/Header',
  component: Header,
  parameters: { layout: 'fullscreen' },
  args: { menuOpen: false, onMenuToggle: () => undefined, bottlesSold: 450 },
  render: (args) => <HeaderDemo {...args} />,
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const CounterLoading: Story = { args: { bottlesSold: undefined } };
```

Add to `packages/design/src/index.ts`:

```ts
export { Header, TAGLINE } from './components/Header/Header';
export type { HeaderProps } from './components/Header/Header';
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run packages/design/tests/unit/Header.unit.test.tsx` Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/design
git commit -m "feat(design): add the header component"
```

---

### Task 14: `LetterPage`

**Files:**

- Create: `packages/design/src/components/LetterPage/LetterPage.tsx`, `LetterPage.stories.tsx`
- Modify: `packages/design/src/index.ts`
- Test: `packages/design/tests/unit/LetterPage.unit.test.tsx`

**Interfaces:**

- Consumes: `HealthWarning` (Task 11), `cn`. The story also uses `Header`, `CircledLink` and `Signature`.
- Produces: `LetterPage({ header?: ReactNode; children: ReactNode; signOff?: ReactNode; address?: ReactNode; className?: string })`.

- [ ] **Step 1: Write the failing test**

`packages/design/tests/unit/LetterPage.unit.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import { HEALTH_WARNING, LetterPage } from '@aphralab/design';

describe('LetterPage', () => {
  it('lays out the header, the letter, the sign-off and the address', () => {
    render(
      <LetterPage
        header={<p>En-tête</p>}
        signOff={<p>Sobrement,</p>}
        address={<>Aphra SAS</>}
      >
        <p>Bienvenue,</p>
      </LetterPage>,
    );

    expect(screen.getByText('En-tête')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('Bienvenue,');
    expect(screen.getByText('Sobrement,')).toBeInTheDocument();
    expect(screen.getByText('Aphra SAS').closest('address')).not.toBeNull();
  });

  it('always shows the health warning, even with only a letter', () => {
    render(
      <LetterPage>
        <p>Bienvenue,</p>
      </LetterPage>,
    );

    expect(screen.getByRole('contentinfo')).toHaveTextContent(HEALTH_WARNING);
    expect(document.querySelector('address')).toBeNull();
  });

  it('draws the ruled column on paper', () => {
    const { container } = render(
      <LetterPage>
        <p>Bienvenue,</p>
      </LetterPage>,
    );

    expect(container.firstChild).toHaveClass('bg-paper', 'text-ink');
    expect(container.firstChild?.firstChild).toHaveClass(
      'border-x',
      'border-ink',
      'md:max-w-letter',
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run packages/design/tests/unit/LetterPage.unit.test.tsx` Expected: FAIL. `LetterPage` is `undefined`.

- [ ] **Step 3: Write the component**

`packages/design/src/components/LetterPage/LetterPage.tsx`:

```tsx
import type { ReactNode } from 'react';

import { cn } from '../../utils/cn';
import { HealthWarning } from '../HealthWarning/HealthWarning';

export interface LetterPageProps {
  header?: ReactNode;
  children: ReactNode;
  signOff?: ReactNode;
  address?: ReactNode;
  className?: string;
}

const MEASURE = 'mx-auto w-full max-w-measure font-mono text-body';

export function LetterPage({
  header,
  children,
  signOff,
  address,
  className,
}: LetterPageProps) {
  return (
    <div className={cn('min-h-screen bg-paper text-ink', className)}>
      <div className="mx-4 flex min-h-screen flex-col border-x border-ink px-4 md:mx-auto md:max-w-letter md:px-20">
        {header}
        <main className={cn(MEASURE, 'flex-1 space-y-6 py-24')}>
          {children}
        </main>
        {signOff && <div className={MEASURE}>{signOff}</div>}
        {address && (
          <address className={cn(MEASURE, 'py-16 not-italic')}>
            {address}
          </address>
        )}
        <footer className="mx-auto w-full max-w-measure pb-8">
          <HealthWarning />
        </footer>
      </div>
    </div>
  );
}
```

`packages/design/src/components/LetterPage/LetterPage.stories.tsx` is wireframe 3, verbatim:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { CircledLink } from '../CircledLink/CircledLink';
import { Header } from '../Header/Header';
import { Signature } from '../Signature/Signature';
import { LetterPage } from './LetterPage';

const meta = {
  title: 'Layout/LetterPage',
  component: LetterPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof LetterPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Wireframe: Story = {
  args: {
    header: (
      <Header
        menuOpen={false}
        onMenuToggle={() => undefined}
        bottlesSold={450}
      />
    ),
    signOff: (
      <>
        <p>Sobrement,</p>
        <Signature team className="ml-[45%] mt-6" />
      </>
    ),
    address: (
      <>
        Aphra SAS,
        <br />
        23-31 impasse Prudhon,
        <br />
        94200 Ivry sur Seine
      </>
    ),
    children: (
      <>
        <p>
          Bienvenue,
          <br />
          Vous êtes sur le site internet d’Aphra.
          <br />
          Marque de boisson de dégustation fabriquée à l’aide d’une{' '}
          <CircledLink href="#" shape={1}>
            technique
          </CircledLink>{' '}
          de clarification artisanale.
        </p>
        <p>
          Ici, vous pouvez découvrir nos différentes{' '}
          <CircledLink href="#" shape={2}>
            recettes
          </CircledLink>{' '}
          signatures.
        </p>
        <p>
          Nous travaillons main dans la main avec différents{' '}
          <CircledLink href="#" shape={3}>
            partenaires
          </CircledLink>{' '}
          à Paris et worldwide.
        </p>
        <p>
          Pour plus amples informations, n’hésitez pas à nous{' '}
          <CircledLink href="#" shape={1}>
            contacter
          </CircledLink>{' '}
          pour que l’on se contacte.
        </p>
      </>
    ),
  },
};
```

Add to `packages/design/src/index.ts`:

```ts
export { LetterPage } from './components/LetterPage/LetterPage';
export type { LetterPageProps } from './components/LetterPage/LetterPage';
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run packages/design/tests/unit/LetterPage.unit.test.tsx` Expected: PASS, 3 tests.

- [ ] **Step 5: Check in Storybook against wireframe 3**

Open `Layout/LetterPage` → `Wireframe` next to `packages/design/sources/WIREFRAMES/WIREFRAME_3.jpg`. Check:

- the column rules
- the centred logo and tagline, with MENU on the left and 000450 on the right
- the text measure
- the circled words
- the signature
- the address.

Resize to 375 px: nothing scrolls sideways.

- [ ] **Step 6: Commit**

```bash
git add packages/design
git commit -m "feat(design): add the letter page layout"
```

---

### Task 15: `Envelope` and `AgeGate`

**Files:**

- Create: `packages/design/src/components/Envelope/Envelope.tsx` (internal)
- Create: `packages/design/src/components/AgeGate/AgeGate.tsx`, `AgeGate.stories.tsx`
- Modify: `packages/design/src/index.ts`
- Test: `packages/design/tests/unit/Envelope.unit.test.tsx`, `packages/design/tests/unit/AgeGate.unit.test.tsx`

**Interfaces:**

- Consumes: `Logo`, `Logomark` (Task 7); `HealthWarning` (Task 11); `useAgeConsent`, `leaveSite` (Task 12); `cn`.
- Produces:
  - internal `Envelope({ state: 'closed' | 'opening'; children?: ReactNode; onCardAnimationEnd?: AnimationEventHandler<HTMLDivElement> })`, with parts `data-part="card"` and `data-part="flap"`
  - `AGE_DECLARATION: string`
  - `AgeGate({ children: ReactNode; exitUrl?: string })`
  - internal `GateScreen({ children })`, which renders the black screen and `HealthWarning tone="black"`

- [ ] **Step 1: Write the failing tests**

`packages/design/tests/unit/Envelope.unit.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import { Envelope } from '../../src/components/Envelope/Envelope';

function part(container: HTMLElement, name: string) {
  const element = container.querySelector(`[data-part="${name}"]`);
  if (!(element instanceof HTMLElement)) throw new Error(`${name} not found`);
  return element;
}

describe('Envelope', () => {
  it('is decorative and keeps its content accessible', () => {
    const { container } = render(
      <Envelope state="closed">
        <button type="button">OUI</button>
      </Envelope>,
    );

    expect(screen.getByRole('button', { name: 'OUI' })).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
    expect(part(container, 'card')).toHaveAttribute('aria-hidden', 'true');
    expect(part(container, 'flap')).toHaveAttribute('aria-hidden', 'true');
  });

  it('animates only when opening', () => {
    const { container, rerender } = render(<Envelope state="closed" />);
    expect(part(container, 'flap').className).not.toContain('animate-');

    rerender(<Envelope state="opening" />);
    expect(part(container, 'flap')).toHaveClass(
      'motion-safe:animate-flap-open',
    );
    expect(part(container, 'card')).toHaveClass(
      'motion-safe:animate-card-rise',
    );
  });

  it('gives each envelope its own grain filter id', () => {
    const { container } = render(
      <>
        <Envelope state="closed" />
        <Envelope state="closed" />
      </>,
    );

    const ids = [...container.querySelectorAll('filter')].map(
      (filter) => filter.id,
    );
    expect(ids.length).toBeGreaterThan(1);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

`packages/design/tests/unit/AgeGate.unit.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  AGE_CONSENT_KEY,
  AGE_DECLARATION,
  AgeGate,
  HEALTH_WARNING,
} from '@aphralab/design';

import { leaveSite } from '../../src/consent/leaveSite';

vi.mock('../../src/consent/leaveSite', () => ({ leaveSite: vi.fn() }));

afterEach(() => {
  vi.restoreAllMocks();
  vi.mocked(leaveSite).mockClear();
  window.localStorage.clear();
});

function renderGate(exitUrl?: string) {
  return render(
    <AgeGate exitUrl={exitUrl}>
      <p>Le site</p>
    </AgeGate>,
  );
}

describe('AgeGate', () => {
  it('asks for the legal age and renders no site content before consent', () => {
    renderGate();

    expect(
      screen.getByRole('dialog', { name: AGE_DECLARATION }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Le site')).toBeNull();
    expect(screen.getByRole('button', { name: 'OUI' })).toHaveFocus();
    expect(screen.getByText(HEALTH_WARNING)).toHaveClass('text-paper');
  });

  it('shows the site after OUI and remembers it', async () => {
    renderGate();

    await userEvent.click(screen.getByRole('button', { name: 'OUI' }));

    expect(screen.getByText('Le site')).toBeInTheDocument();
    expect(window.localStorage.getItem(AGE_CONSENT_KEY)).not.toBeNull();
  });

  it('shows the site at once when consent is stored', () => {
    window.localStorage.setItem(AGE_CONSENT_KEY, '2026-09-30T10:00:00.000Z');
    renderGate();

    expect(screen.getByText('Le site')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('leaves the site on NON', async () => {
    renderGate('https://example.org/');

    await userEvent.click(screen.getByRole('button', { name: 'NON' }));

    expect(leaveSite).toHaveBeenCalledWith('https://example.org/');
    expect(screen.queryByText('Le site')).toBeNull();
  });

  it('still works when storage is blocked', async () => {
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    renderGate();

    await userEvent.click(screen.getByRole('button', { name: 'OUI' }));

    expect(screen.getByText('Le site')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run packages/design/tests/unit/Envelope.unit.test.tsx packages/design/tests/unit/AgeGate.unit.test.tsx` Expected: FAIL. `Failed to resolve import "../../src/components/Envelope/Envelope"`.

- [ ] **Step 3: Write the envelope artwork**

`packages/design/src/components/Envelope/Envelope.tsx`. The geometry is measured on wireframe 1 (the envelope is 566 × 773 px there):

```tsx
import { useId, type AnimationEventHandler, type ReactNode } from 'react';

import { cn } from '../../utils/cn';
import { Logo } from '../Logo/Logo';
import { Logomark } from '../Logomark/Logomark';

export type EnvelopeState = 'closed' | 'opening';

export interface EnvelopeProps {
  state: EnvelopeState;
  children?: ReactNode;
  onCardAnimationEnd?: AnimationEventHandler<HTMLDivElement>;
}

const WIDTH = 566;
const HEIGHT = 773;
const FLAP = 228;
const LINE = 'fill-none stroke-ink';

function Grain({ id, y, height }: { id: string; y: number; height: number }) {
  return (
    <>
      <filter id={id}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.85"
          numOctaves={3}
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect
        x={0}
        y={y}
        width={WIDTH}
        height={height}
        filter={`url(#${id})`}
        opacity={0.06}
      />
    </>
  );
}

function Eyelet({ x, y }: { x: number; y: number }) {
  return (
    <g className="fill-paper stroke-ink" strokeWidth={1}>
      <circle cx={x} cy={y} r={44} />
      <circle cx={x} cy={y} r={9} />
      <circle cx={x} cy={y} r={4.5} className="fill-ink" />
    </g>
  );
}

export function Envelope({
  state,
  children,
  onCardAnimationEnd,
}: EnvelopeProps) {
  const grainId = `aphra-grain-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const opening = state === 'opening';

  return (
    <div className="relative aspect-[566/773] w-full perspective-distant">
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="absolute inset-0 size-full"
      >
        <rect
          x={0.5}
          y={0.5}
          width={WIDTH - 1}
          height={HEIGHT - 1}
          className="fill-paper stroke-ink"
          strokeWidth={1}
        />
        <Grain id={`${grainId}-back`} y={0} height={HEIGHT} />
      </svg>

      <div
        data-part="card"
        aria-hidden="true"
        onAnimationEnd={onCardAnimationEnd}
        className={cn(
          'absolute inset-x-[7%] top-[33%] flex h-[36%] items-center justify-center border border-ink bg-paper',
          opening &&
            'motion-safe:animate-card-rise motion-reduce:-translate-y-3/4 motion-reduce:animate-fade-in',
        )}
      >
        <Logo className="h-[30%]" />
      </div>

      <svg
        aria-hidden="true"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="absolute inset-0 size-full"
      >
        <rect
          x={0.5}
          y={FLAP}
          width={WIDTH - 1}
          height={HEIGHT - FLAP - 0.5}
          className="fill-paper stroke-ink"
          strokeWidth={1}
        />
        <Grain id={`${grainId}-pocket`} y={FLAP} height={HEIGHT - FLAP} />
        <path
          d="M268 322 L262 228 M292 322 L298 228"
          className={LINE}
          strokeWidth={1.2}
        />
        <path
          d="M280 336 C232 352 128 300 96 364 S62 470 38 494"
          className={LINE}
          strokeWidth={1.2}
          strokeLinecap="round"
        />
        <Eyelet x={280} y={330} />
      </svg>

      <div aria-hidden="true" className="absolute top-[31%] left-[66%] w-[28%]">
        <Logomark face="stamp" decorative className="w-full" />
      </div>

      <div
        data-part="flap"
        aria-hidden="true"
        className={cn(
          'absolute inset-x-0 top-0 h-[29.5%] origin-top [transform-style:preserve-3d]',
          opening && 'motion-safe:animate-flap-open motion-reduce:hidden',
        )}
      >
        <svg
          viewBox={`0 0 ${WIDTH} ${FLAP}`}
          className="size-full overflow-visible"
        >
          <path
            d={`M0.5 0.5 H${WIDTH - 0.5} V${FLAP - 28} Q${WIDTH - 0.5} ${FLAP - 0.5} ${WIDTH - 28} ${FLAP - 0.5} H28 Q0.5 ${FLAP - 0.5} 0.5 ${FLAP - 28} Z`}
            className="fill-paper stroke-ink"
            strokeWidth={1}
          />
          <path
            d="M268 177 L264 227 M292 177 L296 227"
            className={LINE}
            strokeWidth={1.2}
          />
          <Eyelet x={280} y={165} />
        </svg>
      </div>

      {children && (
        <div className="absolute inset-x-[12%] bottom-[8%]">{children}</div>
      )}
    </div>
  );
}
```

The paper grain is grey noise at 6% opacity. This vector envelope is the v1 artwork. A layered file from the designer (owner input 5) can replace the drawing, and the props stay the same.

- [ ] **Step 4: Write the age gate**

`packages/design/src/components/AgeGate/AgeGate.tsx`:

```tsx
import { useId, type ReactNode } from 'react';

import { leaveSite } from '../../consent/leaveSite';
import { useAgeConsent } from '../../consent/useAgeConsent';
import { Envelope } from '../Envelope/Envelope';
import { HealthWarning } from '../HealthWarning/HealthWarning';

export const AGE_DECLARATION =
  "Je déclare sur l'honneur avoir l'âge légal afin de consulter le site aphralab.com selon les lois en vigueur dans mon pays.";

const BUTTON =
  'px-2 font-mono text-nav text-ink outline-none focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink';

export function GateScreen({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-black px-4 py-12">
      {children}
      <HealthWarning tone="black" className="text-center" />
    </div>
  );
}

export interface AgeGateProps {
  children: ReactNode;
  exitUrl?: string;
}

export function AgeGate({ children, exitUrl = 'about:blank' }: AgeGateProps) {
  const { accepted, accept } = useAgeConsent();
  const titleId = useId();

  if (accepted) return <>{children}</>;

  return (
    <GateScreen>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-[566px]"
      >
        <Envelope state="closed">
          <div className="flex flex-col items-center gap-3 border border-ink bg-paper px-3 py-2 text-center">
            <p
              id={titleId}
              className="font-mono text-caption text-ink uppercase"
            >
              {AGE_DECLARATION}
            </p>
            <div className="flex gap-12">
              <button
                type="button"
                autoFocus
                onClick={accept}
                className={BUTTON}
              >
                OUI
              </button>
              <button
                type="button"
                onClick={() => leaveSite(exitUrl)}
                className={BUTTON}
              >
                NON
              </button>
            </div>
          </div>
        </Envelope>
      </div>
    </GateScreen>
  );
}
```

`packages/design/src/components/AgeGate/AgeGate.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AGE_CONSENT_KEY } from '../../consent/useAgeConsent';
import { AgeGate } from './AgeGate';

const meta = {
  title: 'Compliance/AgeGate',
  component: AgeGate,
  parameters: { layout: 'fullscreen' },
  args: { children: <p className="p-8 font-mono text-body">Le site</p> },
  beforeEach: () => {
    window.localStorage.removeItem(AGE_CONSENT_KEY);
  },
} satisfies Meta<typeof AgeGate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

Add to `packages/design/src/index.ts`:

```ts
export { AGE_DECLARATION, AgeGate } from './components/AgeGate/AgeGate';
export type { AgeGateProps } from './components/AgeGate/AgeGate';
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run packages/design/tests/unit/Envelope.unit.test.tsx packages/design/tests/unit/AgeGate.unit.test.tsx` Expected: PASS, 8 tests.

- [ ] **Step 6: Check in Storybook against wireframe 1**

Open `Compliance/AgeGate` next to `WIREFRAME_1.jpg`. At 1280 px and at 320 px wide:

- the declaration fits inside its box
- OUI and NON are reachable with Tab
- the health warning is readable under the envelope.

Report any gap from the wireframe in the PR description, so the designer can review it.

- [ ] **Step 7: Commit**

```bash
git add packages/design
git commit -m "feat(design): add the envelope age gate"
```

---

### Task 16: `EnvelopeReveal`

**Files:**

- Create: `packages/design/src/components/EnvelopeReveal/EnvelopeReveal.tsx`, `EnvelopeReveal.stories.tsx`
- Modify: `packages/design/src/components/AgeGate/AgeGate.tsx`, `packages/design/src/index.ts`
- Test: `packages/design/tests/unit/EnvelopeReveal.unit.test.tsx`
- Modify test: `packages/design/tests/unit/AgeGate.unit.test.tsx`

**Interfaces:**

- Consumes: `Envelope` with `data-part="card"` and `data-part="flap"`, and `GateScreen` (Task 15).
- Produces: `REVEAL_FALLBACK_MS = 2500`, and `EnvelopeReveal({ onDone: () => void })`. `AgeGate` now plays the reveal between OUI and the site.

- [ ] **Step 1: Write the failing test**

`packages/design/tests/unit/EnvelopeReveal.unit.test.tsx`:

```tsx
import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EnvelopeReveal } from '@aphralab/design';

import { REVEAL_FALLBACK_MS } from '../../src/components/EnvelopeReveal/EnvelopeReveal';

function part(container: HTMLElement, name: string) {
  const element = container.querySelector(`[data-part="${name}"]`);
  if (!(element instanceof HTMLElement)) throw new Error(`${name} not found`);
  return element;
}

afterEach(() => {
  vi.useRealTimers();
});

describe('EnvelopeReveal', () => {
  it('calls onDone when the card animation ends', () => {
    const onDone = vi.fn();
    const { container } = render(<EnvelopeReveal onDone={onDone} />);

    fireEvent.animationEnd(part(container, 'card'));

    expect(onDone).toHaveBeenCalledOnce();
  });

  it('ignores the end of the flap animation', () => {
    const onDone = vi.fn();
    const { container } = render(<EnvelopeReveal onDone={onDone} />);

    fireEvent.animationEnd(part(container, 'flap'));

    expect(onDone).not.toHaveBeenCalled();
  });

  it.each(['Enter', 'Escape'])('skips to the end with %s', async (key) => {
    const onDone = vi.fn();
    render(<EnvelopeReveal onDone={onDone} />);

    await userEvent.keyboard(`{${key}}`);

    expect(onDone).toHaveBeenCalledOnce();
  });

  it('skips to the end on click', async () => {
    const onDone = vi.fn();
    const { container } = render(<EnvelopeReveal onDone={onDone} />);

    await userEvent.click(part(container, 'card'));

    expect(onDone).toHaveBeenCalledOnce();
  });

  it('calls onDone once when several triggers arrive', async () => {
    const onDone = vi.fn();
    const { container } = render(<EnvelopeReveal onDone={onDone} />);

    fireEvent.animationEnd(part(container, 'card'));
    await userEvent.keyboard('{Enter}');

    expect(onDone).toHaveBeenCalledOnce();
  });

  it('ends by itself when no animation end arrives', () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    render(<EnvelopeReveal onDone={onDone} />);

    vi.advanceTimersByTime(REVEAL_FALLBACK_MS - 1);
    expect(onDone).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);

    expect(onDone).toHaveBeenCalledOnce();
  });

  it('fades instead of moving for visitors who ask for reduced motion', () => {
    const { container } = render(<EnvelopeReveal onDone={vi.fn()} />);

    expect(part(container, 'card')).toHaveClass(
      'motion-reduce:animate-fade-in',
    );
    expect(part(container, 'flap')).toHaveClass('motion-reduce:hidden');
  });
});
```

In `packages/design/tests/unit/AgeGate.unit.test.tsx`:

- Add `fireEvent` to the `@testing-library/react` import.
- Replace the test `'shows the site after OUI and remembers it'` with:

```tsx
it('plays the envelope reveal after OUI, then shows the site', async () => {
  const { container } = renderGate();

  await userEvent.click(screen.getByRole('button', { name: 'OUI' }));

  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('status')).toHaveTextContent(
    "Ouverture de l'enveloppe",
  );
  expect(screen.queryByText('Le site')).toBeNull();
  expect(screen.getByText(HEALTH_WARNING)).toBeInTheDocument();
  expect(window.localStorage.getItem(AGE_CONSENT_KEY)).not.toBeNull();

  const card = container.querySelector('[data-part="card"]');
  if (!card) throw new Error('card not found');
  fireEvent.animationEnd(card);

  expect(screen.getByText('Le site')).toBeInTheDocument();
});
```

In the test `'still works when storage is blocked'`, add before the final `expect`:

```tsx
await userEvent.keyboard('{Enter}');
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run packages/design/tests/unit/EnvelopeReveal.unit.test.tsx packages/design/tests/unit/AgeGate.unit.test.tsx` Expected: FAIL. `EnvelopeReveal` is `undefined`, and the AgeGate test finds no `status`.

- [ ] **Step 3: Write the reveal**

`packages/design/src/components/EnvelopeReveal/EnvelopeReveal.tsx`:

```tsx
import { useCallback, useEffect, useRef, type AnimationEvent } from 'react';

import { Envelope } from '../Envelope/Envelope';

export const REVEAL_FALLBACK_MS = 2500;

export interface EnvelopeRevealProps {
  onDone: () => void;
}

export function EnvelopeReveal({ onDone }: EnvelopeRevealProps) {
  const onDoneRef = useRef(onDone);
  const finished = useRef(false);

  useEffect(() => {
    onDoneRef.current = onDone;
  });

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onDoneRef.current();
  }, []);

  useEffect(() => {
    const skipOnKey = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === 'Escape') finish();
    };
    const fallback = window.setTimeout(finish, REVEAL_FALLBACK_MS);
    window.addEventListener('keydown', skipOnKey);
    return () => {
      window.clearTimeout(fallback);
      window.removeEventListener('keydown', skipOnKey);
    };
  }, [finish]);

  const onCardEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) finish();
  };

  return (
    <div className="w-full max-w-[566px] cursor-pointer" onClick={finish}>
      <Envelope state="opening" onCardAnimationEnd={onCardEnd} />
      <p role="status" className="sr-only">
        Ouverture de l'enveloppe
      </p>
    </div>
  );
}
```

`packages/design/src/components/EnvelopeReveal/EnvelopeReveal.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { EnvelopeReveal } from './EnvelopeReveal';

const meta = {
  title: 'Compliance/EnvelopeReveal',
  component: EnvelopeReveal,
  parameters: { layout: 'fullscreen' },
  args: { onDone: fn() },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen items-center justify-center bg-black px-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EnvelopeReveal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

- [ ] **Step 4: Play the reveal in `AgeGate`**

In `packages/design/src/components/AgeGate/AgeGate.tsx`:

- Change the React import to `import { useId, useState, type ReactNode } from 'react';`.
- Add `import { EnvelopeReveal } from '../EnvelopeReveal/EnvelopeReveal';`.
- Replace the body of `AgeGate` down to the first `return` with:

```tsx
const { accepted, accept } = useAgeConsent();
const [revealing, setRevealing] = useState(false);
const titleId = useId();

if (revealing) {
  return (
    <GateScreen>
      <EnvelopeReveal onDone={() => setRevealing(false)} />
    </GateScreen>
  );
}
if (accepted) return <>{children}</>;

const onYes = () => {
  accept();
  setRevealing(true);
};
```

- Change the OUI button to `onClick={onYes}`.

Add to `packages/design/src/index.ts`:

```ts
export { EnvelopeReveal } from './components/EnvelopeReveal/EnvelopeReveal';
export type { EnvelopeRevealProps } from './components/EnvelopeReveal/EnvelopeReveal';
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run packages/design/tests/unit` Expected: PASS, every kit test.

- [ ] **Step 6: Check in Storybook against wireframe 2**

1. In `Compliance/AgeGate`, click OUI. The flap opens, the card rises with the wordmark, then "Le site" shows.
2. Turn on "reduce motion" in the OS settings and repeat. The card fades in, with no movement.
3. Compare the open state with `WIREFRAME_2.jpg`. Note the differences in the PR description.

- [ ] **Step 7: Run the full gate and commit**

Run: `npm run check && npm run build-storybook --workspace @aphralab/design` Expected: PASS.

```bash
git add packages/design
git commit -m "feat(design): add the envelope reveal after the age gate"
```

Open PR 4 (`feat/design-kit-layout`, title `feat(design): add the design kit layout and age gate`). Stop until it is merged.

---

### Task 17: The site uses the kit

**Files:**

- Modify: `src/index.css`, `src/pages/Home.tsx`, `src/main.tsx`, `index.html`
- Create: `tests/unit/design-imports.unit.test.ts`
- Modify: `tests/e2e/home.spec.ts`

**Interfaces:**

- Consumes: `@aphralab/design/tokens.css`, `HealthWarning`.
- Produces: the site styled with the brand tokens only. No Tailwind default colour is left in `src/`.

- [ ] **Step 1: Write the failing tests**

`tests/unit/design-imports.unit.test.ts`:

```ts
// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';

const PUBLIC_PATHS = /^@aphralab\/design(\/tokens\.css|\/assets\/[^/]+)?$/;

const sources = readdirSync('src', { recursive: true, encoding: 'utf8' })
  .filter((file) => /\.(ts|tsx|css)$/.test(file))
  .map((file) => ({ file, text: readFileSync(`src/${file}`, 'utf8') }));

describe('site use of the design kit', () => {
  it('imports only the public API of @aphralab/design', () => {
    const imports = sources.flatMap(({ file, text }) =>
      [...text.matchAll(/['"](@aphralab\/design[^'"]*)['"]/g)].map(
        ([, specifier]) => ({ file, specifier }),
      ),
    );

    expect(imports.length).toBeGreaterThan(0);
    expect(
      imports.filter(({ specifier }) => !PUBLIC_PATHS.test(specifier ?? '')),
    ).toEqual([]);
  });

  it('uses no Tailwind default colour', () => {
    const defaults = sources.flatMap(({ file, text }) =>
      [
        ...text.matchAll(
          /\b(?:text|bg|border|fill|stroke)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g,
        ),
      ].map(([match]) => `${file}: ${match}`),
    );

    expect(defaults).toEqual([]);
  });
});
```

In `tests/e2e/home.spec.ts`, add inside `test.describe('Home page', ...)`:

```ts
test('styles the health warning with the design kit tokens', async ({
  page,
}) => {
  await page.goto('/');

  const warning = page.getByText(WARNING);
  await expect(warning).toHaveCSS('font-size', '12px');
  await expect(warning).toHaveCSS('color', 'rgb(55, 64, 54)');
  await expect(warning).toHaveCSS('font-family', /DM Mono/);
  await expect(page.locator('main')).toHaveCSS(
    'background-color',
    'rgb(253, 252, 242)',
  );
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/unit/design-imports.unit.test.ts` Expected: FAIL. `imports.length` is 0, and `src/pages/Home.tsx: text-neutral-800` and `src/main.tsx: text-red-600` are listed.

Run: `npx playwright test tests/e2e/home.spec.ts --project chromium -g "design kit tokens"` Expected: FAIL. The font size is `14px`.

- [ ] **Step 3: Use the kit in the site**

`src/index.css`:

```css
@import 'tailwindcss';
@import '@aphralab/design/tokens.css';
@source '../packages/design/src';
```

`src/pages/Home.tsx`:

```tsx
import { HealthWarning } from '@aphralab/design';

const IMAGE_TEXT =
  "Aphra. Bienvenue, voici le site internet d'Aphra. Marque de boisson de dégustation fabriquée à l'aide d'une technique de clarification artisanale. Notre numéro de téléphone : 06 24 51 14 04. Notre mail est : contact@aphralab.com";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper p-4">
      <img
        src="/aphra-hello.jpg"
        width={1004}
        height={650}
        alt={IMAGE_TEXT}
        className="h-auto w-full max-w-[1004px]"
      />
      <HealthWarning className="text-center" />
    </main>
  );
}
```

In `src/main.tsx`, change the error fallback class from `text-red-600` to `text-red`.

In `index.html`, change `<meta name="theme-color" content="#fcfcf2" />` to `content="#fdfcf2"`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/unit` Expected: PASS, including the existing `Home` and `App` tests, since the warning text is unchanged.

Run: `npm run test:e2e` Expected: PASS on chromium, firefox and webkit.

- [ ] **Step 5: Commit**

```bash
git add src index.html tests
git commit -m "feat(site): style the site with the design kit tokens"
```

---

### Task 18: Kit documentation and brand guide

**Files:**

- Create: `packages/design/AGENTS.md`, `packages/design/README.md`
- Modify: `docs/guides/brand.md`
- Test: `packages/design/tests/unit/docs-files.unit.test.ts`

**Interfaces:**

- Consumes: everything above.
- Produces: the AI rules and the human documentation.

- [ ] **Step 1: Write the failing test**

`packages/design/tests/unit/docs-files.unit.test.ts`:

```ts
// @vitest-environment node
import { readFileSync } from 'node:fs';

import { PALETTE } from '../../src/tokens/palette';

describe('kit documentation', () => {
  it('AGENTS.md states the rules that must not break', () => {
    const rules = readFileSync('packages/design/AGENTS.md', 'utf8');

    expect(rules).toContain('@aphralab/design');
    expect(rules).toContain('HealthWarning');
    expect(rules).toMatch(/Magnolia/);
    for (const colour of PALETTE)
      expect(rules).toContain(`\`${colour.token}\``);
  });

  it('the brand guide lists the real palette and no missing files', () => {
    const guide = readFileSync('docs/guides/brand.md', 'utf8');

    expect(guide).not.toMatch(/Missing source files/);
    for (const colour of PALETTE)
      expect(guide.toLowerCase()).toContain(colour.hex);
    expect(guide).toContain('design.aphralab.com');
  });

  it('the README documents the move to npm', () => {
    expect(readFileSync('packages/design/README.md', 'utf8')).toContain(
      'git subtree split',
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run packages/design/tests/unit/docs-files.unit.test.ts` Expected: FAIL. `ENOENT ... AGENTS.md`.

- [ ] **Step 3: Write the documents**

`packages/design/AGENTS.md`:

```md
# AGENTS.md — @aphralab/design

Rules for any AI assistant that writes code with the Aphra design kit. The repository rules in `CLAUDE.md` also apply.

## Imports

- Import components and hooks from `@aphralab/design` only. Never import `@aphralab/design/src/...`.
- The site stylesheet imports `tailwindcss`, then `@aphralab/design/tokens.css`, then `@source` the kit source.

## Colours

- Only these colours exist: `paper`, `ink`, `black`, `green`, `yellow`, `brown`, `red`. Tailwind default colours such as `neutral-800` do not exist.
- On paper: body text in `ink` or `black`. `red` and `brown` pass for text. `green` is for large text only. `yellow` is never text.
- On black: text in `paper`, `yellow` or `green`.
- Recipe colours come from `RECIPES`. Do not hard-code them.

## Legal

- Every page shows `HealthWarning`. `LetterPage` and `AgeGate` already include it. Its text cannot change.
- The site is wrapped in `AgeGate`.
- Product copy stays objective (loi Évin, article L3323-4): degree, origin, composition, producer, production method, sale terms, way of drinking, smell and taste.

## Fonts

- `font-mono` is DM Mono. `font-script` is Magnolia Cora Script.
- Never add, convert, upload or commit a Magnolia font file. The MyFonts licences forbid it. Only `aphralab.com` serves the webfont.
- The "Aphra" wordmark is `Logo`, never text.

## Language

- Public copy is in French.
```

`packages/design/README.md`:

````md
# @aphralab/design

Aphra design kit: tokens, web-ready assets and React components. Storybook: https://design.aphralab.com (preview from `dev`: https://aphra-design-staging.aphralab.workers.dev).

## Use

```css
@import 'tailwindcss';
@import '@aphralab/design/tokens.css';
@source '../packages/design/src';
```

```tsx
import { AgeGate, HealthWarning, LetterPage } from '@aphralab/design';
```

## Commands

| Command | Effect |
| --- | --- |
| `npm run storybook --workspace @aphralab/design` | Storybook on http://localhost:6006 |
| `npm run build-storybook --workspace @aphralab/design` | Static build in `storybook-static/` |
| `npm run assets --workspace @aphralab/design` | Rebuild `assets/` and `src/generated/` from `sources/` |

Tests run from the repository root with `npm test`.

## Move to its own repository and npm

Do this when a second site needs the kit.

1. `git subtree split --prefix packages/design -b design-kit` in `aphra-web`.
2. Push the branch to a new repository `Aphra-lab/aphra-design`.
3. Add a library build (Vite library mode), `files`, and a `publishConfig`. Remove `"private": true`.
4. Publish `@aphralab/design` to npm with semantic-release.
5. In `aphra-web`, remove `packages/design`, remove the workspace, and depend on the published version. The site imports do not change.
````

In `docs/guides/brand.md`, replace the whole `## Visual reference` section with:

```md
## Visual identity

The design kit `packages/design` is the source of truth. Browse it at https://design.aphralab.com.

- Colours, from `COULEURS.pdf`: paper `#fdfcf2`, ink `#374036`, black `#000000`, green `#29896f`, yellow `#f59e14`, brown `#a35b1a`, red `#dd2414`.
- Recipes: gin concombre (green), rhum mangue (yellow), café calva (brown), vodka tomate (red).
- Fonts: DM Mono for text. Magnolia Cora Script for script text. The "Aphra" wordmark is a drawing, not a font.
- Logos: wordmark with or without the moon, six moon faces and one stamp texture. They are drawn in ink by default.
- Illustrations: engraved fruits with faces (concombre, mangue, pomme, poivron, tomate).
- Magnolia licence: no font file in any repository, no conversion, and no upload to a design tool (MyFonts desktop and web licences).
- Sources and wireframes: `packages/design/sources/`. First mock: `brand/mock-hello-2026-09-23.jpg`.
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run packages/design/tests/unit/docs-files.unit.test.ts` Expected: PASS, 3 tests.

- [ ] **Step 5: Run every gate and commit**

Run: `npm run check && npm run build && npm run build-storybook --workspace @aphralab/design && npm run test:e2e` Expected: PASS.

```bash
git add packages/design docs/guides/brand.md
git commit -m "docs(design): add the kit rules, readme and brand guide update"
```

Open PR 5 (`feat/site-uses-design-kit`, title `feat(site): use the design kit`). Stop until it is merged.

After the next `dev → main` release, check that `deploy-design-production` is green and that https://design.aphralab.com serves the Storybook. Then the owner runs `/design-sync` (spec, section 10).
