import { expect, test } from '@playwright/test';

const designUrl = process.env.DESIGN_BASE_URL;
const expectedCommit = process.env.EXPECTED_COMMIT;

test.describe('design kit', { tag: '@design' }, () => {
  test.skip(!designUrl, 'DESIGN_BASE_URL is not set');

  test('Storybook is served by Cloudflare over HTTPS', async ({ request }) => {
    const response = await request.get(`${designUrl}/`);

    expect(response.status()).toBe(200);
    expect(response.url()).toMatch(/^https:\/\//);
    expect(response.headers().server).toBe('cloudflare');
  });

  test('Storybook lists the foundation pages', async ({ request }) => {
    const response = await request.get(`${designUrl}/index.json`);

    expect(response.status()).toBe(200);
    const index = (await response.json()) as {
      entries: Record<string, { title: string }>;
    };
    const titles = Object.values(index.entries).map((entry) => entry.title);
    expect(titles).toContain('Foundations/Colours');
  });

  test('version.json reports the deployed build', async ({ request }) => {
    const response = await request.get(`${designUrl}/version.json`);

    expect(response.status()).toBe(200);
    const body = (await response.json()) as { commit: string };
    if (expectedCommit) expect(body.commit).toBe(expectedCommit);
    else expect(body.commit).toMatch(/^[0-9a-f]{7,40}$/);
  });
});
