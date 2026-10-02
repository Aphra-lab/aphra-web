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

  it('names the smooth script style, also without a font file', () => {
    expect(css).toContain('--font-script-smooth:');
    expect(css).toContain("'Magnolia Cora Smooth Script'");
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
