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
