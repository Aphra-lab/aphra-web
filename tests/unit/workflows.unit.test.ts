// @vitest-environment node
import { readFileSync } from 'node:fs';

describe('smoke workflow', () => {
  it('checks out main, so production runs the released smoke tests', () => {
    const workflow = readFileSync('.github/workflows/smoke.yml', 'utf8');

    expect(workflow).toMatch(
      /uses: actions\/checkout@v\d+\s+with:\s+ref: main\b/,
    );
  });
});
