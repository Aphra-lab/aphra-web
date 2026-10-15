// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';

import { parse } from 'jsonc-parser';

interface WorkerConfig {
  name: string;
  main?: string;
  workers_dev?: boolean;
  routes?: { pattern: string; custom_domain?: boolean }[];
  assets?: { directory?: string };
  env?: Record<string, { workers_dev?: boolean; routes?: unknown[] }>;
}

const config = parse(
  readFileSync('packages/design/wrangler.jsonc', 'utf8'),
) as WorkerConfig;

describe('aphra-design Worker', () => {
  it('serves only the Storybook build, with no script', () => {
    expect(config.name).toBe('aphra-design');
    expect(config.main).toBeUndefined();
    expect(config.assets).toEqual({ directory: './storybook-static' });
  });

  it('serves production on design.aphralab.com only', () => {
    expect(config.workers_dev).toBe(false);
    expect(config.routes).toEqual([
      { pattern: 'design.aphralab.com', custom_domain: true },
    ]);
  });

  it('keeps staging on workers.dev', () => {
    expect(config.env?.staging).toEqual({ workers_dev: true, routes: [] });
  });
});

describe('write-version script', () => {
  it('writes the commit into the Storybook build', () => {
    mkdirSync('packages/design/storybook-static', { recursive: true });
    execFileSync('node', ['packages/design/scripts/write-version.mjs'], {
      env: { ...process.env, COMMIT_SHA: 'abc123' },
    });

    expect(
      JSON.parse(
        readFileSync('packages/design/storybook-static/version.json', 'utf8'),
      ),
    ).toEqual({ commit: 'abc123' });
  });
});
