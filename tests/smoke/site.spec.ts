import { expect, test } from '@playwright/test';

const expectedEnvironment = process.env.EXPECTED_ENVIRONMENT;
const expectedCommit = process.env.EXPECTED_COMMIT;
const TARGET = 'https://aphralab.com/visite?source=test';

test.describe('site', { tag: '@site' }, () => {
  test('health check reports the deployed build', async ({ request }) => {
    const response = await request.get('/api/health');

    expect(response.status()).toBe(200);
    const body = (await response.json()) as {
      status: string;
      environment: string;
      commit: string;
    };
    expect(body.status).toBe('ok');
    if (expectedEnvironment) expect(body.environment).toBe(expectedEnvironment);
    if (expectedCommit) expect(body.commit).toBe(expectedCommit);
  });

  test('home page is served by Cloudflare over HTTPS', async ({ request }) => {
    const response = await request.get('/');

    expect(response.status()).toBe(200);
    expect(response.url()).toMatch(/^https:\/\//);
    expect(response.headers().server).toBe('cloudflare');
    expect(response.headers()['cf-ray']).toBeTruthy();
    expect(await response.text()).toContain('<title>Aphra</title>');
  });

  test('link preview image is served', async ({ request }) => {
    const html = await (await request.get('/')).text();
    const ogImage = /<meta property="og:image" content="([^"]+)"/.exec(
      html,
    )?.[1];
    expect(ogImage).toBe('https://aphralab.com/aphra-hello.jpg');

    const imageUrl =
      expectedEnvironment === 'production' && ogImage
        ? ogImage
        : '/aphra-hello.jpg';
    const image = await request.get(imageUrl);
    expect(image.status()).toBe(200);
    expect(image.headers()['content-type']).toBe('image/jpeg');
  });
});

test.describe('redirects', { tag: '@site' }, () => {
  test.skip(
    expectedEnvironment !== 'production',
    'domain redirects exist in production only',
  );

  const sources = [
    'http://aphralab.com/visite?source=test',
    'https://www.aphralab.com/visite?source=test',
    'http://www.aphralab.com/visite?source=test',
    'https://aphralab.fr/visite?source=test',
    'https://www.aphralab.fr/visite?source=test',
    'https://aphralab.online/visite?source=test',
    'https://www.aphralab.online/visite?source=test',
  ];

  for (const source of sources) {
    test(`${source} lands on the apex with the same path and query`, async ({
      request,
    }) => {
      const first = await request.get(source, { maxRedirects: 0 });
      expect(first.status()).toBe(301);

      const final = await request.get(source);
      expect(final.url()).toBe(TARGET);
    });
  }
});
