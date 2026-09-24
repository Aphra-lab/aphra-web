// @vitest-environment node
import { readFileSync } from 'node:fs';

import { parse } from 'jsonc-parser';

interface Route {
  pattern: string;
  custom_domain?: boolean;
}
interface WorkerConfig {
  name: string;
  main: string;
  workers_dev?: boolean;
  routes?: Route[];
  vars?: Record<string, string>;
  assets?: { not_found_handling?: string; run_worker_first?: string[] };
  env?: Record<string, Omit<WorkerConfig, 'env'>>;
}

const config = parse(readFileSync('wrangler.jsonc', 'utf8')) as WorkerConfig;

describe('wrangler.jsonc', () => {
  it('serves production on the apex domain only', () => {
    expect(config.name).toBe('aphra-web');
    expect(config.workers_dev).toBe(false);
    expect(config.routes).toEqual([
      { pattern: 'aphralab.com', custom_domain: true },
    ]);
    expect(config.vars).toEqual({
      ENVIRONMENT: 'production',
      COMMIT_SHA: 'local',
    });
  });

  it('runs the Worker first for the API and falls back to the app', () => {
    expect(config.main).toBe('./worker/index.ts');
    expect(config.assets).toEqual({
      not_found_handling: 'single-page-application',
      run_worker_first: ['/api', '/api/*'],
    });
  });

  it('keeps staging off the production domain', () => {
    const staging = config.env?.staging;

    expect(staging?.workers_dev).toBe(true);
    expect(staging?.routes).toEqual([]);
    expect(staging?.vars).toEqual({
      ENVIRONMENT: 'staging',
      COMMIT_SHA: 'local',
    });
  });
});
