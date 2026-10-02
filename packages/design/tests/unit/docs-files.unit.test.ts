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
