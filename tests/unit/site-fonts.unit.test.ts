// @vitest-environment node
import { readFileSync } from 'node:fs';

const css = readFileSync('src/index.css', 'utf8');
const tokens = readFileSync('packages/design/src/tokens/tokens.css', 'utf8');

const firstFamily = (token: string) =>
  new RegExp(`--${token}:\\s*'([^']+)'`).exec(tokens)?.[1];

const fontFaces = [...css.matchAll(/@font-face\s*{([^}]*)}/g)].map(
  ([, body]) => body,
);
const faceFor = (family: string) =>
  fontFaces.find((body) => body.includes(`font-family: '${family}'`));

describe('Magnolia webfont in the site', () => {
  it.each([
    ['font-script', 'magnolia-cora-script.woff2'],
    ['font-script-smooth', 'magnolia-cora-smooth-script.woff2'],
  ])(
    'declares the %s family: installed copy first, then /fonts/%s',
    (token, file) => {
      const family = firstFamily(token);
      expect(family).toMatch(/^Magnolia Cora/);

      const face = faceFor(family!);
      expect(face).toBeDefined();
      expect(face?.replace(/\s+/g, ' ')).toContain(
        `src: local('${family}'), url('/fonts/${file}') format('woff2');`,
      );
      expect(face).toContain('font-display: swap;');
    },
  );

  it('keeps the MyFonts licence notice as a preserved comment before the fonts', () => {
    const notice = css.indexOf('/*!');

    expect(notice).toBeGreaterThan(-1);
    expect(notice).toBeLessThan(css.indexOf('@font-face'));
    expect(css).toContain('@license');
    expect(css).toContain('MyFonts Webfont Build ID 3867246');
    expect(css).toContain(
      'Webfont: Magnolia Cora Script Regular by Get Studio',
    );
    expect(css).toContain('Webfont: Magnolia Cora Script Smooth by Get Studio');
  });

  it('declares no other webfont', () => {
    expect(fontFaces).toHaveLength(2);
  });
});
