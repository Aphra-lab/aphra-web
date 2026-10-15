import { writeFileSync } from 'node:fs';

const commit = process.env.COMMIT_SHA ?? 'local';
writeFileSync(
  new URL('../storybook-static/version.json', import.meta.url),
  `${JSON.stringify({ commit })}\n`,
);
