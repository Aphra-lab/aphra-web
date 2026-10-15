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
