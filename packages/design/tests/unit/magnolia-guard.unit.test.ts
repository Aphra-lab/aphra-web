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
