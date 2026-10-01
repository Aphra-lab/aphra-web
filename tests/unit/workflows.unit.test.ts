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

const ci = readFileSync('.github/workflows/ci.yml', 'utf8');

function job(name: string) {
  const start = ci.indexOf(`\n  ${name}:\n`);
  if (start === -1) throw new Error(`job ${name} not found`);
  const rest = ci.slice(start + 1);
  const next = rest.slice(1).search(/\n {2}[a-z][a-z0-9-]*:\n/);
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
