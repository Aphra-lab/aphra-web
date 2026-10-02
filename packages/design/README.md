# @aphralab/design

Aphra design kit: tokens, web-ready assets and React components. Storybook: https://design.aphralab.com (preview from `dev`: https://aphra-design-staging.aphralab.workers.dev).

## Use

```css
@import 'tailwindcss' source(none);
@import '@aphralab/design/tokens.css';
@source '.';
@source '../packages/design/src';
```

With `source(none)`, Tailwind scans only the listed paths, so a site file outside them needs its own `@source` line.

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
