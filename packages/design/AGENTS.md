# AGENTS.md — @aphralab/design

Rules for any AI assistant that writes code with the Aphra design kit. The repository rules in `CLAUDE.md` also apply.

## Imports

- Import components and hooks from `@aphralab/design` only. Never import `@aphralab/design/src/...`.
- The site stylesheet, `src/index.css`, has these four lines:

  ```css
  @import 'tailwindcss' source(none);
  @import '@aphralab/design/tokens.css';
  @source '.';
  @source '../packages/design/src';
  ```

  With `source(none)`, Tailwind scans only the listed paths, so a site file outside them needs its own `@source` line.

## Colours

- Only these colours exist: `paper`, `ink`, `black`, `green`, `yellow`, `brown`, `red`. Tailwind default colours such as `neutral-800` do not exist.
- On paper: body text in `ink` or `black`. `red` and `brown` pass for text. `green` is for large text only. `yellow` is never text.
- On black: text in `paper`, `yellow` or `green`.
- Recipe colours come from `RECIPES`. Do not hard-code them.
- No corner radius and no shadow (spec section 5.5): do not use `rounded-*` or `shadow-*` utilities.

## Legal

- Every page shows `HealthWarning`. `LetterPage` and `AgeGate` already include it. Its text cannot change.
- `AgeGate` must wrap every Aphra site before launch. `aphra-web` does not use it yet (sub-project 4).
- Product copy stays objective (loi Évin, article L3323-4): degree, origin, composition, producer, production method, sale terms, way of drinking, smell and taste.

## Fonts

- `font-mono` is DM Mono. `font-script` is Magnolia Cora Script.
- Never add, convert, upload or commit a Magnolia font file. The MyFonts licences forbid it. Only `aphralab.com` may serve the webfont. No site serves it yet (sub-project 2).
- The "Aphra" wordmark is `Logo`, never text.

## Language

- Public copy is in French.
